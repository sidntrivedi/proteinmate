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
- **Label photo logging** — snap a product label → read protein per 100 g → enter grams eaten → log:
  - [src/features/tracker/usePhotoLogging.ts](../src/features/tracker/usePhotoLogging.ts) drives capture (camera/library via `expo-image-picker`) → analyze → review.
  - [src/services/visionClient.ts](../src/services/visionClient.ts) posts the image to the proxy.
  - [server/index.js](../server/index.js) exposes `/vision` (OpenAI `gpt-4o-mini`, single multimodal call) returning protein-only JSON normalized to **protein per 100 g**: `proteinPer100g` (per-serving labels are converted), `netWeightGrams` (whole-pack weight when printed), `confidence`.
  - `mapVisionItems` in [src/domain/photoLogging.ts](../src/domain/photoLogging.ts) turns the model output into reviewable items; the grams field defaults to the net pack weight (whole item) when known, the user edits the grams they ate, protein = `round(proteinPer100g * grams / 100)`, and `addPhotoLogs` writes one-off entries (no food-DB write).
- **Tests** — deterministic Vitest coverage for parsing/serving and photo-logging logic, plus opt-in live `/parse` and `/vision` integration tests.

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
  label["Label photo"] --> vision["/vision: protein per 100 g + net weight"]
  vision --> photoReview["PhotoLogModal: grams eaten + confirm"]
  photoReview --> photoLog["addPhotoLogs -> one-off entry"]
  review --> log["addLogs -> protein total"]
  photoLog --> log
```

Two kinds of input:

- **DB-matched** (voice, manual search): emit `ExtractedItem[]`, matched against the food DB, protein computed from `proteinPer100g`.
- **Label-sourced** (label photo): protein is read directly from the printed nutrition facts, so it bypasses the food DB entirely and is logged as a one-off entry.

## Phased roadmap

Effort is rough: S (hours), M (a session or two), L (multi-session).

### Phase 1 — Label logging & retention

- **Label photo protein logging (SHIPPED)** — photograph a packaged product's nutrition label / back. The `/vision` proxy endpoint sends the image to **OpenAI `gpt-4o-mini`** (single multimodal call), which reads the printed text and returns protein-only JSON normalized to **protein per 100 g** (`proteinPer100g`, with per-serving labels converted server-side), plus **net pack weight** (`netWeightGrams`) when printed. In the review modal the grams field defaults to the whole pack when its weight is known (otherwise 100 g); the user edits how many grams they ate and the total is `round(proteinPer100g × grams / 100)`.
  - Protein comes from the **label, not the food DB**, so this is a one-off log entry and does **not** add to or modify the DB.
  - Why this replaced plate-photo logging: reading printed nutrition facts is far more accurate than estimating protein from a photo of a meal.
  - Built with `expo-image-picker` (camera + library) behind a "Log from label" action.
  - **Follow-ups (deferred):** on-device cache of known products so re-shooting the same pack is instant/offline; count-based input for discrete items (bars, scoops) where grams feel awkward; server-side shared cache (barcode/image hash → result) once the proxy is a real backend.
- **Protein reminders / nudges (NEXT UP)** — local notifications via `expo-notifications` (e.g. "40 g to go today"). No backend, no bot.
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

- **Testing** — keep domain logic deterministic and unit-tested; gate live LLM/network tests behind env flags (`RUN_LLM_PARSE_TESTS` for `/parse`, `RUN_VISION_TESTS` + `VISION_TEST_IMAGE` for `/vision`).
- **Cost** — STT/vision are billed per call; the single-metric protein focus keeps prompts and responses small and cheap.
- **Privacy & secrets** — all provider keys stay server-side in the proxy; the app never ships a key. `.env` is gitignored; only `server/.env.example` is tracked.

## Decisions

- **Dropped plate/food photo logging** — estimating protein from a photo of a meal is too inaccurate.
- **Label photo logging shipped** — read protein from a product's printed nutrition label via OpenAI `gpt-4o-mini`.
- **`/vision` is a single multimodal call** — image in, structured protein JSON out. Simpler and cheaper than an explicit OCR-then-LLM two-stage; revisit only if accuracy on messy labels is poor.
- **Normalize to protein per 100 g, then ask grams eaten (v1)** — the model reports `proteinPer100g` (converting any per-serving value) plus the net pack weight when printed; the app defaults the amount to the whole pack and lets the user type the grams they ate, computing `round(proteinPer100g * grams / 100)` client-side. Deliberately simple and works well for weighable foods (curd/yoghurt, makhana, paneer) and packs/bars whose net weight is printed. This replaced an earlier per-serving-count design that produced an unintuitive "0.3 servings" for per-100 g bulk products, and the still-earlier whole-pack guess that invented a weight the user never entered.
- **No automatic DB updates** — label logging produces a one-off entry. The food DB is only ever updated **manually by the user, by typing** (custom foods). No Open Food Facts / barcode-number lookup and no auto-cache for now.

## Open questions

- Grams-only input assumes the user can estimate grams. For discrete items (bars, scoops, biscuits) a "count × per-unit" entry may feel more natural — worth a follow-up that switches input mode based on the label basis.
- How to set user expectations when the label is blurry or partially readable (surface the returned `confidence`?).
- Caching: on-device "known products" store and/or a server-side shared cache to avoid paying OpenAI for the same pack repeatedly (see Phase 1 follow-ups).
