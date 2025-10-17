# Build stage
FROM python:3.11-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /tmp/
RUN pip install --user --no-cache-dir -r /tmp/requirements.txt

# Runtime stage
FROM python:3.11-slim

# Set cache directories to writable locations
ENV HF_HOME=/app/.cache
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV SENTENCE_TRANSFORMERS_HOME=/app/.cache/sentence-transformers
ENV EASYOCR_MODULE_PATH=/app/.cache/easyocr
ENV PIP_NO_CACHE_DIR=1
ENV PATH=/root/.local/bin:$PATH

# Copy Python packages from builder and fix permissions
COPY --from=builder /root/.local /root/.local
RUN chmod -R 755 /root/.local

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
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
