from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse
import tempfile
import os
from typing import Optional
import uuid
import warnings
import asyncio
import json
from collections import defaultdict

# Suppress ChromaDB telemetry warnings
warnings.filterwarnings("ignore", message=".*capture.*takes 1 positional argument.*")
# Suppress PyTorch pin_memory warning (expected on CPU-only environments)
warnings.filterwarnings("ignore", message=".*pin_memory.*")
# Suppress transformers cache deprecation warning
warnings.filterwarnings("ignore", message=".*TRANSFORMERS_CACHE.*deprecated.*")

from docling.document_converter import DocumentConverter
from docling.chunking import HybridChunker
from docling_core.transforms.chunker.tokenizer.huggingface import HuggingFaceTokenizer
from pypdf import PdfReader
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer
import google.generativeai as genai
from langdetect import detect, LangDetectException
from deep_translator import GoogleTranslator

# Constants
MAX_PAGES = 20
MAX_TOKENS = 512  # Token limit per chunk for HybridChunker

# Initialize FastAPI
app = FastAPI(title="Docling RAG API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for sessions
sessions = {}

# Progress tracking for real-time updates
progress_queues = defaultdict(asyncio.Queue)

# Language code mapping (Docling uses ISO 639-1, langdetect returns similar codes)
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'fr': 'French',
    'pt': 'Portuguese'
}

# Model IDs for embeddings (reused for tokenizers)
EMBEDDING_MODEL_IDS = {
    'en': 'sentence-transformers/all-MiniLM-L6-v2',
    'fr': 'dangvantuan/sentence-camembert-large',
    'pt': 'rufimelo/bert-large-portuguese-cased-sts'
}

# Initialize empty model containers (lazy loading)
embedding_models = {}
tokenizers = {}
chunkers = {}
model_loading_status = {
    'en': False,
    'fr': False,
    'pt': False
}

import threading
import asyncio

def load_language_model(lang: str):
    """Load embedding model, tokenizer, and chunker for a specific language"""
    if lang in embedding_models:
        return  # Already loaded

    print(f"Loading {SUPPORTED_LANGUAGES.get(lang, lang)} model ({lang})...")
    try:
        model_id = EMBEDDING_MODEL_IDS[lang]

        # Load embedding model
        embedding_models[lang] = SentenceTransformer(model_id)

        # Load tokenizer and chunker
        tokenizers[lang] = HuggingFaceTokenizer(
            tokenizer=AutoTokenizer.from_pretrained(model_id),
            max_tokens=MAX_TOKENS
        )
        chunkers[lang] = HybridChunker(
            tokenizer=tokenizers[lang],
            merge_peers=True
        )

        model_loading_status[lang] = True
        print(f"✓ {SUPPORTED_LANGUAGES.get(lang, lang)} model loaded!")
    except Exception as e:
        print(f"✗ Error loading {lang} model: {e}")

def preload_models_background():
    """Pre-load models in priority order: FR → EN → PT"""
    priority_order = ['fr', 'en', 'pt']
    for lang in priority_order:
        load_language_model(lang)


def detect_language(text: str) -> str:
    """Detect language of text, return ISO 639-1 code (en/fr/pt), default to 'en'"""
    try:
        lang = detect(text)
        # Map detected language to supported languages
        if lang in SUPPORTED_LANGUAGES:
            return lang
        # If detected language not supported, default to English
        return 'en'
    except LangDetectException:
        # If detection fails, default to English
        return 'en'


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """Translate text from source language to target language"""
    if source_lang == target_lang:
        return text

    try:
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        return translator.translate(text)
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original text if translation fails


def send_progress(session_id: str, message: str, step: str = ""):
    """Send progress update to the session's queue"""
    try:
        queue = progress_queues[session_id]
        queue.put_nowait({"message": message, "step": step})
    except Exception as e:
        print(f"Error sending progress: {e}")


