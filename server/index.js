import 'dotenv/config';

import express from 'express';
import multer from 'multer';

const PORT = process.env.PORT || 8787;
const PROVIDER = process.env.STT_PROVIDER || 'openai';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_STT_MODEL || 'gpt-4o-mini-transcribe';
const OPENAI_VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_MODEL = process.env.DEEPGRAM_MODEL || 'nova-3';

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_PARSE_MODEL || 'gpt-oss:20b';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, provider: PROVIDER, parseModel: OLLAMA_MODEL, visionModel: OPENAI_VISION_MODEL });
});

async function transcribeWithOpenAI(file) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const form = new FormData();
  form.append('model', OPENAI_MODEL);
  form.append('response_format', 'json');
  form.append('file', new Blob([file.buffer], { type: file.mimetype || 'audio/m4a' }), file.originalname || 'audio.m4a');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form
  });

  if (!response.ok) {
    throw new Error(`OpenAI transcription failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return data.text ?? '';
}

async function transcribeWithDeepgram(file) {
  if (!DEEPGRAM_API_KEY) {
    throw new Error('DEEPGRAM_API_KEY is not set');
  }

  const response = await fetch(`https://api.deepgram.com/v1/listen?model=${DEEPGRAM_MODEL}&smart_format=true`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      'Content-Type': file.mimetype || 'audio/m4a'
    },
    body: file.buffer
  });

  if (!response.ok) {
    throw new Error(`Deepgram transcription failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  return data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
}

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Missing audio file field "audio".' });
    return;
  }

  try {
    const text = PROVIDER === 'deepgram' ? await transcribeWithDeepgram(req.file) : await transcribeWithOpenAI(req.file);
    res.json({ text });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(502).json({ error: 'Transcription failed.' });
  }
});

const PARSE_SYSTEM_PROMPT = [
  'You extract food items from a short meal-log sentence that may mix English and Hindi (Hinglish) and may be written in Devanagari script.',
  'Return ONLY JSON matching: {"items":[{"name":string,"quantity":number,"unit":string}]}.',
  'name MUST be the common food word in lowercase romanized Latin script (English or Hinglish). Never output Devanagari characters.',
  'If a food is written in Hindi/Devanagari, transliterate or translate it to its common romanized name',
  '(for example: पनीर -> paneer, रोटी -> roti, दूध -> milk, अंडा -> egg, दाल -> dal, चना -> chana, चावल -> rice, मछली -> fish, मूंगफली -> peanuts).',
  'quantity is a number (default 1). Convert Hindi number words and Devanagari digits to Arabic numerals',
  '(for example: ek -> 1, do -> 2, teen -> 3, १०० -> 100, २ -> 2).',
  'unit is the spoken unit (for example katori, roti, glass, scoop, piece, plate, grams) or an empty string if none was said.',
  'When a food is counted as whole pieces, set unit to that piece word',
  '(for example: "2 roti" -> quantity 2 unit "roti"; "do ande"/"2 अंडे" -> quantity 2 unit "egg"; "3 idli" -> quantity 3 unit "idli").',
  'Do not invent foods that were not mentioned. Output no prose, only the JSON object.'
].join(' ');

function extractJsonObject(content) {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }
    throw new Error('Model did not return valid JSON.');
  }
}

function normalizeItems(parsed) {
  if (!parsed || !Array.isArray(parsed.items)) {
    return [];
  }

  return parsed.items
    .filter((item) => item && typeof item.name === 'string' && item.name.trim())
    .map((item) => ({
      name: item.name.trim(),
      quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
      unit: typeof item.unit === 'string' ? item.unit.trim() : ''
    }));
}

async function parseTranscriptWithOllama(transcript) {
  if (!OLLAMA_API_KEY) {
    throw new Error('OLLAMA_API_KEY is not set');
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OLLAMA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PARSE_SYSTEM_PROMPT },
        { role: 'user', content: transcript }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama parse failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return normalizeItems(extractJsonObject(content));
}

app.post('/parse', async (req, res) => {
  const transcript = typeof req.body?.transcript === 'string' ? req.body.transcript.trim() : '';
  if (!transcript) {
    res.status(400).json({ error: 'Missing "transcript" string.' });
    return;
  }

  try {
    const items = await parseTranscriptWithOllama(transcript);
    res.json({ items });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(502).json({ error: 'Parsing failed.' });
  }
});

const VISION_SYSTEM_PROMPT = [
  'You read protein off a packaged food photo and express it as protein per 100 g (or per 100 ml) of the product.',
  'Return ONLY JSON matching: {"items":[{"name":string,"proteinPer100g":number,"netWeightGrams":number|null,"confidence":"high"|"medium"|"low"}]}.',
  'name: the product in lowercase romanized Latin script (never Devanagari).',
  'proteinPer100g: grams of protein per 100 g of the product. If the label gives "per 100 g" directly, use it. If it gives protein only per serving, convert it: proteinPer100g = proteinPerServing / servingGrams * 100. Treat per-100-ml as per-100-g.',
  'netWeightGrams: the net weight of the whole pack in grams if printed (so the app can default to the whole item), else null.',
  'Only use numbers actually printed on the label. Never guess or hallucinate. If protein per 100 g cannot be read or derived, return {"items":[]}.',
  'Report protein only. Do not output calories, carbs, fat, or any other nutrient. Output no prose, only the JSON object.'
].join(' ');

function toNullableNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function normalizeVisionItems(parsed) {
  if (!parsed || !Array.isArray(parsed.items)) {
    return [];
  }

  return parsed.items
    .filter(
      (item) => item && typeof item.name === 'string' && item.name.trim() && toNullableNumber(item.proteinPer100g)
    )
    .map((item) => ({
      name: item.name.trim(),
      proteinPer100g: item.proteinPer100g,
      netWeightGrams: toNullableNumber(item.netWeightGrams),
      confidence: ['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'medium'
    }));
}

async function analyzeLabelWithOpenAI(file) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const mime = file.mimetype || 'image/jpeg';
  const dataUrl = `data:${mime};base64,${file.buffer.toString('base64')}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_VISION_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: VISION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Read the protein content from this product photo.' },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI vision failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return normalizeVisionItems(extractJsonObject(content));
}

app.post('/vision', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Missing image file field "image".' });
    return;
  }

  try {
    const items = await analyzeLabelWithOpenAI(req.file);
    res.json({ items });
  } catch (error) {
    console.error('Vision error:', error);
    res.status(502).json({ error: 'Label reading failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`STT proxy listening on http://localhost:${PORT} (provider: ${PROVIDER})`);
});
