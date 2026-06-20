import { Check, Mic, Square, X } from 'lucide-react-native';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { proteinFor } from '../../../domain/nutrition';
import type { ParsedFoodItem } from '../../../domain/voiceParsing';
import { styles } from '../styles';

type VoiceLogModalProps = {
  isOpen: boolean;
  status: 'idle' | 'recording' | 'transcribing' | 'review' | 'error';
  transcript: string;
  items: ParsedFoodItem[];
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
  onClose: () => void;
};

const STATUS_COPY: Record<VoiceLogModalProps['status'], string> = {
  idle: 'Tap the mic and say what you ate.',
  recording: 'Listening... tap again to finish.',
  transcribing: 'Transcribing your meal...',
  review: 'Review the matches, then log them.',
  error: 'Something went wrong.'
};

export function VoiceLogModal({
  isOpen,
  status,
  transcript,
  items,
  error,
  onStart,
  onStop,
  onRemoveItem,
  onConfirm,
  onClose
}: VoiceLogModalProps) {
  const isRecording = status === 'recording';
  const isBusy = status === 'transcribing';

  const handleMicPress = () => {
    if (isRecording) {
      onStop();
    } else if (!isBusy) {
      onStart();
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Log by voice</Text>
          <Text style={styles.sheetSubtitle}>Try "two rotis and a katori of dal".</Text>

          <Pressable
            style={[styles.voiceMicButton, isRecording && styles.voiceMicButtonActive]}
            onPress={handleMicPress}
            disabled={isBusy}
          >
            {isBusy ? (
              <ActivityIndicator color="#fff" />
            ) : isRecording ? (
              <Square size={30} color="#fff" />
            ) : (
              <Mic size={34} color="#fff" />
            )}
          </Pressable>

          <Text style={status === 'error' ? styles.voiceErrorText : styles.voiceStatusText}>
            {status === 'error' && error ? error : STATUS_COPY[status]}
          </Text>

          {transcript ? <Text style={styles.voiceTranscript}>"{transcript}"</Text> : null}

          {status === 'review' ? (
            <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
              {items.length === 0 ? (
                <Text style={styles.voiceStatusText}>No foods matched. Try saying it again more simply.</Text>
              ) : (
                items.map((item, index) => (
                  <View key={`${item.food.id}-${index}`} style={styles.servingRow}>
                    <View>
                      <Text style={styles.servingLabel}>{item.food.name}</Text>
                      <Text style={styles.servingDetail}>{item.serving.label}</Text>
                    </View>
                    <View style={styles.voiceItemRight}>
                      <Text style={styles.servingProtein}>{proteinFor(item.food, item.serving.grams)}g</Text>
                      <Pressable onPress={() => onRemoveItem(index)} style={styles.voiceItemRemove}>
                        <X size={15} color="#7a3b30" />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          ) : null}

          {status === 'review' && items.length > 0 ? (
            <Pressable style={styles.saveButton} onPress={onConfirm}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Log {items.length} item{items.length > 1 ? 's' : ''}</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
