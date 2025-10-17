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

# Pre-download only English model to verify installation
# Other models will be downloaded on first run to avoid build-time space issues
RUN python -c "from sentence_transformers import SentenceTransformer; \
    print('Downloading English model...'); \
    SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2'); \
    print('English model downloaded! FR and PT models will download on first run.')"

# Copy application code
COPY backend/ backend/
COPY frontend/ frontend/

# Expose port
EXPOSE 7860

# Run the application
WORKDIR /app/backend
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
