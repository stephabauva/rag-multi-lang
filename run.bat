@echo off

REM Docling RAG Webapp - Run Script (Windows)

echo 🚀 Starting Docling RAG Webapp...
echo.

REM Check if venv exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate venv
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Check if embedding model needs to be downloaded
echo 🤖 Checking embedding model...

REM Run the server
echo.
echo ✅ Starting server...
echo 🌐 Open http://localhost:8001 in your browser
echo.
cd backend
set PORT=8001
python main.py
