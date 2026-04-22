# ── ML Service Dockerfile ────────────────────────────────────────────────────
# Python 3.11 slim — matches the Kaggle training environment.
# Models are NOT baked into the image; they are mounted via docker-compose
# volume so you can update them without rebuilding.

FROM python:3.11-slim

# System libraries required by OpenCV and XGBoost
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer-cached unless requirements change)
COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir --default-timeout=1000 torch
# RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt
RUN pip install --no-cache-dir \
    --default-timeout=1000 \
    --retries=10 \
    -i https://pypi.tuna.tsinghua.edu.cn/simple \
    -r requirements.txt
RUN apt-get update && apt-get install -y curl
# Copy source code (models/ is excluded via .dockerignore and mounted at runtime)
COPY api/        api/
COPY inference/  inference/
COPY preprocessing/ preprocessing/
COPY training/   training/

# Models directory — populated by the volume mount in docker-compose.yml
RUN mkdir -p models

ENV PYTHONUNBUFFERED=1

EXPOSE 8001

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8001"]