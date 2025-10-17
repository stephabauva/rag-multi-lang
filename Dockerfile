# Build stage
FROM python:3.11-slim AS builder

# Set cache directories in builder
ENV SENTENCE_TRANSFORMERS_HOME=/tmp/.cache/sentence-transformers

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies globally in builder
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Pre-download English model only (~80MB, most common + fastest startup)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Runtime stage
FROM python:3.11-slim

# Set cache directories to writable locations
ENV HF_HOME=/app/.cache
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV SENTENCE_TRANSFORMERS_HOME=/app/.cache/sentence-transformers
ENV EASYOCR_MODULE_PATH=/app/.cache/easyocr
ENV PIP_NO_CACHE_DIR=1

# Copy Python packages from builder (installed globally to /usr/local)
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
# Copy pre-downloaded English model
COPY --from=builder /tmp/.cache/sentence-transformers /app/.cache/sentence-transformers

# Set working directory
WORKDIR /app

# Create cache directory with proper permissions
RUN mkdir -p /app/.cache && chmod -R 777 /app/.cache

# Copy application code
COPY backend/ backend/
COPY frontend/ frontend/

# Expose port
EXPOSE 7860

# Run the application
WORKDIR /app/backend
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
