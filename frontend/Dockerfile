# ==========================================
# PetSOS Customer Frontend — Production Dockerfile
# Multi-stage build with Nginx Alpine
# ==========================================

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite SPA with production bundle
RUN npm run build

# ------------------------------------------
# Production Nginx Server
# ------------------------------------------
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
