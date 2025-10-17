#!/bin/bash

# Docling RAG Webapp - Run Script

echo "🚀 Starting Docling RAG Webapp..."
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check if embedding model needs to be downloaded
echo "🤖 Checking embedding model..."
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')" 2>/dev/null || echo "Downloading embedding model (first time only)..."

# Run the server
echo ""
echo "✅ Starting server..."
echo "🌐 Open http://localhost:8001 in your browser"
echo ""
cd backend && PORT=8001 python main.py