class DocumentProcessor:
    """Handles document processing and RAG functionality"""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.chroma_client = chromadb.Client(Settings(
            anonymized_telemetry=False,
            allow_reset=True
        ))
        self.collection = None
        self.document_content = ""
        self.docling_document = None  # Store DoclingDocument for HybridChunker
        self.document_language = "en"  # Default to English

    def check_pdf_pages(self, file_path: str) -> tuple[bool, int]:
        """Check if PDF is within page limit"""
        try:
            reader = PdfReader(file_path)
            num_pages = len(reader.pages)
            return num_pages <= MAX_PAGES, num_pages
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

    def process_document(self, file_path: str, file_extension: str) -> dict:
        """Process document with Docling"""
        try:
            send_progress(self.session_id, "📄 Converting document to markdown...", "converting")

            # Check PDF page limit
            if file_extension == "pdf":
                within_limit, num_pages = self.check_pdf_pages(file_path)
                if not within_limit:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Document has {num_pages} pages. Maximum allowed: {MAX_PAGES} pages."
                    )

            # Convert document with Docling
            converter = DocumentConverter()
            result = converter.convert(file_path)

            # Store the DoclingDocument for HybridChunker
            self.docling_document = result.document
            markdown_content = self.docling_document.export_to_markdown()

            send_progress(self.session_id, "🌍 Detecting document language...", "detecting_language")

            # Extract document language from Docling metadata
            doc_lang = None
            if hasattr(result.document, 'lang') and result.document.lang:
                doc_lang = result.document.lang.lower()
            elif hasattr(result.document, 'metadata') and result.document.metadata:
                # Check metadata for language
                metadata = result.document.metadata
                if hasattr(metadata, 'language'):
                    doc_lang = metadata.language.lower()
                elif isinstance(metadata, dict) and 'language' in metadata:
                    doc_lang = metadata['language'].lower()

            # If Docling didn't detect language, use content-based detection
            if not doc_lang or doc_lang not in SUPPORTED_LANGUAGES:
                # Detect from first 1000 chars of content
                doc_lang = detect_language(markdown_content[:1000])
                print(f"Language detected from content: {doc_lang}")
            else:
                print(f"Language from Docling: {doc_lang}")

            self.document_language = doc_lang
            lang_name = SUPPORTED_LANGUAGES.get(doc_lang, doc_lang.upper())
            send_progress(self.session_id, f"✓ Language: {lang_name}", "language_detected")

            # Estimate pages for non-PDF formats
            if file_extension != "pdf":
                estimated_pages = len(markdown_content) // 3000
                if estimated_pages > MAX_PAGES:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Document too large! Estimated {estimated_pages} pages. Maximum: {MAX_PAGES}."
                    )

            self.document_content = markdown_content

            send_progress(self.session_id, "✂️ Creating smart chunks...", "chunking")
            # Chunk using HybridChunker with document structure
            chunks = self._chunk_with_hybrid_chunker()

            send_progress(self.session_id, "🧠 Generating embeddings...", "embedding")
            # Create embeddings and store in ChromaDB
            self._create_vector_store(chunks)

            return {
                "status": "success",
                "message": "Document processed successfully",
                "num_chunks": len(chunks),
                "content_length": len(markdown_content),
                "document_language": self.document_language,
                "language_name": SUPPORTED_LANGUAGES.get(self.document_language, "Unknown")
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

    def _chunk_with_hybrid_chunker(self) -> list[str]:
        """
        Use Docling's HybridChunker for hierarchical, structure-aware chunking.
        This respects document structure (headings, sections, tables) and uses
        the same tokenizer as the embedding model for optimal chunk sizes.
        """
        if not self.docling_document:
            raise HTTPException(status_code=500, detail="No Docling document available for chunking")

        # Lazy-load model if not already loaded
        if self.document_language not in chunkers:
            load_language_model(self.document_language)

        # Get the appropriate chunker for the document language
        chunker = chunkers.get(self.document_language, chunkers.get('en'))
        if not chunker:
            raise HTTPException(status_code=500, detail=f"Chunker for {self.document_language} not available")
        print(f"Using {self.document_language} HybridChunker for document structure-aware chunking")

        # Chunk the document using HybridChunker
        chunk_iter = chunker.chunk(dl_doc=self.docling_document)

        # Extract text from chunks
        chunks = []
        for chunk in chunk_iter:
            # Use the contextualize method to get metadata-enriched text
            chunk_text = chunker.serialize(chunk)
            if chunk_text and chunk_text.strip():
                chunks.append(chunk_text.strip())

        print(f"Created {len(chunks)} structure-aware chunks")
        return chunks

    def _create_vector_store(self, chunks: list[str]):
        """Create ChromaDB collection with embeddings"""
        try:
            # Create collection
            collection_name = f"docs_{self.session_id}"
            self.collection = self.chroma_client.create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )

            # Lazy-load model if not already loaded
            if self.document_language not in embedding_models:
                lang_name = SUPPORTED_LANGUAGES.get(self.document_language, self.document_language.upper())
                send_progress(self.session_id, f"🤖 Loading {lang_name} model (first time, ~30-60s)...", "loading_model")
                load_language_model(self.document_language)

            # Get the appropriate embedding model for document language
            embedding_model = embedding_models.get(self.document_language, embedding_models.get('en'))
            if not embedding_model:
                raise HTTPException(status_code=500, detail=f"Embedding model for {self.document_language} not available")
            print(f"Using {self.document_language} embedding model for document chunks")

            # Generate embeddings
            embeddings = embedding_model.encode(chunks).tolist()

            send_progress(self.session_id, "💾 Storing in vector database...", "storing")
            # Add to ChromaDB
            ids = [f"chunk_{i}" for i in range(len(chunks))]
            self.collection.add(
                embeddings=embeddings,
                documents=chunks,
                ids=ids
            )

            send_progress(self.session_id, "✅ Ready! Ask your questions below.", "complete")

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating vector store: {str(e)}")

    def search_similar(self, query: str, top_k: int = 3) -> list[str]:
        """Search for similar chunks using document language embedding model"""
        if not self.collection:
            raise HTTPException(status_code=400, detail="No document loaded")

        try:
            # Lazy-load model if not already loaded
            if self.document_language not in embedding_models:
                load_language_model(self.document_language)

            # Get the appropriate embedding model for document language
            embedding_model = embedding_models.get(self.document_language, embedding_models.get('en'))
            if not embedding_model:
                raise HTTPException(status_code=500, detail=f"Embedding model for {self.document_language} not available")

            # Embed query
            query_embedding = embedding_model.encode([query])[0].tolist()

            # Search
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )

            return results['documents'][0] if results['documents'] else []

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error searching: {str(e)}")


