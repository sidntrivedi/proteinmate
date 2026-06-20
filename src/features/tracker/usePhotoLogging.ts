import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { mapVisionItems, type PhotoLogItem } from '../../domain/photoLogging';
import { recognizeProteinPhoto } from '../../services/visionClient';

export type PhotoStatus = 'idle' | 'analyzing' | 'review' | 'error';

export type PhotoSource = 'camera' | 'library';

export function usePhotoLogging() {
  const [status, setStatus] = useState<PhotoStatus>('idle');
  const [items, setItems] = useState<PhotoLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (uri: string) => {
    setStatus('analyzing');
    try {
      const extracted = await recognizeProteinPhoto(uri);
      setItems(mapVisionItems(extracted));
      setStatus('review');
    } catch {
      setError('Could not read the label. Check the proxy and try again.');
      setStatus('error');
    }
  };

  const capture = async (source: PhotoSource) => {
    setError(null);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          source === 'camera'
            ? 'Camera access is needed to log from a label.'
            : 'Photo access is needed to pick a label image.'
        );
        setStatus('error');
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });

      if (result.canceled) {
        return;
      }

      const uri = result.assets?.[0]?.uri;
      if (!uri) {
        setError('No photo was captured. Try again.');
        setStatus('error');
        return;
      }

      await analyze(uri);
    } catch {
      setError('Could not open the camera.');
      setStatus('error');
    }
  };

  const setGrams = (index: number, grams: number) => {
    const next = Number.isFinite(grams) && grams > 0 ? Math.round(grams) : 0;
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, grams: next } : item)));
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const reset = () => {
    setStatus('idle');
    setItems([]);
    setError(null);
  };

  return {
    capture,
    error,
    items,
    removeItem,
    reset,
    setGrams,
    status
  };
}
