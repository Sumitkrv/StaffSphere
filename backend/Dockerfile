FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_PREFER_BINARY=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN set -eux; \
    grep -vE '^[[:space:]]*face-recognition==1\.3\.0([[:space:]]*#.*)?$' requirements.txt > /tmp/requirements-no-face-recognition.txt; \
    pip install --no-cache-dir --prefer-binary -r /tmp/requirements-no-face-recognition.txt; \
    pip install --no-cache-dir --prefer-binary --no-deps face-recognition==1.3.0

COPY . .

EXPOSE 5001

CMD ["sh", "-c", "gunicorn -w 1 -b 0.0.0.0:${PORT:-5001} src.api.app:app"]
