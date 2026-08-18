FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_PREFER_BINARY=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy full context so this Dockerfile works whether Railway build context is repo root
# or backend/ subdirectory.
COPY . .

# Install dependencies from whichever requirements file exists.
# `face-recognition` is installed separately with `--no-deps` so pip does not
# try to compile `dlib` from source on Render's Linux x86_64 builders.
RUN set -eux; \
        if [ -f /app/requirements.txt ]; then \
            req_file=/app/requirements.txt; \
        elif [ -f /app/backend/requirements.txt ]; then \
            req_file=/app/backend/requirements.txt; \
        else \
            echo "requirements.txt not found in /app or /app/backend"; \
            exit 1; \
        fi; \
        grep -vE '^[[:space:]]*face-recognition==1\.3\.0([[:space:]]*#.*)?$' "$req_file" > /tmp/requirements-no-face-recognition.txt; \
        pip install --no-cache-dir --prefer-binary -r /tmp/requirements-no-face-recognition.txt; \
        pip install --no-cache-dir --prefer-binary --no-deps face-recognition==1.3.0

EXPOSE 5001

CMD ["sh", "-c", "if [ -d /app/src ]; then cd /app; exec gunicorn -w 1 -b 0.0.0.0:${PORT:-5001} src.api.app:app; elif [ -d /app/backend/src ]; then cd /app/backend; exec gunicorn -w 1 -b 0.0.0.0:${PORT:-5001} src.api.app:app; else echo 'Could not find src/ directory'; exit 1; fi"]
