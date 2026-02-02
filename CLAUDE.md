# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A RAG (Retrieval-Augmented Generation) demo application that processes documents and answers questions using AI. Built with vanilla HTML/CSS/JS frontend and Python FastAPI backend.

**Tech Stack:**
- **Backend**: FastAPI (Python 3.9+)
- **Document Processing**: Docling (converts PDF/DOCX/PPTX/XLSX/HTML to markdown, includes language detection)
- **Chunking**: Docling HybridChunker (structure-aware hierarchical chunking with tokenization)
- **Vector Store**: ChromaDB (in-memory, ephemeral)
- **Embeddings**: Language-specific sentence-transformers models (local, no API)
  - English: `sentence-transformers/all-MiniLM-L6-v2`
  - French: `dangvantuan/sentence-camembert-large`
  - Portuguese: `rufimelo/bert-large-portuguese-cased-sts`
- **Language Detection**: langdetect (for user questions)
- **Translation**: deep-translator (Google Translate, free)
- **LLM**: Google Gemini API (gemini-2.5-flash-lite)
- **Frontend**: Vanilla JavaScript (no build step)

## Development Commands

### Running the Application

```bash
# Quick start (recommended)
./run.sh              # Mac/Linux
run.bat               # Windows

# Manual start
python3 -m venv venv
source venv/bin/activate  # Mac/Linux: venv\Scripts\activate on Windows
pip install -r requirements.txt
cd backend
python main.py
```

Server runs on `http://localhost:8001` by default (configurable via `PORT` env var).

### Docker

```bash
# Using docker-compose
docker-compose up --build

# Manual Docker build
docker build -t docling-rag .
docker run -p 8001:8001 docling-rag
```

### Testing

Currently no automated tests. Test manually by:
1. Starting server
2. Opening browser to localhost:8001
3. Upload a document with Gemini API key
4. Ask questions in chat interface

## Architecture

### Request Flow

1. **Document Upload** in backend/main.py `POST /upload`:
   - User uploads document + API key via frontend
   - Backend returns session_id immediately and starts background processing
   - **Real-time progress updates via Server-Sent Events** (SSE):
     1. ⏳ Starting document processing...
     2. 📋 Validating document...
     3. 📄 Converting document to markdown (first time may download OCR models, ~1-2 min)...
     4. 📝 Extracting text from document...
     5. 🌍 Detecting document language...
     6. ✓ Language: [Detected Language]
     7. 🤖 Loading [Language] model (first time, ~30-60s)... (if needed)
     8. ✂️ Creating smart chunks...
     9. 🧠 Generating embeddings...
     10. 💾 Storing in vector database...
     11. ✅ Ready! Ask your questions below.
   - Backend validates file type and page limit (max 20 pages)
   - Docling converts document to structured DoclingDocument and markdown
   - Language extracted from Docling metadata or detected from content (first 1000 chars)
   - HybridChunker creates structure-aware chunks (respects headings, sections, tables) with max 512 tokens
   - Uses language-specific tokenizer matching the embedding model for optimal chunk sizes
   - Document embedded using language-specific model (EN/FR/PT)
   - Vectors stored in ChromaDB with session-specific collection
   - Session includes `document_language`, `language_name`, and `timestamp`

2. **Question Answering** in backend/main.py `POST /ask`:
   - Detect user question language using langdetect
   - If user language ≠ document language: translate question to document language
   - Embed translated query using document's language-specific model
   - ChromaDB retrieves top 3 similar chunks (cosine similarity)
   - Chunks + original question sent to Gemini API
   - Gemini instructed to answer in user's original language
   - Answer, source chunks, and language info returned to frontend

3. **Session Management**:
   - **Multi-user support**: Multiple concurrent sessions allowed
   - Sessions stored in-memory dict in backend/main.py with timestamps
   - Sessions auto-expire after 1 hour (3600 seconds)
   - On new upload, only expired sessions are cleaned up
   - `/clear` endpoint deletes specific session's ChromaDB collection to prevent memory leaks
   - Each session includes: processor, api_key, filename, timestamp

### Key Components

**backend/main.py**:
- `embedding_models`: Dict of 3 language-specific SentenceTransformer models (EN/FR/PT) - lazy loaded
- `tokenizers`: Dict of 3 HuggingFace tokenizers matching each embedding model - lazy loaded
- `chunkers`: Dict of 3 HybridChunker instances (one per language) for structure-aware chunking - lazy loaded
- `model_loading_status`: Dict tracking which models are loaded
- `load_language_model()`: Lazy-loads model, tokenizer, and chunker for a specific language on-demand
- `preload_models_background()`: Background task that pre-loads models in priority order (FR → EN → PT)
- `detect_language()`: Detects text language using langdetect, defaults to English
- `translate_text()`: Translates between languages using deep-translator
- `DocumentProcessor` class: Handles HybridChunking, embedding, vector storage, stores document language
- `generate_answer()`: Builds multilingual prompt and calls Gemini API with language instructions
- API endpoints: `/upload`, `/ask`, `/clear`, `/api/health`, `/api/model-status`
- Static file serving: Mounts `../frontend` at root path

