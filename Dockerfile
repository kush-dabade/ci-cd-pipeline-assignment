# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# ---- Stage 1: install all dependencies and compile TypeScript ----
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# ---- Stage 2: install production dependencies only ----
FROM node:${NODE_VERSION} AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Stage 3: minimal runtime image ----
FROM node:${NODE_VERSION} AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

# The official Node image ships with an unprivileged "node" user.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" > /dev/null || exit 1

# Run node directly (not via npm) so it receives SIGTERM from ECS/Docker.
CMD ["node", "dist/server.js"]
