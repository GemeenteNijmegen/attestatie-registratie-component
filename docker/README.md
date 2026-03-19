# Docker Wrapper

Minimal Express server wrapper for AttestationRegistrationComponent.

## Environment Variables

- `VERID_ISSUER_URI` - VerID issuer URI
- `VERID_REDIRECT_URI` - Redirect URI after attestation
- `VERID_CLIENT_ID` - VerID client ID
- `VERID_CLIENT_SECRET` - VerID client secret
- `PORT` - Server port (default: 3000)

## Build & Run

```bash
docker build -t attestation-service .
docker run -p 3000:3000 \
  -e VERID_ISSUER_URI=https://oauth.ssi.dev.ver.garden \
  -e VERID_REDIRECT_URI=https://your-domain.com/callback \
  -e VERID_CLIENT_ID=your-client-id \
  -e VERID_CLIENT_SECRET=your-secret \
  attestation-service
```

Or with docker-compose:

```bash
docker-compose up
```

## Endpoints

- `POST /start` - Start attestation flow
  - Body: `{ "type": "producten", "id": "product-uuid" }`
  - Returns: `{ "url": "verid-url" }`

- `GET /callback` - Handle VerID callback
  - Query params from VerID redirect
  - Returns: `{ "success": true/false }`
