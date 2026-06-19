import { Check } from 'lucide-react-native';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '../styles';

type CustomFoodModalProps = {
  customName: string;
  customProtein: string;
  customServing: string;
  isOpen: boolean;
  onChangeName: (value: string) => void;
  onChangeProtein: (value: string) => void;
  onChangeServing: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function CustomFoodModal({
  customName,
  customProtein,
  customServing,
  isOpen,
  onChangeName,
  onChangeProtein,
  onChangeServing,
  onClose,
  onSave
}: CustomFoodModalProps) {
  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Add packaged food</Text>
          <Text style={styles.sheetSubtitle}>Use the nutrition label now. OCR and barcode can plug into this later.</Text>
          <TextInput
            value={customName}
            onChangeText={onChangeName}
            placeholder="Brand + product name"
            placeholderTextColor="#7f9087"
            style={styles.input}
          />
          <TextInput
            value={customProtein}
            onChangeText={onChangeProtein}
            placeholder="Protein per 100 g"
            placeholderTextColor="#7f9087"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            value={customServing}
            onChangeText={onChangeServing}
            placeholder="Serving size in grams"
            placeholderTextColor="#7f9087"
            keyboardType="numeric"
            style={styles.input}
          />
          <Pressable style={styles.saveButton} onPress={onSave}>
            <Check size={18} color="#fff" />
            <Text style={styles.saveButtonText}>Save and log</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
