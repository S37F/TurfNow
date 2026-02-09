# ============================================
# TurfNow - Dockerfile
# Multi-stage build: Frontend + Backend
# ============================================

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Copy frontend dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy frontend source
COPY index.html vite.config.js ./
COPY public/ ./public/
COPY src/ ./src/

# Build args for environment variables (passed at build time)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_DATABASE_URL
ARG VITE_API_URL=/api

# Build frontend
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine AS production

WORKDIR /app

# Copy server dependencies
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev

# Copy server source
COPY server/ ./

# Copy built frontend from stage 1
COPY --from=frontend-build /app/build ./public

# Create non-root user
RUN addgroup -g 1001 -S turfnow && \
    adduser -S turfnow -u 1001 -G turfnow

# Change ownership
RUN chown -R turfnow:turfnow /app

USER turfnow

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start server
ENV NODE_ENV=production
CMD ["node", "server.js"]
