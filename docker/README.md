# attestatie-registratie-component-docker

Runs [`attestatie-registratie-component`](../attestatie-registratie-component) as a standalone HTTP server inside Docker. The component package itself is not modified.

## How it works

An Express server wraps ARC and exposes two endpoints that mirror the Lambda handler in the infra project:

| Method | Path | Description |
|---|---|---|
| `POST` | `/start` | Begin an issuance flow. Body: `{ "id": "<product-uuid>", "source": "openproduct" }`. Returns `{ "url": "<VerID OAuth URL>" }`. |
| `GET` | `/callback` | OAuth redirect from VerID. Redirects to `ARC_REDIRECT_URL?status=true/false`. |
| `GET` | `/health` | Health check. |
| `GET` | `/debug` | Overview of stored sessions. |

PostgreSQL is used as the session store, ensuring that issuance data persists across restarts.

## Prerequisites

- Docker + Docker Compose
- VerID credentials

## Quick start

1. **Setup configuration**
   ```bash
   cp .env.example .env
   cp flows.example.json flows.json
   ```
   *Edit `.env` and `flows.json` with your credentials and flow UUIDs.*

2. **Start with Docker Compose**
   ```bash
   docker compose up --build
   ```
   *This starts both the ARC server and a PostgreSQL database.*

The server will be available at `http://localhost:3000`.

## Configuration

### Environment variables (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VERID_ISSUER_URL` | Yes | — | VerID OAuth server base URL |
| `VERID_CLIENT_SECRET` | Yes | — | VerID client secret |
| `ARC_CALLBACK_ENDPOINT` | Yes | — | Full URL of `/callback` on this server (must match VerID's registered redirect URI) |
| `ARC_REDIRECT_URL` | No | `/` | Where to send the user after the callback. `?status=true/false` is appended. |
| `FLOWS_CONFIG_PATH` | No | `./flows.json` | Path to the flows config JSON (inside the container) |
| `OPENPRODUCT_MODE` | No | `fake` | `fake` (built-in mock) or `real` (live API) |
| `OPENPRODUCT_BASE_URL` | When `real` | — | Base URL of the OpenProduct API |
| `OPENPRODUCT_API_TOKEN` | When `real` | — | Bearer token for the OpenProduct API |
| `PORT` | No | `3000` | HTTP port |
| `FAKE_OPENPRODUCT_PORT` | No | `9876` | Internal port for the fake OpenProduct server |

### VerID flows config (`flows.json`)

Maps attestation types to VerID flow UUIDs. The `VerID` provider uses this to select the correct flow for each product type.

```json
{
  "standplaatsvergunning": { "flowUuid": "your-flow-uuid-here" }
}
```

The file is mounted into the container as a volume (see `docker-compose.yml`), so you can update it without rebuilding the image.

### OpenProduct modes

**`OPENPRODUCT_MODE=fake`** (default)

Starts a built-in mock server with one test product:

| UUID | Type |
|---|---|
| `12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4` | `standplaatsvergunning` |

Example start request:
```bash
curl -X POST http://localhost:3000/start \
  -H 'Content-Type: application/json' \
  -d '{ "id": "12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4" }'
```

**`OPENPRODUCT_MODE=real`**

Connects to a live OpenProduct API. Set `OPENPRODUCT_BASE_URL` and `OPENPRODUCT_API_TOKEN`.

## Local development (without Docker)

```bash
cd projects/attestatie-registratie-component-docker

# Install deps (uses the local component via file: reference)
npm install

# Start the dev server (hot-reload via tsx)
cp .env.example .env   # fill in values
cp flows.example.json flows.json
npm run dev
```

## Docker build details

The Dockerfile uses a two-stage build:

1. **builder** — installs dependencies (including the published `@gemeentenijmegen/attestatie-registratie-component` from npm) and compiles the server TypeScript.
2. **runtime** — minimal Alpine image with only `dist/` and `node_modules/`.
