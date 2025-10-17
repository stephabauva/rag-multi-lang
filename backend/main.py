from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import tempfile
import os
from typing import Optional
import uuid

from docling.document_converter import DocumentConverter
from pypdf import PdfReader
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from langdetect import detect, LangDetectException
from deep_translator import GoogleTranslator

# Constants
MAX_PAGES = 20
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

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

# Language code mapping (Docling uses ISO 639-1, langdetect returns similar codes)
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'fr': 'French',
    'pt': 'Portuguese'
}

# Initialize embedding models (loads once at startup)
print("Loading multilingual embedding models...")
print("  - Loading English model...")
embedding_models = {
    'en': SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
}
print("  - Loading French model...")
embedding_models['fr'] = SentenceTransformer('dangvantuan/sentence-camembert-large')
print("  - Loading Portuguese model...")
embedding_models['pt'] = SentenceTransformer('rufimelo/bert-large-portuguese-cased-sts')
print("✓ All embedding models loaded!")


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
            markdown_content = result.document.export_to_markdown()

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

            # Estimate pages for non-PDF formats
            if file_extension != "pdf":
                estimated_pages = len(markdown_content) // 3000
                if estimated_pages > MAX_PAGES:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Document too large! Estimated {estimated_pages} pages. Maximum: {MAX_PAGES}."
                    )

            self.document_content = markdown_content

            # Chunk the text
            chunks = self._chunk_text(markdown_content)

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

    def _chunk_text(self, text: str) -> list[str]:
        """Simple text chunking with overlap"""
        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + CHUNK_SIZE
            chunk = text[start:end]

            # Try to break at sentence boundary
            if end < text_length:
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)

                if break_point > CHUNK_SIZE // 2:
                    chunk = chunk[:break_point + 1]
                    end = start + break_point + 1

            chunks.append(chunk.strip())
            start = end - CHUNK_OVERLAP

        return [c for c in chunks if c]  # Remove empty chunks

    def _create_vector_store(self, chunks: list[str]):
        """Create ChromaDB collection with embeddings"""
        try:
            # Create collection
            collection_name = f"docs_{self.session_id}"
            self.collection = self.chroma_client.create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )

            # Get the appropriate embedding model for document language
            embedding_model = embedding_models.get(self.document_language, embedding_models['en'])
            print(f"Using {self.document_language} embedding model for document chunks")

            # Generate embeddings
            embeddings = embedding_model.encode(chunks).tolist()

            # Add to ChromaDB
            ids = [f"chunk_{i}" for i in range(len(chunks))]
            self.collection.add(
                embeddings=embeddings,
                documents=chunks,
                ids=ids
            )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating vector store: {str(e)}")

    def search_similar(self, query: str, top_k: int = 3) -> list[str]:
        """Search for similar chunks using document language embedding model"""
        if not self.collection:
            raise HTTPException(status_code=400, detail="No document loaded")

        try:
            # Get the appropriate embedding model for document language
            embedding_model = embedding_models.get(self.document_language, embedding_models['en'])

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

@app.get("/api/health")
async def health():
    return {"message": "Docling RAG API is running!", "status": "healthy"}


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

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name

    try:
        # Process document
        processor = DocumentProcessor(session_id)
        result = processor.process_document(tmp_file_path, file_extension)

        # Store session
        sessions[session_id] = {
            "processor": processor,
            "api_key": api_key,
            "filename": file.filename
        }

        return {
            **result,
            "session_id": session_id,
            "filename": file.filename
        }

    finally:
        # Clean up temp file
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


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
