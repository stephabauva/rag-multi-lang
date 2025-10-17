FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download all 3 embedding models during build
RUN python -c "from sentence_transformers import SentenceTransformer; \
    print('Downloading English model...'); \
    SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2'); \
    print('English model downloaded!'); \
    print('Downloading French model...'); \
    SentenceTransformer('dangvantuan/sentence-camembert-large'); \
    print('French model downloaded!'); \
    print('Downloading Portuguese model...'); \
    SentenceTransformer('rufimelo/bert-large-portuguese-cased-sts'); \
    print('Portuguese model downloaded! All models ready.')"

# Copy application code
COPY backend/ backend/
COPY frontend/ frontend/

# Expose port
EXPOSE 7860

# Run the application
WORKDIR /app/backend
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
