import { normalizeSearchText, searchFoods } from './search';
import type { ExtractedItem, Food, Serving } from './types';

export type { ExtractedItem };

export type ParseConfidence = 'high' | 'medium' | 'low';

export type ParsedFoodItem = {
  food: Food;
  serving: Serving;
  rawPhrase: string;
  confidence: ParseConfidence;
};

const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
  couple: 2,
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  chaar: 4,
  panch: 5,
  paanch: 5,
  che: 6,
  chhe: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  aadha: 0.5,
  aadhi: 0.5,
  dedh: 1.5,
  dhai: 2.5,
  dhaai: 2.5
};

const FILLER_WORDS = new Set(['of', 'some', 'the', 'and', 'with', 'plus', 'also', 'aur']);

const GRAM_UNITS = new Set(['g', 'gram', 'grams', 'gm', 'gms', 'gramme', 'grammes', 'ml']);

const UNIT_TOKENS = new Set([
  'katori',
  'roti',
  'chapati',
  'phulka',
  'glass',
  'cup',
  'scoop',
  'bowl',
  'piece',
  'plate',
  'egg',
  'idli',
  'dosa',
  'handful',
  'slice',
  'spoon',
  'tbsp',
  'tablespoon'
]);

function singularize(token: string): string {
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) {
    return token.replace(/(es|s)$/, (match) => (match === 'es' ? 'e' : ''));
  }
  return token;
}

function leadingNumber(label: string): number {
  const match = label.match(/^\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 1;
}

function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) {
    return String(quantity);
  }
  if (quantity === 0.5) {
    return 'half';
  }
  return String(quantity);
}

