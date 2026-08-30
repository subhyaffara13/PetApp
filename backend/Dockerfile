# ==========================================
# PetSOS Backend — Production Dockerfile
# Optimized multi-stage build for Google Cloud Run
# ==========================================

FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build NestJS
COPY . .
RUN npm run build

# Prune dev dependencies for lean production image
RUN npm prune --production

# ------------------------------------------
# Production Runner
# ------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Security: Run as unprivileged node user
RUN addgroup -S petsos && adduser -S petsos -G petsos

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER petsos

EXPOSE 8080

CMD ["node", "dist/main.js"]
