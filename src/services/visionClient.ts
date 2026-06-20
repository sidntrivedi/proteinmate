import Constants from 'expo-constants';

import type { VisionFoodItem } from '../domain/photoLogging';

function resolveProxyUrl(): string {
  const fromExtra = (Constants.expoConfig?.extra as { sttProxyUrl?: string } | undefined)?.sttProxyUrl;
  return (fromExtra ?? 'http://localhost:8787').replace(/\/$/, '');
}

function guessImageType(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

export async function recognizeProteinPhoto(fileUri: string): Promise<VisionFoodItem[]> {
  const proxyUrl = resolveProxyUrl();
  const type = guessImageType(fileUri);
  const name = fileUri.split('/').pop() || 'label.jpg';

  const form = new FormData();
  form.append('image', {
    uri: fileUri,
    name,
    type
  } as unknown as Blob);

  const response = await fetch(`${proxyUrl}/vision`, {
    method: 'POST',
    body: form
  });

  if (!response.ok) {
    throw new Error(`Vision request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { items?: VisionFoodItem[] };
  return Array.isArray(data.items) ? data.items : [];
}