function splitIntoChunks(transcript: string): string[] {
  return transcript
    .toLowerCase()
    .split(/\s+(?:and|aur|plus|with|also)\s+|[,&]|\bplus\b/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function findUnitServing(food: Food, unit: string): { perUnitGrams: number } | null {
  let best: { perUnitGrams: number; baseCount: number } | null = null;

  for (const serving of food.servings) {
    const words = normalizeSearchText(serving.label).split(' ').map(singularize);
    if (!words.includes(unit)) {
      continue;
    }

    const baseCount = leadingNumber(serving.label);
    const perUnitGrams = serving.grams / baseCount;
    if (!best || baseCount < best.baseCount) {
      best = { perUnitGrams, baseCount };
    }
  }

  return best ? { perUnitGrams: best.perUnitGrams } : null;
}

function deriveServing(
  food: Food,
  quantity: number,
  quantityExplicit: boolean,
  unit: string | null,
  unitIsGrams: boolean
): { serving: Serving; matched: boolean } {
  if (unit && unitIsGrams) {
    const grams = Math.round(quantity);
    return { serving: { label: `${grams} g`, grams }, matched: quantityExplicit };
  }

  if (unit) {
    const unitServing = findUnitServing(food, unit);
    if (unitServing) {
      const grams = Math.round(unitServing.perUnitGrams * quantity);
      return { serving: { label: `${formatQuantity(quantity)} ${unit}`, grams }, matched: true };
    }
  }

  // Countable foods (e.g. egg, roti, idli, dosa) carry per-piece servings keyed by
  // their own name. An explicit count with no spoken unit should use that per-piece
  // weight rather than scaling the default serving, so "2 roti" stays 2 pieces even
  // when the transcript/LLM omits the unit word.
  if (quantityExplicit) {
    const pieceToken = normalizeSearchText(food.name).split(' ')[0];
    const pieceServing = pieceToken ? findUnitServing(food, singularize(pieceToken)) : null;
    if (pieceServing) {
      const grams = Math.round(pieceServing.perUnitGrams * quantity);
      return { serving: { label: `${formatQuantity(quantity)} ${pieceToken}`, grams }, matched: true };
    }
  }

  if (quantityExplicit && quantity !== 1) {
    const grams = Math.round(food.defaultServing.grams * quantity);
    return { serving: { label: `${formatQuantity(quantity)} x ${food.defaultServing.label}`, grams }, matched: false };
  }

  return { serving: food.defaultServing, matched: false };
}

function classifyUnit(rawUnit?: string): { unit: string | null; unitIsGrams: boolean } {
  const normalized = normalizeSearchText(rawUnit ?? '');
  if (!normalized) {
    return { unit: null, unitIsGrams: false };
  }

  const token = normalized.split(' ')[0];
  const singular = singularize(token);

  if (GRAM_UNITS.has(token) || GRAM_UNITS.has(singular)) {
    return { unit: 'g', unitIsGrams: true };
  }

  if (UNIT_TOKENS.has(singular)) {
    return { unit: singular, unitIsGrams: false };
  }

  return { unit: null, unitIsGrams: false };
}

function resolveItem(params: {
  foodQuery: string;
  quantity: number;
  quantityExplicit: boolean;
  unit: string | null;
  unitIsGrams: boolean;
  rawPhrase: string;
  foods: Food[];
}): ParsedFoodItem | null {
  const { foodQuery, quantity, quantityExplicit, unit, unitIsGrams, rawPhrase, foods } = params;
  if (!foodQuery.trim()) {
    return null;
  }

  const matches = searchFoods(foods, foodQuery);
  if (matches.length === 0) {
    return null;
  }

  const food = matches[0];
  const { serving, matched } = deriveServing(food, quantity, quantityExplicit, unit, unitIsGrams);
  return { food, serving, rawPhrase, confidence: matched ? 'high' : 'medium' };
}

function parseChunk(chunk: string, foods: Food[]): ParsedFoodItem | null {
  const tokens = normalizeSearchText(chunk).split(' ').filter(Boolean);
  if (tokens.length === 0) {
    return null;
  }

  let quantity = 1;
  let quantityExplicit = false;
  let unit: string | null = null;
  let unitIsGrams = false;
  const foodTokens: string[] = [];

  for (const token of tokens) {
    if (/^\d+(?:\.\d+)?$/.test(token)) {
      quantity = Number(token);
      quantityExplicit = true;
      continue;
    }

    if (token in NUMBER_WORDS) {
      quantity = NUMBER_WORDS[token];
      quantityExplicit = true;
      continue;
    }

    const singular = singularize(token);

    if (GRAM_UNITS.has(token) || GRAM_UNITS.has(singular)) {
      unit = unit ?? 'g';
      unitIsGrams = true;
      continue;
    }

    if (!unit && UNIT_TOKENS.has(singular)) {
      unit = singular;
    }

    if (FILLER_WORDS.has(token)) {
      continue;
    }

    foodTokens.push(singular);
  }

  return resolveItem({
    foodQuery: foodTokens.join(' ').trim(),
    quantity,
    quantityExplicit,
    unit,
    unitIsGrams,
    rawPhrase: chunk.trim(),
    foods
  });
}

export function parseSpokenLog(transcript: string, foods: Food[]): ParsedFoodItem[] {
  if (!transcript.trim()) {
    return [];
  }

  return splitIntoChunks(transcript)
    .map((chunk) => parseChunk(chunk, foods))
    .filter((item): item is ParsedFoodItem => item !== null);
}

export function mapExtractedItems(items: ExtractedItem[], foods: Food[]): ParsedFoodItem[] {
  return items
    .map((item) => {
      const name = (item.name ?? '').trim();
      if (!name) {
        return null;
      }

      const quantityExplicit = typeof item.quantity === 'number' && item.quantity > 0;
      const quantity = quantityExplicit ? (item.quantity as number) : 1;
      const { unit, unitIsGrams } = classifyUnit(item.unit);
      const rawPhrase = [quantityExplicit ? item.quantity : null, item.unit, name]
        .filter((part) => part !== null && part !== undefined && `${part}`.trim())
        .join(' ')
        .trim();

      return resolveItem({
        foodQuery: normalizeSearchText(name),
        quantity,
        quantityExplicit,
        unit,
        unitIsGrams,
        rawPhrase: rawPhrase || name,
        foods
      });
    })
    .filter((item): item is ParsedFoodItem => item !== null);
}
