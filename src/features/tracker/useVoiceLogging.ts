import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder
} from 'expo-audio';
import { useState } from 'react';

import type { Food } from '../../domain/types';
import { mapExtractedItems, parseSpokenLog, type ParsedFoodItem } from '../../domain/voiceParsing';
import { parseTranscript, transcribeAudio } from '../../services/sttClient';

async function extractItems(transcript: string, foods: Food[]): Promise<ParsedFoodItem[]> {
  try {
    const extracted = await parseTranscript(transcript);
    const mapped = mapExtractedItems(extracted, foods);
    if (mapped.length > 0) {
      return mapped;
    }
  } catch {
    // Fall back to on-device rule-based parsing below.
  }

  return parseSpokenLog(transcript, foods);
}

export type VoiceStatus = 'idle' | 'recording' | 'transcribing' | 'review' | 'error';

export function useVoiceLogging(foods: Food[]) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [items, setItems] = useState<ParsedFoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startRecording = async () => {
    setError(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone access is needed to log by voice.');
        setStatus('error');
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus('recording');
    } catch {
      setError('Could not start recording.');
      setStatus('error');
    }
  };

  const stopAndTranscribe = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setError('No audio was captured. Try again.');
        setStatus('error');
        return;
      }

      setStatus('transcribing');
      const text = await transcribeAudio(uri);
      setTranscript(text);
      setItems(await extractItems(text, foods));
      setStatus('review');
    } catch {
      setError('Transcription failed. Check the STT proxy and try again.');
      setStatus('error');
    }
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const reset = () => {
    setStatus('idle');
    setTranscript('');
    setItems([]);
    setError(null);
  };

  return {
    error,
    items,
    removeItem,
    reset,
    startRecording,
    status,
    stopAndTranscribe,
    transcript
  };
}
