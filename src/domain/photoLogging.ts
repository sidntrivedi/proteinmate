export type VisionConfidence = 'high' | 'medium' | 'low';

// Raw item as returned by the server `/vision` endpoint. Protein is normalized
// to grams per 100 g of the product (per-serving values are converted server-side).
export type VisionFoodItem = {
  name: string;
  proteinPer100g: number;
  netWeightGrams?: number | null;
  confidence?: VisionConfidence;
};

// Reviewable item shown in the confirm step. `grams` is how much the user says
// they ate (defaults to the whole pack when its weight is known, else 100 g).
export type PhotoLogItem = {
  name: string;
  proteinPer100g: number;
  netWeightGrams: number | null;
  grams: number;
  confidence: VisionConfidence;
};

// Flat payload used to build a FoodLog entry.
export type PhotoLogEntry = {
  name: string;
  protein: number;
  servingLabel: string;
  quantityGrams: number;
};

const DEFAULT_GRAMS = 100;

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function normalizeConfidence(value: unknown): VisionConfidence {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'medium';
}

function roundTo1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function mapVisionItems(items: VisionFoodItem[]): PhotoLogItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const name = (item?.name ?? '').trim();
      if (!name || !isPositiveNumber(item?.proteinPer100g)) {
        return null;
      }

      const netWeightGrams = isPositiveNumber(item.netWeightGrams) ? Math.round(item.netWeightGrams) : null;

      return {
        name,
        proteinPer100g: item.proteinPer100g,
        netWeightGrams,
        grams: netWeightGrams ?? DEFAULT_GRAMS,
        confidence: normalizeConfidence(item.confidence)
      } satisfies PhotoLogItem;
    })
    .filter((item): item is PhotoLogItem => item !== null);
}

export function photoItemProtein(item: PhotoLogItem): number {
  return Math.round((item.proteinPer100g * item.grams) / 100);
}

// "9.7 g protein per 100 g" — the basis the label printed (normalized).
export function photoItemBasis(item: PhotoLogItem): string {
  return `${roundTo1(item.proteinPer100g)} g protein per 100 g`;
}

export function toLogEntry(item: PhotoLogItem): PhotoLogEntry {
  return {
    name: item.name,
    protein: photoItemProtein(item),
    servingLabel: `${item.grams} g`,
    quantityGrams: item.grams
  };
}
