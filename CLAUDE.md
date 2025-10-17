# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A RAG (Retrieval-Augmented Generation) demo application that processes documents and answers questions using AI. Built with vanilla HTML/CSS/JS frontend and Python FastAPI backend.

**Tech Stack:**
- **Backend**: FastAPI (Python 3.9+)
- **Document Processing**: Docling (converts PDF/DOCX/PPTX/XLSX/HTML to markdown, includes language detection)
- **Vector Store**: ChromaDB (in-memory, ephemeral)
- **Embeddings**: Language-specific sentence-transformers models (local, no API)
  - English: `sentence-transformers/all-MiniLM-L6-v2`
  - French: `dangvantuan/sentence-camembert-large`
  - Portuguese: `rufimelo/bert-large-portuguese-cased-sts`
- **Language Detection**: langdetect (for user questions)
- **Translation**: deep-translator (Google Translate, free)
- **LLM**: Google Gemini API (gemini-2.0-flash-exp)
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

1. **Document Upload** (`POST /upload` in backend/main.py):
   - User uploads document + API key via frontend
   - Backend validates file type and page limit (max 20 pages)
   - Docling converts document to markdown and detects document language
   - Language extracted from Docling metadata or detected from content (first 1000 chars)
   - Text chunked into ~1000 char chunks with 200 char overlap
   - Document embedded using language-specific model (EN/FR/PT)
   - Vectors stored in ChromaDB with session-specific collection
   - Response includes `document_language` and `language_name`

2. **Question Answering** (`POST /ask` in backend/main.py):
   - Detect user question language using langdetect
   - If user language ≠ document language: translate question to document language
   - Embed translated query using document's language-specific model
   - ChromaDB retrieves top 3 similar chunks (cosine similarity)
   - Chunks + original question sent to Gemini API
   - Gemini instructed to answer in user's original language
   - Answer, source chunks, and language info returned to frontend

3. **Session Management**:
   - Single session per server (demo app constraint)
   - Sessions stored in-memory dict: `sessions[session_id] = {processor, api_key, filename}`
   - New upload clears ALL existing sessions (backend/main.py)
   - `/clear` endpoint deletes ChromaDB collection to prevent memory leaks

### Key Components

**backend/main.py**:
- `embedding_models`: Dict of 3 language-specific SentenceTransformer models (EN/FR/PT)
- `detect_language()`: Detects text language using langdetect, defaults to English
- `translate_text()`: Translates between languages using deep-translator
- `DocumentProcessor` class: Handles chunking, embedding, vector storage, stores document language
- `generate_answer()`: Builds multilingual prompt and calls Gemini API with language instructions
- API endpoints: `/upload`, `/ask`, `/clear`, `/api/health`
- Static file serving: Mounts `../frontend` at root path

**frontend/script.js**:
- State management: `sessionId`, `apiKey`
- Event handlers: upload, send question, clear session
- Message rendering: `addMessage()` with sources display

### Configuration Points

**Constants** (backend/main.py):
```python
MAX_PAGES = 20           # Page limit for documents
CHUNK_SIZE = 1000        # Characters per chunk
CHUNK_OVERLAP = 200      # Overlap between chunks
```

**Supported languages** (backend/main.py):
```python
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'fr': 'French',
    'pt': 'Portuguese'
}
```

**Embedding models** (backend/main.py):
```python
embedding_models = {
    'en': SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2'),
    'fr': SentenceTransformer('dangvantuan/sentence-camembert-large'),
    'pt': SentenceTransformer('rufimelo/bert-large-portuguese-cased-sts')
}
# Models downloaded on first use (~1.5GB total)
```

**LLM model** (backend/main.py, `generate_answer()`):
```python
model = genai.GenerativeModel('gemini-2.0-flash-exp')
# Options: gemini-1.5-pro, gemini-1.5-flash
```

**Server port** (backend/main.py):
```python
port = int(os.getenv("PORT", 8001))
```

### Important Implementation Details

1. **Multilingual RAG**: System supports English, French, and Portuguese. Document language auto-detected, user question language detected, automatic translation if needed, and responses in user's language.

2. **Language-Specific Embeddings**: Each language uses its own specialized embedding model for better semantic search quality. Models are stored in `embedding_models` dict.

3. **Model Loading**: All 3 embedding models (~1.5GB total) load at startup. English model pre-downloaded in Docker build, FR/PT download on first run to avoid build space issues.

4. **Single Session Constraint**: App only supports one active session at a time. Each new upload clears previous sessions to prevent memory leaks (backend/main.py).

5. **In-Memory Storage**: All vector stores and sessions are ephemeral. Server restart = data loss. This is by design for demo simplicity.

6. **API Key Handling**: Gemini API key stored in session dict, passed from frontend on each upload. No server-side persistence.

7. **Static File Serving**: Backend serves frontend files via FastAPI's StaticFiles mount. Frontend lives in `../frontend` relative to backend directory.

8. **PDF Page Validation**: Uses pypdf to check page count before Docling processing. Non-PDF formats estimated at ~3000 chars per page.

9. **Chunking Strategy**: Simple sliding window with sentence-aware breaking. Tries to break at period or newline if within second half of chunk (backend/main.py, `_chunk_text()`).

## Deployment

**Render** (configured in `render.yaml`):
- Build: `pip install -r requirements.txt`
- Start: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

**Railway/Fly.io**: Standard Python app deployment, just ensure `PORT` env var is respected.

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
├── Dockerfile               # Container definition
├── docker-compose.yml       # Docker compose config
├── render.yaml              # Render deployment config
└── run.sh / run.bat         # Quick start scripts
```

## Common Development Patterns

### Adding New Document Format Support

1. Add extension to `allowed_extensions` list in `/upload` endpoint (backend/main.py)
2. Docling handles most formats automatically
3. Consider page limit validation if not PDF

### Adding New Language Support

1. Add language code to `SUPPORTED_LANGUAGES` dict (backend/main.py)
2. Add corresponding embedding model to `embedding_models` dict (backend/main.py)
3. Language detection and translation work automatically

### Changing Retrieval Parameters

Edit `search_similar()` call in `/ask` endpoint (backend/main.py):
```python
context_chunks = processor.search_similar(search_query, top_k=3)  # Change top_k
```

### Modifying RAG Prompt

Edit prompt template in `generate_answer()` function (backend/main.py). Note the language instructions are dynamically added based on `user_language` parameter.

### Adding Session Persistence

Would require:
1. Replace in-memory `sessions` dict with database
2. Persist ChromaDB collections (switch from in-memory to persistent client)
3. Store API keys securely (encrypted)
4. Modify `/upload` endpoint to NOT clear all sessions
