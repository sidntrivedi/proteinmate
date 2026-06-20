# ProteinMate Roadmap

## Overview

**ProteinMate is anybody's protein tracking mate** — the fastest, lowest-friction way for anyone to hit a daily protein goal.

It is **single-metric by design**: it tracks protein and nothing else. There is first-class support for Hinglish voice and real-world serving units (katori, roti, scoop, glass), but the product is universal, not India-specific.

### Scope guardrail

The app does **one thing**: track protein.

- No calories. No carbs/fat. No general macro or "full nutrition" tracking — now or on this roadmap.
- Every feature must make protein tracking **faster, more accurate, or stickier**. If it doesn't, it is out of scope.

This guardrail exists on purpose: the moment the app tries to be a general nutrition tracker, it loses the speed and focus that make it worth using.

## Current status (shipped)

- **Core tracker** — food search, serving picker, custom foods, daily goal, streaks, and a shareable progress card.
- **Modular architecture** — `src/domain` (pure logic), `src/storage` (persistence), `src/features/tracker` (UI + hooks), `src/services` (clients).
- **Voice logging MVP** — record → transcribe → parse → review → log:
  - [src/features/tracker/useVoiceLogging.ts](../src/features/tracker/useVoiceLogging.ts) orchestrates the flow.
  - [src/services/sttClient.ts](../src/services/sttClient.ts) talks to the proxy.
  - [server/index.js](../server/index.js) exposes `/transcribe` (OpenAI STT) and `/parse` (Ollama Cloud), keeping API keys server-side.
  - `mapExtractedItems` in [src/domain/voiceParsing.ts](../src/domain/voiceParsing.ts) maps structured items onto the food DB with deterministic protein math; the parse prompt normalizes Hindi/Devanagari to romanized names.
- **Tests** — deterministic Vitest coverage for parsing/serving logic, plus opt-in live `/parse` integration tests.

## Architecture: the shared logging pipeline

Every logging method funnels into the same path. Anything that can produce an `ExtractedItem[]` (see [src/domain/types.ts](../src/domain/types.ts)) reuses the entire match → review → log flow for free.

```mermaid
flowchart LR
  voice["Voice note"] --> stt["/transcribe (STT)"]
  stt --> parse["/parse (LLM)"]
  text["Manual search"] --> items["ExtractedItem[]"]
  parse --> items
  items --> mapper["mapExtractedItems + food DB"]
  mapper --> review["Review modal"]
  label["Label photo (planned)"] --> vision["/vision: read protein + net weight"]
  vision --> confirm["Confirm amount consumed"]
  confirm --> review
  review --> log["addLogs -> protein total"]
```

Two kinds of input:

- **DB-matched** (voice, manual search): emit `ExtractedItem[]`, matched against the food DB, protein computed from `proteinPer100g`.
- **Label-sourced** (label photo): protein is read directly from the printed nutrition facts, so it bypasses the food DB entirely and is logged as a one-off entry.

## Phased roadmap

Effort is rough: S (hours), M (a session or two), L (multi-session).

### Phase 1 — Label logging & retention

- **Label photo protein logging (NEXT UP)** — photograph a packaged product's nutrition label / back. A new `/vision` proxy endpoint sends the image to **OpenAI `gpt-4o-mini`**, which reads the printed text and returns structured protein info: product name, protein per 100 g (and/or per serving), and net weight / serving size when printed. The user confirms the **amount consumed** (default: the whole package, derived from net weight), and the app logs that protein directly.
  - Protein comes from the **label, not the food DB**, so this is a one-off log entry and does **not** add to or modify the DB.
  - Why this replaces plate-photo logging: reading printed nutrition facts is far more accurate than estimating protein from a photo of a meal.
  - Add `expo-image-picker` / camera and a "Log from label" action.
  - Effort: M.
- **Protein reminders / nudges** — local notifications via `expo-notifications` (e.g. "40 g to go today"). No backend, no bot.
  - Effort: S.
- **Protein history & charts** — trends over time from `logs` in [src/storage/proteinMateStorage.ts](../src/storage/proteinMateStorage.ts): daily protein, goal-hit rate, weekly averages.
  - Effort: M.

### Phase 2 — Accuracy & protein data depth

- **Edit-after-log and one-tap re-log** — fix a logged serving; quickly repeat a common item.
  - Effort: S.
- **Expand the protein food DB** — more foods, more aliases, and better `proteinPer100g` accuracy in [src/domain/foods.ts](../src/domain/foods.ts). Directly improves match rate for voice/manual logging.
  - Effort: M.
- **Onboarding + protein-goal calculator** — bodyweight-based daily protein target that sets `goal` in [src/storage/proteinMateStorage.ts](../src/storage/proteinMateStorage.ts).
  - Effort: S-M.

### Phase 3 — Stickiness, sync & polish

- **Home-screen widget** — today's protein vs goal at a glance.
  - Effort: M.
- **Cloud backup / sync** — accounts and synced protein logs across devices.
  - Effort: L.
- **Optional messaging-bot companion** — log protein via Discord/WhatsApp, reusing the existing proxy + `mapExtractedItems`. Captured as optional, not committed.
  - Effort: M.

## Cross-cutting concerns

- **Testing** — keep domain logic deterministic and unit-tested; gate live LLM/network tests behind an env flag (`RUN_LLM_PARSE_TESTS`).
- **Cost** — STT/vision are billed per call; the single-metric protein focus keeps prompts and responses small and cheap.
- **Privacy & secrets** — all provider keys stay server-side in the proxy; the app never ships a key. `.env` is gitignored; only `server/.env.example` is tracked.

## Decisions

- **Dropped plate/food photo logging** — estimating protein from a photo of a meal is too inaccurate.
- **Label photo logging is the next build** — read protein from a product's printed nutrition label via OpenAI `gpt-4o-mini`.
- **No automatic DB updates** — label logging produces a one-off entry. The food DB is only ever updated **manually by the user, by typing** (custom foods). No Open Food Facts / barcode-number lookup and no auto-cache for now.

## Open questions

- `/vision` shape: a single multimodal call (image in, structured protein JSON out) vs an explicit two-stage flow (OCR the label, then a text LLM extracts protein). Single call is simpler/cheaper; revisit if accuracy is poor.
- Amount consumed: default to the net weight printed on the label with user override — but how to handle products where weight or per-100g protein is not clearly printed (e.g. only per-serving values).
- How to set user expectations when the label is blurry or partially readable.
