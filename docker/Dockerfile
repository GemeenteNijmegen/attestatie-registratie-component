# ---------------------------------------------------------------------------
# Stage 1: Build the server
# ---------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /build

COPY package.json ./
RUN npm install

COPY public ./public
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Runtime image
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runtime

WORKDIR /app

COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/public ./public

EXPOSE 3000

CMD ["node", "dist/server.js"]
