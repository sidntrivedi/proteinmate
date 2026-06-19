import { describe, expect, it } from 'vitest';

import { FOOD_DB } from '../foods';
import { proteinFor } from '../nutrition';

describe('proteinFor', () => {
  it('calculates rounded protein from grams and protein per 100g', () => {
    const whey = FOOD_DB.find((food) => food.id === 'whey');

    expect(whey).toBeDefined();
    expect(proteinFor(whey!, 33)).toBe(25);
  });

  it('scales protein for arbitrary serving sizes', () => {
    const paneer = FOOD_DB.find((food) => food.id === 'paneer');

    expect(paneer).toBeDefined();
    expect(proteinFor(paneer!, 150)).toBe(27);
  });
});
