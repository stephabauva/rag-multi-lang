# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A RAG (Retrieval-Augmented Generation) demo application that processes documents and answers questions using AI. Built with vanilla HTML/CSS/JS frontend and Python FastAPI backend.

**Tech Stack:**
- **Backend**: FastAPI (Python 3.9+)
- **Document Processing**: Docling (converts PDF/DOCX/PPTX/XLSX/HTML to markdown)
- **Vector Store**: ChromaDB (in-memory, ephemeral)
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2 (local, no API)
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

1. **Document Upload** (`POST /upload`):
   - User uploads document + API key via frontend
   - Backend validates file type and page limit (max 20 pages)
   - Docling converts document to markdown
   - Text chunked into ~1000 char chunks with 200 char overlap
   - sentence-transformers generates embeddings locally
   - Vectors stored in ChromaDB with session-specific collection

2. **Question Answering** (`POST /ask`):
   - User question embedded using sentence-transformers
   - ChromaDB retrieves top 3 similar chunks (cosine similarity)
   - Chunks + question sent to Gemini API
   - Answer and source chunks returned to frontend

3. **Session Management**:
   - Single session per server (demo app constraint)
   - Sessions stored in-memory dict: `sessions[session_id] = {processor, api_key, filename}`
   - New upload clears ALL existing sessions (lines 233-241 in backend/main.py)
   - `/clear` endpoint deletes ChromaDB collection to prevent memory leaks

### Key Components

**backend/main.py**:
- `DocumentProcessor` class: Handles chunking, embedding, vector storage
- `generate_answer()`: Builds prompt and calls Gemini API
- API endpoints: `/upload`, `/ask`, `/clear`, `/api/health`
- Static file serving: Mounts `../frontend` at root path

**frontend/script.js**:
- State management: `sessionId`, `apiKey`
- Event handlers: upload, send question, clear session
- Message rendering: `addMessage()` with sources display

### Configuration Points

**backend/main.py constants** (lines 18-20):
```python
MAX_PAGES = 20           # Page limit for documents
CHUNK_SIZE = 1000        # Characters per chunk
CHUNK_OVERLAP = 200      # Overlap between chunks
```

**Embedding model** (line 39):
```python
embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
# Can swap to 'all-mpnet-base-v2' for better quality but slower
```

**LLM model** (line 185):
```python
model = genai.GenerativeModel('gemini-2.0-flash-exp')
# Options: gemini-1.5-pro, gemini-1.5-flash
```

**Server port** (line 340):
```python
port = int(os.getenv("PORT", 8001))
```

### Important Implementation Details

1. **Single Session Constraint**: App only supports one active session at a time. Each new upload clears previous sessions to prevent memory leaks (backend/main.py:233-241).

2. **In-Memory Storage**: All vector stores and sessions are ephemeral. Server restart = data loss. This is by design for demo simplicity.

3. **API Key Handling**: Gemini API key stored in session dict, passed from frontend on each upload. No server-side persistence.

4. **Static File Serving**: Backend serves frontend files via FastAPI's StaticFiles mount (line 335). Frontend lives in `../frontend` relative to backend directory.

5. **Embedding Model Loading**: sentence-transformers downloads model (~90MB) to `~/.cache/torch/sentence_transformers/` on first run. Subsequent runs are instant.

6. **PDF Page Validation**: Uses pypdf to check page count before Docling processing (lines 55-62). Non-PDF formats estimated at ~3000 chars per page (lines 82-88).

7. **Chunking Strategy**: Simple sliding window with sentence-aware breaking. Tries to break at period or newline if within second half of chunk (lines 110-133).

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

1. Add extension to `allowed_extensions` list (backend/main.py:225)
2. Docling handles most formats automatically
3. Consider page limit validation if not PDF

### Changing Retrieval Parameters

Edit `search_similar()` call in `/ask` endpoint (backend/main.py:293):
```python
context_chunks = processor.search_similar(question, top_k=3)  # Change top_k
```

### Modifying RAG Prompt

Edit prompt template in `generate_answer()` function (backend/main.py:191-198).

### Adding Session Persistence

Would require:
1. Replace in-memory `sessions` dict with database
2. Persist ChromaDB collections (switch from in-memory to persistent client)
3. Store API keys securely (encrypted)
4. Modify `/upload` to NOT clear all sessions (lines 233-241)
