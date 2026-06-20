import { describe, expect, it } from 'vitest';

import { FOOD_DB } from '../foods';
import { proteinFor } from '../nutrition';
import { mapExtractedItems, parseSpokenLog } from '../voiceParsing';

describe('parseSpokenLog', () => {
  it('returns nothing for empty or unmatched speech', () => {
    expect(parseSpokenLog('', FOOD_DB)).toEqual([]);
    expect(parseSpokenLog('   ', FOOD_DB)).toEqual([]);
    expect(parseSpokenLog('xyzzy wobble', FOOD_DB)).toEqual([]);
  });

  it('parses a single food with an English quantity and unit', () => {
    const [item, ...rest] = parseSpokenLog('two rotis', FOOD_DB);

    expect(rest).toHaveLength(0);
    expect(item.food.id).toBe('roti');
    expect(item.serving.grams).toBe(80);
    expect(item.confidence).toBe('high');
  });

  it('maps a katori unit to the matching serving grams', () => {
    const [item] = parseSpokenLog('a katori of dal', FOOD_DB);

    expect(item.food.id).toBe('dal');
    expect(item.serving.grams).toBe(150);
    expect(item.confidence).toBe('high');
  });

  it('handles Hindi number words', () => {
    const [item] = parseSpokenLog('teen egg', FOOD_DB);

    expect(item.food.id).toBe('egg');
    expect(item.serving.grams).toBe(150);
  });

  it('treats a gram quantity as an absolute weight', () => {
    const [item] = parseSpokenLog('100 grams paneer', FOOD_DB);

    expect(item.food.id).toBe('paneer');
    expect(item.serving.grams).toBe(100);
    expect(proteinFor(item.food, item.serving.grams)).toBe(18);
  });

  it('resolves food synonyms through the existing search engine', () => {
    expect(parseSpokenLog('anda', FOOD_DB)[0].food.id).toBe('egg');
    expect(parseSpokenLog('doodh', FOOD_DB)[0].food.id).toBe('milk');
  });

  it('splits multiple foods on English and Hinglish connectors', () => {
    const items = parseSpokenLog('two rotis and a katori of dal', FOOD_DB);
    expect(items.map((item) => item.food.id)).toEqual(['roti', 'dal']);
    expect(items[0].serving.grams).toBe(80);
    expect(items[1].serving.grams).toBe(150);

    const hinglish = parseSpokenLog('do roti aur ek glass doodh', FOOD_DB);
    expect(hinglish.map((item) => item.food.id)).toEqual(['roti', 'milk']);
    expect(hinglish[0].serving.grams).toBe(80);
    expect(hinglish[1].serving.grams).toBe(250);
  });

  it('falls back to the default serving when no unit is spoken', () => {
    const [item] = parseSpokenLog('paneer', FOOD_DB);

    expect(item.food.id).toBe('paneer');
    expect(item.serving).toEqual(item.food.defaultServing);
    expect(item.confidence).toBe('medium');
  });
});

