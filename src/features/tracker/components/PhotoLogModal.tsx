import { Camera, Check, ImageIcon, X } from 'lucide-react-native';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { photoItemBasis, photoItemProtein, type PhotoLogItem } from '../../../domain/photoLogging';
import type { PhotoSource, PhotoStatus } from '../usePhotoLogging';
import { styles } from '../styles';

type PhotoLogModalProps = {
  isOpen: boolean;
  status: PhotoStatus;
  items: PhotoLogItem[];
  error: string | null;
  onCapture: (source: PhotoSource) => void;
  onSetGrams: (index: number, grams: number) => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
  onClose: () => void;
};

const STATUS_COPY: Record<PhotoStatus, string> = {
  idle: 'Snap a product label or pack and ProteinMate reads the protein.',
  analyzing: 'Reading the label...',
  review: 'Enter how many grams you ate — we use the label below to total it.',
  error: 'Something went wrong.'
};

export function PhotoLogModal({
  isOpen,
  status,
  items,
  error,
  onCapture,
  onSetGrams,
  onRemoveItem,
  onConfirm,
  onClose
}: PhotoLogModalProps) {
  const showCapture = status === 'idle' || status === 'error';

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Log from label</Text>
          <Text style={status === 'error' ? styles.voiceErrorText : styles.sheetSubtitle}>
            {status === 'error' && error ? error : STATUS_COPY[status]}
          </Text>

          {showCapture ? (
            <View style={styles.photoActionRow}>
              <Pressable style={styles.photoCaptureButton} onPress={() => onCapture('camera')}>
                <Camera size={18} color="#fff" />
                <Text style={styles.photoCaptureText}>Take photo</Text>
              </Pressable>
              <Pressable
                style={[styles.photoCaptureButton, styles.photoCaptureButtonSecondary]}
                onPress={() => onCapture('library')}
              >
                <ImageIcon size={18} color="#16302b" />
                <Text style={[styles.photoCaptureText, styles.photoCaptureTextSecondary]}>Choose photo</Text>
              </Pressable>
            </View>
          ) : null}

          {status === 'analyzing' ? <ActivityIndicator color="#16302b" style={{ marginTop: 20 }} /> : null}

          {status === 'review' ? (
            <ScrollView style={{ maxHeight: 340 }} keyboardShouldPersistTaps="handled">
              {items.length === 0 ? (
                <Text style={styles.voiceStatusText}>
                  No protein found on that photo. Try a clearer shot of the nutrition label.
                </Text>
              ) : (
                items.map((item, index) => (
                  <View key={`${item.name}-${index}`} style={styles.photoItem}>
                    <View style={styles.photoItemTop}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.servingLabel}>{item.name}</Text>
                        <Text style={styles.photoBasis}>{photoItemBasis(item)}</Text>
                      </View>
                      <View style={styles.voiceItemRight}>
                        <Text style={styles.servingProtein}>{photoItemProtein(item)}g</Text>
                        <Pressable onPress={() => onRemoveItem(index)} style={styles.voiceItemRemove}>
                          <X size={15} color="#7a3b30" />
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.photoItemControls}>
                      <Text style={styles.photoGramsPrompt}>I ate</Text>
                      <TextInput
                        style={styles.photoGramsInput}
                        value={item.grams ? String(item.grams) : ''}
                        onChangeText={(text) => onSetGrams(index, Number(text.replace(/[^0-9]/g, '')))}
                        keyboardType="number-pad"
                        maxLength={5}
                        placeholder="0"
                        placeholderTextColor="#9aa89f"
                        selectTextOnFocus
                      />
                      <Text style={styles.photoGramsPrompt}>g</Text>
                      {item.netWeightGrams && item.grams !== item.netWeightGrams ? (
                        <Pressable
                          style={styles.photoWholePack}
                          onPress={() => onSetGrams(index, item.netWeightGrams as number)}
                        >
                          <Text style={styles.photoWholePackText}>Whole pack ({item.netWeightGrams} g)</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          ) : null}

          {status === 'review' && items.length > 0 ? (
            <Pressable style={styles.saveButton} onPress={onConfirm}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveButtonText}>
                Log {items.length} item{items.length > 1 ? 's' : ''}
              </Text>
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
