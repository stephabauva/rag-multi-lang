# 🚀 Quick Start Guide

Get up and running in 2 minutes!

## Prerequisites

1. **Python 3.9+** installed
2. **Google Gemini API Key** - Get one free at [Google AI Studio](https://makersuite.google.com/app/apikey)

## Option 1: Easy Start (Recommended)

### Mac/Linux
```bash
./run.sh
```

### Windows
```bash
run.bat
```

That's it! Open http://localhost:8000 in your browser.

## Option 2: Manual Start

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
cd backend
python main.py
```

Open http://localhost:8000

## Option 3: Docker

```bash
# Build and run
docker-compose up --build

# Or just:
docker build -t docling-rag .
docker run -p 8000:8000 docling-rag
```

Open http://localhost:8000

## Using the App

1. **Enter API Key**: Paste your Google Gemini API key
2. **Upload Document**: Select a PDF, DOCX, PPTX, XLSX, or HTML file (max 20 pages)
3. **Click "Upload & Process"**: Wait for processing to complete
4. **Ask Questions**: Type your question and click "Send"
5. **View Answers**: Get AI-generated answers with source citations

## First Time Setup Notes

- **First run** will download the embedding model (~90MB) - this is normal
- Subsequent runs will be much faster
- The model is cached locally at `~/.cache/torch/sentence_transformers/`

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9  # Mac/Linux
```

### API key not working
- Make sure you're using a **Google Gemini API key**, not OpenAI
- Check it's enabled at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Document processing fails
- Make sure document is under 20 pages
- Try a different file format
- Check if file is corrupted

## What's Next?

Check out [README.md](README.md) for:
- Full documentation
- Deployment instructions
- Configuration options
- API documentation

## Need Help?

Open an issue on GitHub or check the logs in your terminal for error messages.

---

Happy RAG-ing! 🎉