describe('mapExtractedItems (LLM output -> food DB contract)', () => {
  it('returns nothing for empty input', () => {
    expect(mapExtractedItems([], FOOD_DB)).toEqual([]);
  });

  describe('food name resolution', () => {
    it('matches exact English names', () => {
      expect(mapExtractedItems([{ name: 'paneer' }], FOOD_DB)[0].food.id).toBe('paneer');
      expect(mapExtractedItems([{ name: 'chicken' }], FOOD_DB)[0].food.id).toBe('chicken-breast');
    });

    it('matches romanized Hindi names via aliases/synonyms', () => {
      const cases: Array<[string, string]> = [
        ['anda', 'egg'],
        ['doodh', 'milk'],
        ['machli', 'fish'],
        ['panir', 'paneer'],
        ['chole', 'chana'],
        ['dahi', 'greek-curd'],
        ['moongfali', 'peanuts']
      ];

      for (const [name, expectedId] of cases) {
        const [item] = mapExtractedItems([{ name }], FOOD_DB);
        expect(item, `expected "${name}" to resolve`).toBeDefined();
        expect(item.food.id, `"${name}" should map to ${expectedId}`).toBe(expectedId);
      }
    });

    it('normalizes casing and surrounding whitespace in the name', () => {
      const [item] = mapExtractedItems([{ name: '  Paneer  ' }], FOOD_DB);
      expect(item.food.id).toBe('paneer');
    });

    it('drops items whose name is missing, empty, or unmatched', () => {
      const items = mapExtractedItems(
        [
          { name: '' },
          { name: '   ' },
          { name: 'unicorn steak', quantity: 1 },
          { name: 'whey', quantity: 1, unit: 'scoop' }
        ],
        FOOD_DB
      );

      expect(items.map((item) => item.food.id)).toEqual(['whey']);
      expect(items[0].serving.grams).toBe(33);
    });
  });

  describe('countable piece units', () => {
    it('computes per-piece grams for roti, egg, idli, and dosa', () => {
      const items = mapExtractedItems(
        [
          { name: 'roti', quantity: 2, unit: 'roti' },
          { name: 'egg', quantity: 2, unit: 'egg' },
          { name: 'idli', quantity: 3, unit: 'idli' },
          { name: 'dosa', quantity: 2, unit: 'dosa' }
        ],
        FOOD_DB
      );

      expect(items.map((item) => [item.food.id, item.serving.grams])).toEqual([
        ['roti', 80],
        ['egg', 100],
        ['idli', 150],
        ['dosa', 200]
      ]);
      expect(items.every((item) => item.confidence === 'high')).toBe(true);
    });

    it('counts pieces correctly even when the LLM omits the unit', () => {
      // Robustness: the model is non-deterministic about emitting the piece unit,
      // so a unit-less explicit count must still resolve to per-piece grams.
      const withUnit = mapExtractedItems([{ name: 'roti', quantity: 2, unit: 'roti' }], FOOD_DB)[0];
      const withoutUnit = mapExtractedItems([{ name: 'roti', quantity: 2 }], FOOD_DB)[0];

      expect(withUnit.serving.grams).toBe(80);
      expect(withoutUnit.serving.grams).toBe(80);
      expect(withoutUnit.confidence).toBe('high');
    });

    it('resolves a single counted piece to one piece, not the default portion', () => {
      const [item] = mapExtractedItems([{ name: 'egg', quantity: 1 }], FOOD_DB);

      expect(item.food.id).toBe('egg');
      expect(item.serving.grams).toBe(50);
    });
  });

  describe('weight and volume units', () => {
    it('treats grams/gm/ml as an absolute weight regardless of the food', () => {
      expect(mapExtractedItems([{ name: 'paneer', quantity: 150, unit: 'grams' }], FOOD_DB)[0].serving.grams).toBe(150);
      expect(mapExtractedItems([{ name: 'paneer', quantity: 120, unit: 'gm' }], FOOD_DB)[0].serving.grams).toBe(120);
      expect(mapExtractedItems([{ name: 'milk', quantity: 500, unit: 'ml' }], FOOD_DB)[0].serving.grams).toBe(500);
    });

    it('uppercases units and trailing words are tolerated', () => {
      const [item] = mapExtractedItems([{ name: 'paneer', quantity: 100, unit: 'Grams' }], FOOD_DB);
      expect(item.serving.grams).toBe(100);
    });
  });

  describe('container units', () => {
    it('maps katori, glass, cup, bowl, and scoop to the matching serving', () => {
      const items = mapExtractedItems(
        [
          { name: 'dal', quantity: 1, unit: 'katori' },
          { name: 'milk', quantity: 1, unit: 'glass' },
          { name: 'milk', quantity: 1, unit: 'cup' },
          { name: 'greek yogurt', quantity: 1, unit: 'bowl' },
          { name: 'whey', quantity: 2, unit: 'scoop' }
        ],
        FOOD_DB
      );

      expect(items.map((item) => [item.food.id, item.serving.grams])).toEqual([
        ['dal', 150],
        ['milk', 250],
        ['milk', 200],
        ['greek-curd', 150],
        ['whey', 66]
      ]);
    });
  });

  describe('quantity handling', () => {
    it('defaults a missing, zero, or negative quantity to one default serving', () => {
      expect(mapExtractedItems([{ name: 'paneer' }], FOOD_DB)[0].serving).toEqual(FOOD_DB.find((f) => f.id === 'paneer')!.defaultServing);
      expect(mapExtractedItems([{ name: 'paneer', quantity: 0 }], FOOD_DB)[0].serving.grams).toBe(100);
      expect(mapExtractedItems([{ name: 'paneer', quantity: -3 }], FOOD_DB)[0].serving.grams).toBe(100);
    });

    it('scales the default serving for an explicit unit-less quantity', () => {
      const [item] = mapExtractedItems([{ name: 'paneer', quantity: 2 }], FOOD_DB);
      expect(item.serving.grams).toBe(200);
      expect(item.confidence).toBe('medium');
    });

    it('supports fractional quantities with a container unit', () => {
      const [item] = mapExtractedItems([{ name: 'dal', quantity: 0.5, unit: 'katori' }], FOOD_DB);
      expect(item.serving.grams).toBe(75);
      expect(item.serving.label).toBe('half katori');
    });
  });

  describe('multi-item and nutrition', () => {
    it('maps a full Hinglish-style meal and computes protein deterministically', () => {
      const items = mapExtractedItems(
        [
          { name: 'paneer', quantity: 100, unit: 'grams' },
          { name: 'roti', quantity: 2, unit: 'roti' },
          { name: 'doodh', quantity: 1, unit: 'glass' }
        ],
        FOOD_DB
      );

      expect(items.map((item) => item.food.id)).toEqual(['paneer', 'roti', 'milk']);

      const protein = items.map((item) => proteinFor(item.food, item.serving.grams));
      expect(protein).toEqual([18, 7, 9]);
    });
  });
});

