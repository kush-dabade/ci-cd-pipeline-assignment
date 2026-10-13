# CI/CD Pipeline Assignment — Experiment 4

A minimal, production-conscious **Node.js + Express + TypeScript** API, built as the application for
*Experiment 4 — Design and Implement an Integrated CI/CD Pipeline*. It will later be deployed through
**GitHub Actions → Amazon ECR → Amazon ECS Fargate**. (No AWS resources or pipeline are configured yet.)

## Endpoints

| Method | Path        | Description                                          |
| ------ | ----------- | ---------------------------------------------------- |
| GET    | `/`         | Application name, version and a short message        |
| GET    | `/health`   | Health status (HTTP 200) — used by Docker/ECS checks |
| GET    | `/api/info` | Application information (version, environment, Node) |

Unknown routes return a JSON `404`; unhandled errors return a JSON `500` without leaking internals.

## Project structure

```
src/
  app.ts        # Express app factory (routes, 404 and error handlers)
  config.ts     # Name/version from package.json, PORT parsing
  server.ts     # Starts the server on 0.0.0.0:$PORT, graceful shutdown on SIGTERM/SIGINT
tests/
  app.test.ts   # Vitest + Supertest endpoint tests
Dockerfile      # Multi-stage build, node:22-alpine, non-root user
```

## Prerequisites

- Node.js 20 or later (22 LTS recommended) and npm
- Docker (optional, for container builds)

## Local setup

```bash
npm ci            # install exact dependency versions from package-lock.json
npm run dev       # start with auto-reload at http://localhost:3000
```

Use a different port with the `PORT` environment variable:

```bash
PORT=8080 npm run dev
```

## Test

```bash
npm test             # run the test suite once
npm run test:watch   # re-run tests on file changes
npm run typecheck    # type-check sources and tests without emitting files
```

## Build and run for production

```bash
npm run build     # compile TypeScript to dist/
npm start         # run node dist/server.js
```

## Docker

```bash
# Build the image
docker build -t ci-cd-pipeline-assignment:local .

# Run it (container port 3000 -> host port 3000)
docker run --rm -p 3000:3000 --name cicd-app ci-cd-pipeline-assignment:local

# In another terminal
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/api/info
```

Notes on the image:

- **Multi-stage:** TypeScript is compiled in a build stage; the final image contains only `dist/`,
  production `node_modules` and `package.json`.
- **Non-root:** the container runs as the built-in unprivileged `node` user.
- **Port:** exposes `3000`; override with `-e PORT=...` (and adjust `-p` accordingly).
- **Health check:** the image defines a Docker `HEALTHCHECK` against `/health`.
- **Graceful shutdown:** Node runs as PID 1 directly (not via npm) so it receives `SIGTERM`
  from Docker/ECS and closes in-flight connections before exiting.

## Configuration

| Variable   | Default       | Purpose                                |
| ---------- | ------------- | -------------------------------------- |
| `PORT`     | `3000`        | Port the server listens on (`0.0.0.0`) |
| `NODE_ENV` | `development` | Reported by `/api/info`; `production` in the Docker image |

## Secrets

`.env` files, keys, certificates and AWS credentials are excluded by both `.gitignore` and
`.dockerignore`. Never commit credentials; in the CI/CD stage they will come from GitHub Actions
secrets / OIDC and ECS task roles instead.