def generate_answer(query: str, context_chunks: list[str], api_key: str, user_language: str = 'en') -> str:
    """Generate answer using Google Gemini in the user's language"""
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        # Build context
        context = "\n\n".join([f"Context {i+1}:\n{chunk}" for i, chunk in enumerate(context_chunks)])

        # Language instruction for Gemini
        language_instruction = ""
        if user_language == 'fr':
            language_instruction = "\n\nIMPORTANT: You must answer in FRENCH (français)."
        elif user_language == 'pt':
            language_instruction = "\n\nIMPORTANT: You must answer in PORTUGUESE (português)."
        elif user_language == 'en':
            language_instruction = "\n\nIMPORTANT: You must answer in ENGLISH."
        else:
            language_instruction = f"\n\nIMPORTANT: You must answer in the same language as the question."

        # Build prompt
        prompt = f"""You are a helpful assistant answering questions about a document.
Use the following context to answer the question. If you cannot answer based on the context, say so.{language_instruction}

{context}

Question: {query}

Answer:"""

        # Generate response
        response = model.generate_content(prompt)

        return response.text

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")


# API Endpoints

@app.on_event("startup")
async def startup_event():
    """Start background model loading on app startup"""
    print("🚀 Starting server...")
    print("⏳ Models will load in background: FR → EN → PT")
    # Run model loading in a separate thread to not block startup
    threading.Thread(target=preload_models_background, daemon=True).start()

@app.get("/api/health")
async def health():
    return {"message": "Docling RAG API is running!", "status": "healthy"}

@app.get("/api/model-status")
async def model_status():
    """Return the loading status of all models"""
    return {
        "models": {
            "fr": {"loaded": model_loading_status['fr'], "name": "French"},
            "en": {"loaded": model_loading_status['en'], "name": "English"},
            "pt": {"loaded": model_loading_status['pt'], "name": "Portuguese"}
        },
        "any_loaded": any(model_loading_status.values()),
        "all_loaded": all(model_loading_status.values())
    }


