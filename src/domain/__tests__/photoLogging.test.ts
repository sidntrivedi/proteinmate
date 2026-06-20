import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  mapVisionItems,
  photoItemBasis,
  photoItemProtein,
  toLogEntry,
  type PhotoLogItem,
  type VisionFoodItem
} from '../photoLogging';

function item(overrides: Partial<PhotoLogItem> = {}): PhotoLogItem {
  return {
    name: 'makhana',
    proteinPer100g: 9.7,
    netWeightGrams: 100,
    grams: 100,
    confidence: 'high',
    ...overrides
  };
}

describe('mapVisionItems', () => {
  it('returns nothing for empty or non-array input', () => {
    expect(mapVisionItems([])).toEqual([]);
    expect(mapVisionItems(undefined as unknown as VisionFoodItem[])).toEqual([]);
  });

  it('maps a valid item and defaults grams to the net pack weight', () => {
    const [mapped] = mapVisionItems([
      { name: 'Makhana', proteinPer100g: 9.7, netWeightGrams: 200, confidence: 'high' }
    ]);

    expect(mapped).toEqual({
      name: 'Makhana',
      proteinPer100g: 9.7,
      netWeightGrams: 200,
      grams: 200,
      confidence: 'high'
    });
  });

  it('defaults grams to 100 when no net weight is printed', () => {
    const [mapped] = mapVisionItems([{ name: 'curd', proteinPer100g: 3.1 }]);
    expect(mapped.netWeightGrams).toBeNull();
    expect(mapped.grams).toBe(100);
  });

  it('rounds a fractional net weight', () => {
    expect(mapVisionItems([{ name: 'bar', proteinPer100g: 33, netWeightGrams: 59.6 }])[0].netWeightGrams).toBe(60);
  });

  it('drops items with no name or non-positive protein', () => {
    const mapped = mapVisionItems([
      { name: '', proteinPer100g: 9 },
      { name: '   ', proteinPer100g: 9 },
      { name: 'mystery', proteinPer100g: 0 },
      { name: 'bad', proteinPer100g: -3 },
      { name: 'good', proteinPer100g: 12 }
    ]);

    expect(mapped.map((entry) => entry.name)).toEqual(['good']);
  });

  it('normalizes unknown confidence to medium and trims name', () => {
    const [mapped] = mapVisionItems([{ name: '  Whey  ', proteinPer100g: 80, confidence: 'bananas' as never }]);

    expect(mapped.name).toBe('Whey');
    expect(mapped.confidence).toBe('medium');
  });
});

describe('photoItemProtein', () => {
  it('computes protein from per-100g and grams eaten, rounded', () => {
    expect(photoItemProtein(item({ proteinPer100g: 9.7, grams: 100 }))).toBe(10);
    expect(photoItemProtein(item({ proteinPer100g: 9.7, grams: 30 }))).toBe(3);
    expect(photoItemProtein(item({ proteinPer100g: 9.7, grams: 200 }))).toBe(19);
    expect(photoItemProtein(item({ proteinPer100g: 33.3, grams: 60 }))).toBe(20);
  });
});

describe('photoItemBasis', () => {
  it('describes the per-100g basis, rounded to one decimal', () => {
    expect(photoItemBasis(item({ proteinPer100g: 9.7 }))).toBe('9.7 g protein per 100 g');
    expect(photoItemBasis(item({ proteinPer100g: 33.333 }))).toBe('33.3 g protein per 100 g');
    expect(photoItemBasis(item({ proteinPer100g: 11 }))).toBe('11 g protein per 100 g');
  });
});

describe('toLogEntry', () => {
  it('composes a flat log payload labelled by grams', () => {
    expect(toLogEntry(item({ name: 'makhana', proteinPer100g: 9.7, grams: 30 }))).toEqual({
      name: 'makhana',
      protein: 3,
      servingLabel: '30 g',
      quantityGrams: 30
    });
  });
});

// Opt-in end-to-end check against a running proxy + OpenAI vision.
// Run with: RUN_VISION_TESTS=1 VISION_TEST_IMAGE=/path/to/label.jpg npm test (server must be running)
const LIVE = process.env.RUN_VISION_TESTS === '1';
const PROXY_URL = (process.env.STT_PROXY_URL || 'http://localhost:8787').replace(/\/$/, '');
const SAMPLE_IMAGE = process.env.VISION_TEST_IMAGE;

async function recognizeViaProxy(imagePath: string): Promise<VisionFoodItem[]> {
  const buffer = readFileSync(imagePath);
  const form = new FormData();
  form.append('image', new Blob([buffer], { type: 'image/jpeg' }), basename(imagePath));

  const response = await fetch(`${PROXY_URL}/vision`, { method: 'POST', body: form });
  if (!response.ok) {
    throw new Error(`/vision failed: ${response.status}`);
  }
  const data = (await response.json()) as { items?: VisionFoodItem[] };
  return data.items ?? [];
}

describe.skipIf(!LIVE || !SAMPLE_IMAGE)('live OpenAI /vision integration', () => {
  it('reads a positive per-100g protein off a label photo', async () => {
    const extracted = await recognizeViaProxy(SAMPLE_IMAGE as string);
    const mapped = mapVisionItems(extracted);

    expect(mapped.length).toBeGreaterThan(0);
    expect(photoItemProtein(mapped[0])).toBeGreaterThan(0);
  }, 30000);
});
