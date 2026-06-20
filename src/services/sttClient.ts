import Constants from 'expo-constants';

import type { ExtractedItem } from '../domain/types';

function resolveProxyUrl(): string {
  const fromExtra = (Constants.expoConfig?.extra as { sttProxyUrl?: string } | undefined)?.sttProxyUrl;
  return (fromExtra ?? 'http://localhost:8787').replace(/\/$/, '');
}

function guessAudioType(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'wav':
      return 'audio/wav';
    case 'mp3':
      return 'audio/mpeg';
    case 'caf':
      return 'audio/x-caf';
    case 'm4a':
    default:
      return 'audio/m4a';
  }
}

export async function transcribeAudio(fileUri: string): Promise<string> {
  const proxyUrl = resolveProxyUrl();
  const type = guessAudioType(fileUri);
  const name = fileUri.split('/').pop() || 'audio.m4a';

  const form = new FormData();
  form.append('audio', {
    uri: fileUri,
    name,
    type
  } as unknown as Blob);

  const response = await fetch(`${proxyUrl}/transcribe`, {
    method: 'POST',
    body: form
  });

  if (!response.ok) {
    throw new Error(`Transcription request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { text?: string };
  return (data.text ?? '').trim();
}

export async function parseTranscript(transcript: string): Promise<ExtractedItem[]> {
  const proxyUrl = resolveProxyUrl();

  const response = await fetch(`${proxyUrl}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript })
  });

  if (!response.ok) {
    throw new Error(`Parse request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { items?: ExtractedItem[] };
  return Array.isArray(data.items) ? data.items : [];
}
