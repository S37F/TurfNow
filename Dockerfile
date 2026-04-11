# ============================================
# TurfNow - Dockerfile (monolith: API + static UI)
# For split deploys use Vercel (frontend) + Railway (server) instead.
# ============================================

FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY index.html vite.config.js ./
COPY public/ ./public/
COPY src/ ./src/

ARG VITE_SUPABASE_URL=https://placeholder.supabase.co
ARG VITE_SUPABASE_ANON_KEY=placeholder-anon-key
ARG VITE_API_URL=/api

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev

COPY server/ ./

COPY --from=frontend-build /app/build ./public

RUN addgroup -g 1001 -S turfnow && \
    adduser -S turfnow -u 1001 -G turfnow

RUN chown -R turfnow:turfnow /app

USER turfnow

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENV NODE_ENV=production
CMD ["node", "server.js"]
