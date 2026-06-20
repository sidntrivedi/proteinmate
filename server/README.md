# ProteinMate STT Proxy

A minimal speech-to-text proxy so the provider API key stays on the server and never ships inside the mobile app.

## Why this exists

The app records a short audio clip and uploads it here. This service forwards the audio to a cloud STT provider using a server-side key, then returns `{ "text": "..." }`. The app never sees the key.

## Run locally

```bash
cd server
npm install
cp .env.example .env   # then fill in OPENAI_API_KEY and OLLAMA_API_KEY
npm start
```

Keys are loaded automatically from `server/.env` (via `dotenv`), so you don't need to paste them on the command line. You can still override per-run, e.g. `OPENAI_API_KEY=sk-... npm start`.

From the project root you can also run `npm run server`.

The server listens on `http://localhost:8787` by default.

When testing on a physical device, point the app at your machine's LAN IP (for example `http://192.168.1.20:8787`) by setting `expo.extra.sttProxyUrl` in `app.json`, since `localhost` on the device refers to the device itself.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8787` | Port to listen on. |
| `STT_PROVIDER` | `openai` | `openai` or `deepgram`. |
| `OPENAI_API_KEY` | - | Required when provider is `openai`. |
| `OPENAI_STT_MODEL` | `gpt-4o-mini-transcribe` | OpenAI transcription model. |
| `DEEPGRAM_API_KEY` | - | Required when provider is `deepgram`. |
| `DEEPGRAM_MODEL` | `nova-3` | Deepgram model. |
| `OLLAMA_API_KEY` | - | Required for `/parse`. Create one at ollama.com/settings/keys. |
| `OLLAMA_BASE_URL` | `https://ollama.com/v1` | OpenAI-compatible Ollama Cloud endpoint. |
| `OLLAMA_PARSE_MODEL` | `gpt-oss:20b` | Model used for structured food extraction. |

## Two-stage architecture

1. `POST /transcribe` turns audio into a transcript (Stage 1).
2. `POST /parse` sends that transcript to Ollama Cloud and returns structured items (Stage 2). The app then maps those items onto its food database and computes protein deterministically, so nutrition values never depend on the model.

Both keys belong in `server/.env` (see `.env.example`):

```bash
OPENAI_API_KEY=sk-...
OLLAMA_API_KEY=...
```

## Endpoints

- `GET /health` -> `{ ok: true, provider, parseModel }`
- `POST /transcribe` -> multipart form with an `audio` file field, returns `{ text }`.
- `POST /parse` -> JSON body `{ transcript }`, returns `{ items: [{ name, quantity, unit }] }`.

## Notes

This is a reference proxy, not production infrastructure. Before deploying publicly, add authentication, rate limiting, and request-size/abuse protections.
