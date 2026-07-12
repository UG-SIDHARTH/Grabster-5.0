# Base stage
FROM node:20-slim

# Install system dependencies: Python3 (required by yt-dlp), FFmpeg, and curl
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    curl \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Download and install the latest yt-dlp binary directly from GitHub releases
# This guarantees we bypass signature/bot limitations present in older apt repository packages
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy dependency manifests and install packages
COPY package*.json ./
RUN npm ci --only=production

# Copy all backend source code
COPY . .

# Ensure required run-time folders exist and have correct access permissions
RUN mkdir -p downloads temp cookies && chmod -R 777 downloads temp cookies

# Expose API and static serving port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Node process health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
