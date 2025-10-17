FROM python:3.11-slim

# Set cache directories to writable locations
ENV HF_HOME=/app/.cache
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV SENTENCE_TRANSFORMERS_HOME=/app/.cache/sentence-transformers
ENV PIP_NO_CACHE_DIR=1

# Set working directory
WORKDIR /app

# Install system dependencies and clean up in one layer
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && rm -rf /root/.cache/pip \
    && find /usr/local/lib/python3.11 -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true

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
