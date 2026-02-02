---
title: Multilingual RAG Demo
emoji: 📚
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
---

# 📚 Docling RAG Demo Webapp

A simple, clean RAG (Retrieval-Augmented Generation) demo application built with vanilla HTML/CSS/JS frontend and Python FastAPI backend. Uses [Docling](https://github.com/docling-project/docling) for document processing and Google Gemini for AI responses.

**🌍 Supports English, French, and Portuguese documents with automatic language detection and multilingual question answering!**

## Features

- 📄 **Multi-format support**: PDF, DOCX, PPTX, XLSX, HTML
- 🔍 **Smart document parsing** with Docling
- 💬 **Clean chat interface** with vanilla JavaScript
- 🎯 **Source citations** showing where answers come from
- ⚡ **Simple architecture** - No heavy frameworks
- 🔒 **Privacy-focused**: API keys only used in your session
- 📏 **Page limit**: Max 20 pages for fast processing
- 🚀 **Easy deployment** to Render, Railway, or any platform

## Architecture

**Simple & Scalable Stack:**
```
Frontend (HTML/CSS/JS)
    ↓
FastAPI Backend
    ├── Docling (document processing)
    ├── ChromaDB (vector store, in-memory)
    ├── sentence-transformers (embeddings, local)
    └── Google Gemini API (LLM)
```

**No LangChain, No Streamlit** - Just the essentials!

## Project Structure

```
docling-rag-webapp/
├── backend/
│   └── main.py           # FastAPI server
├── frontend/
│   ├── index.html        # UI
│   ├── style.css         # Styling
│   └── script.js         # Logic
├── requirements.txt      # Python dependencies
└── README.md
```

## Local Setup

### Prerequisites

- Python 3.9+
- Google Gemini API key ([Get one free](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd docling-rag-webapp
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   cd backend
   python main.py
   ```

5. **Open browser**
   ```
   http://localhost:8001
   ```

## Usage

1. Enter your **Google Gemini API key**
2. **Upload a document** (max 20 pages)
3. Click **"Upload & Process"**
4. **Ask questions** in the chat!

### Example Questions

- "What is this document about?"
- "Summarize the main points"
- "What are the key findings?"
- "Explain [concept] from the document"

## Deploy to Render (FREE)

### Step 1: Prepare for Deployment

1. **Create `render.yaml`** in the root directory:
   ```yaml
   services:
     - type: web
       name: docling-rag-app
       runtime: python
       buildCommand: pip install -r requirements.txt
       startCommand: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your repository
5. Render will detect `render.yaml` automatically
6. Click **"Create Web Service"**
7. Wait 3-5 minutes for deployment
8. Your app is live! 🎉

**Free tier includes:**
- 750 hours/month
- Auto-sleep after 15 min inactivity
- Perfect for demos!

## Alternative Deployment Options

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

### Docker

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ backend/
COPY frontend/ frontend/

WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

```bash
docker build -t docling-rag .
docker run -p 8001:8001 docling-rag
```

## Configuration

### Adjust Page Limit

Edit `backend/main.py`:
```python
MAX_PAGES = 20  # Change this
```

### Change Embedding Model

Edit `backend/main.py`:
```python
embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
# Try: 'all-mpnet-base-v2' for better quality
```

### Change Gemini Model

Edit `backend/main.py` in `generate_answer()`:
```python
model = genai.GenerativeModel('gemini-2.5-flash-lite')
# Options: 'gemini-1.5-pro', 'gemini-1.5-flash'
```

### Chunk Size

Edit `backend/main.py`:
```python
CHUNK_SIZE = 1000      # Characters per chunk
CHUNK_OVERLAP = 200    # Overlap between chunks
```

## API Endpoints

### POST /upload
Upload and process a document
- **Body**: `multipart/form-data`
  - `file`: Document file
  - `api_key`: Google Gemini API key
- **Returns**: Session ID and processing stats

### POST /ask
Ask a question about the document
- **Body**: `multipart/form-data`
  - `session_id`: Session ID from upload
  - `question`: User question
- **Returns**: Answer and source chunks

### POST /clear
Clear a session
- **Body**: `multipart/form-data`
  - `session_id`: Session ID to clear

## How It Works

1. **Upload**: Document is processed by Docling → converts to markdown
2. **Chunking**: Text is split into ~1000 character chunks with 200 char overlap
3. **Embedding**: sentence-transformers creates vector embeddings (runs locally)
4. **Storage**: Vectors stored in ChromaDB (in-memory for demo)
5. **Query**: User question is embedded and similar chunks are retrieved
6. **Generate**: Top 3 chunks + question sent to Gemini → answer returned

## Limitations

- **Page limit**: 20 pages (configurable)
- **Session storage**: In-memory (resets on server restart)
- **Single document**: One document per session
- **No persistence**: Documents not saved between sessions

## Troubleshooting

### "Error processing document"
- Document may be too large (>20 pages)
- Try a different file format
- Check if file is corrupted

### "Error generating answer"
- Verify API key is correct
- Check Gemini API quota
- Ensure stable internet connection

### "Session not found"
- Document processing may have failed
- Try uploading again
- Check server logs

### Slow initial load
- First run downloads embedding model (~90MB)
- Subsequent runs are much faster
- Model is cached locally

## Future Enhancements

Want to improve this? Ideas:

- [ ] Multiple document support
- [ ] Persistent vector store (PostgreSQL + pgvector)
- [ ] User authentication
- [ ] Document management dashboard
- [ ] Export chat history
- [ ] Support local LLMs (Ollama)
- [ ] File type validation
- [ ] Progress bar for processing
- [ ] Multilingual support

## Why This Stack?

**Docling**: Best-in-class document parsing, handles complex PDFs
**ChromaDB**: Simple vector store, no setup needed
**sentence-transformers**: Free embeddings, runs locally
**Gemini**: Fast, generous free tier, great quality
**FastAPI**: Modern, fast, auto-docs
**Vanilla JS**: No build step, easy to understand

## License

MIT License - use freely!

## Acknowledgments

- [Docling](https://github.com/docling-project/docling) - Amazing document processing
- [ChromaDB](https://www.trychroma.com/) - Simple vector database
- [sentence-transformers](https://www.sbert.net/) - Excellent embedding models
- [Google Gemini](https://ai.google.dev/) - Powerful AI model

## Support

Issues? Questions? [Open an issue](https://github.com/yourusername/docling-rag-webapp/issues)

---

Built with ❤️ using simple, modern web technologies