@app.get("/api/progress/{session_id}")
async def progress_stream(session_id: str):
    """Server-Sent Events endpoint for real-time progress updates"""
    async def event_generator():
        queue = progress_queues[session_id]
        try:
            while True:
                # Wait for progress message with timeout
                try:
                    progress = await asyncio.wait_for(queue.get(), timeout=120.0)
                    # Send SSE formatted message
                    yield f"data: {json.dumps(progress)}\n\n"
                    # If complete, stop streaming
                    if progress.get('step') == 'complete':
                        break
                except asyncio.TimeoutError:
                    # Send keepalive
                    yield f": keepalive\n\n"
        except Exception as e:
            print(f"Progress stream error: {e}")
        finally:
            # Clean up queue
            if session_id in progress_queues:
                del progress_queues[session_id]

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    api_key: str = Form(...)
):
    """Upload and process a document"""

    # Validate file type
    file_extension = file.filename.split('.')[-1].lower()
    allowed_extensions = ['pdf', 'docx', 'pptx', 'xlsx', 'html']

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Clean up ALL existing sessions before creating new one (demo app - single session only)
    for sid in list(sessions.keys()):
        try:
            processor = sessions[sid]["processor"]
            collection_name = f"docs_{sid}"
            processor.chroma_client.delete_collection(collection_name)
        except Exception:
            pass  # Collection might not exist
        del sessions[sid]

    # Create session
    session_id = str(uuid.uuid4())

    # Send initial progress message
    send_progress(session_id, "⏳ Uploading document...", "uploading")

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name

    # Process document in background
    async def process_in_background():
        try:
            processor = DocumentProcessor(session_id)
            result = processor.process_document(tmp_file_path, file_extension)

            # Store session
            sessions[session_id] = {
                "processor": processor,
                "api_key": api_key,
                "filename": file.filename
            }
        except Exception as e:
            send_progress(session_id, f"❌ Error: {str(e)}", "error")
        finally:
            # Clean up temp file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)

    # Start processing in background
    asyncio.create_task(process_in_background())

    # Return immediately with session_id so frontend can connect to SSE
    return {
        "session_id": session_id,
        "filename": file.filename,
        "status": "processing"
    }


@app.post("/ask")
async def ask_question(
    session_id: str = Form(...),
    question: str = Form(...)
):
    """Ask a question about the uploaded document with multilingual support"""

    # Get session
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a document first.")

    session = sessions[session_id]
    processor = session["processor"]
    api_key = session["api_key"]

    try:
        # Detect user's question language
        user_language = detect_language(question)
        document_language = processor.document_language

        print(f"User question language: {user_language}, Document language: {document_language}")

        # Translate question to document language if different
        search_query = question
        if user_language != document_language:
            print(f"Translating question from {user_language} to {document_language}")
            search_query = translate_text(question, user_language, document_language)
            print(f"Translated query: {search_query}")

        # Search for relevant chunks using translated query
        context_chunks = processor.search_similar(search_query, top_k=3)

        if not context_chunks:
            # Return "no info found" message in user's language
            no_info_messages = {
                'en': "No relevant information found in the document.",
                'fr': "Aucune information pertinente trouvée dans le document.",
                'pt': "Nenhuma informação relevante encontrada no documento."
            }
            return {
                "answer": no_info_messages.get(user_language, no_info_messages['en']),
                "sources": []
            }

        # Generate answer with Gemini in user's language
        # Pass the original question (not translated) so Gemini sees the user's language
        answer = generate_answer(question, context_chunks, api_key, user_language)

        return {
            "answer": answer,
            "sources": context_chunks,
            "user_language": user_language,
            "document_language": document_language
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clear")
async def clear_session(session_id: str = Form(...)):
    """Clear a session"""
    if session_id in sessions:
        # Get the processor to access ChromaDB collection
        processor = sessions[session_id]["processor"]

        # Delete ChromaDB collection to prevent memory leak
        try:
            collection_name = f"docs_{session_id}"
            processor.chroma_client.delete_collection(collection_name)
        except Exception:
            pass  # Collection might not exist if document wasn't processed

        # Delete session
        del sessions[session_id]
        return {"status": "success", "message": "Session cleared"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")


# Mount static files (frontend)
app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    print(f"🚀 Starting server on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
