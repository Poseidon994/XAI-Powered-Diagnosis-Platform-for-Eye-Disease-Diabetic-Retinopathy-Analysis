# ── Backend Dockerfile ───────────────────────────────────────────────────────
# Node.js 20 LTS slim.
# Uses pg (pure JS) — no native compilation needed.

FROM node:20-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
RUN apt-get update && apt-get install -y curl
# Copy source code
COPY src/ src/

ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["node", "src/index.js"]