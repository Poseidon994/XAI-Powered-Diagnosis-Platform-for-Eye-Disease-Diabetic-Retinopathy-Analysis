# ── Frontend Dockerfile (multi-stage) ────────────────────────────────────────
# Stage 1: Build the React app
# Stage 2: Serve the static bundle with nginx (tiny final image)

# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY public/ public/
COPY src/    src/

# REACT_APP_API_URL is baked in at build time.
# Override with --build-arg REACT_APP_API_URL=https://yourbackend.com
ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ─── Stage 2: Serve ──────────────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy the built React app
COPY --from=builder /app/build /usr/share/nginx/html

# nginx config: serve index.html for all routes (React Router support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]