**frontend/script.js**:
- State management: `sessionId`, `apiKey`
- Event handlers: upload, send question, clear session
- Message rendering: `addMessage()` with sources display
- Model status polling: `checkModelStatus()` and `initializeModelStatus()` poll `/api/model-status` every 2s until models ready

### Configuration Points

**Constants** in backend/main.py:
```python
MAX_PAGES = 20           # Page limit for documents
MAX_TOKENS = 512         # Maximum tokens per chunk for HybridChunker
```

**Supported languages** in backend/main.py:
```python
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'fr': 'French',
    'pt': 'Portuguese'
}
```

**Embedding models and chunkers** in backend/main.py:
```python
EMBEDDING_MODEL_IDS = {
    'en': 'sentence-transformers/all-MiniLM-L6-v2',
    'fr': 'dangvantuan/sentence-camembert-large',
    'pt': 'rufimelo/bert-large-portuguese-cased-sts'
}

# Each language has matching embedding model, tokenizer, and HybridChunker
embedding_models = {...}  # SentenceTransformer instances
tokenizers = {...}        # HuggingFaceTokenizer instances
chunkers = {...}          # HybridChunker instances
```

**LLM model** in backend/main.py `generate_answer()`:
```python
model = genai.GenerativeModel('gemini-2.5-flash-lite')
```

**Server port** in backend/main.py:
```python
port = int(os.getenv("PORT", 8001))
```

### Important Implementation Details

1. **Multilingual RAG**: System supports English, French, and Portuguese. Document language auto-detected, user question language detected, automatic translation if needed, and responses in user's language.

2. **Language-Specific Embeddings**: Each language uses its own specialized embedding model for better semantic search quality. Models are stored in `embedding_models` dict.

3. **Lazy Model Loading**: Models (~1.5GB total) load in background on startup in priority order (FR → EN → PT) to minimize cold start time. Server starts immediately and UI becomes responsive while models load. Models are lazy-loaded on-demand if accessed before background loading completes. Frontend polls `/api/model-status` and enables upload button when first model is ready. English model pre-downloaded in Dockerfile (~80MB), FR/PT download on first use.

4. **Multi-User Sessions**: App supports multiple concurrent sessions. Sessions expire after 1 hour to prevent memory leaks. Each session is independent with its own vector store.

5. **In-Memory Storage**: All vector stores and sessions are ephemeral. Server restart = data loss. This is by design for demo simplicity.

6. **API Key Handling**: Gemini API key stored in session dict, passed from frontend on each upload. No server-side persistence.

7. **Real-Time Progress Updates**: Uses Server-Sent Events (SSE) to stream progress updates to the frontend during document processing. Frontend connects to `/api/progress/{session_id}` and receives 11 distinct progress steps, providing full visibility into the processing pipeline. SSE connection includes keepalive pings and auto-closes on completion or error.

8. **Static File Serving**: Backend serves frontend files via FastAPI's StaticFiles mount. Frontend lives in `../frontend` relative to backend directory.

9. **PDF Page Validation**: Uses pypdf to check page count before Docling processing. Non-PDF formats estimated at ~3000 chars per page.

10. **HybridChunker Strategy**: Uses Docling's HybridChunker for intelligent, structure-aware chunking. Respects document hierarchy (headings, sections, tables), uses language-specific tokenizers matching embedding models, merges small peer chunks with same headings (`merge_peers=True`), and ensures optimal semantic coherence in backend/main.py `_chunk_with_hybrid_chunker()`.

## Deployment

**Hugging Face Spaces** (Docker mode):
- Uses Dockerfile for deployment
- Multi-stage build: Installs packages globally to /usr/local (accessible to non-root user)
- Pre-caches English model (~80MB) to speed up initial startup
- Container runs as UID 1000 (non-root user) for security
- Environment variables: PORT (defaults to 7860)

## File Structure

```
docling-rag-webapp/
├── backend/
│   └── main.py              # FastAPI server, document processing, RAG logic
├── frontend/
│   ├── index.html           # UI structure
│   ├── style.css            # Styling
│   └── script.js            # Frontend logic, API calls
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container definition (Hugging Face Spaces)
├── docker-compose.yml       # Docker compose config
└── run.sh / run.bat         # Quick start scripts
```

## Common Development Patterns

### Adding New Document Format Support

1. Add extension to `allowed_extensions` list in backend/main.py `/upload` endpoint
2. Docling handles most formats automatically
3. Consider page limit validation if not PDF

### Adding New Language Support

1. Add language code to `SUPPORTED_LANGUAGES` dict in backend/main.py
2. Add model ID to `EMBEDDING_MODEL_IDS` dict in backend/main.py
3. Corresponding embedding model, tokenizer, and chunker will be auto-initialized at startup
4. Language detection and translation work automatically

### Changing Retrieval Parameters

Edit `search_similar()` call in backend/main.py `/ask` endpoint:
```python
context_chunks = processor.search_similar(search_query, top_k=3)  # Change top_k
```

### Modifying RAG Prompt

Edit prompt template in backend/main.py `generate_answer()` function. Note the language instructions are dynamically added based on `user_language` parameter.

### Adding Session Persistence

Would require:
1. Replace in-memory `sessions` dict with database
2. Persist ChromaDB collections (switch from in-memory to persistent client)
3. Store API keys securely (encrypted)
4. Modify backend/main.py `/upload` endpoint to NOT clear all sessions