// Opt-in end-to-end check against a running proxy + Ollama Cloud.
// Run with: RUN_LLM_PARSE_TESTS=1 npm test   (server must be running)
const LIVE = process.env.RUN_LLM_PARSE_TESTS === '1';
const PROXY_URL = (process.env.STT_PROXY_URL || 'http://localhost:8787').replace(/\/$/, '');

async function parseViaProxy(transcript: string) {
  const response = await fetch(`${PROXY_URL}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });
  if (!response.ok) {
    throw new Error(`/parse failed: ${response.status}`);
  }
  const data = (await response.json()) as { items?: Array<{ name: string; quantity?: number; unit?: string }> };
  return data.items ?? [];
}

describe.skipIf(!LIVE)('live Ollama /parse integration', () => {
  it('normalizes a Devanagari transcript into matched romanized foods', async () => {
    const extracted = await parseViaProxy('१०० ग्राम पनीर और २ रोटी');
    const mapped = mapExtractedItems(extracted, FOOD_DB);

    expect(mapped.map((item) => item.food.id)).toEqual(['paneer', 'roti']);
    expect(mapped[0].serving.grams).toBe(100);
    expect(mapped[1].serving.grams).toBe(80);
  }, 30000);

  it('normalizes a Hinglish transcript with countable pieces', async () => {
    const extracted = await parseViaProxy('do ande aur teen idli');
    const mapped = mapExtractedItems(extracted, FOOD_DB);

    expect(mapped.map((item) => item.food.id)).toEqual(['egg', 'idli']);
    expect(mapped[0].serving.grams).toBe(100);
    expect(mapped[1].serving.grams).toBe(150);
  }, 30000);
});
