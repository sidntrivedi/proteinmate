import { Modal, Pressable, Text, View } from 'react-native';

import { proteinFor } from '../../../domain/nutrition';
import type { Food, MealName, Serving } from '../../../domain/types';
import { styles } from '../styles';

type ServingModalProps = {
  meal: MealName;
  selectedFood: Food | null;
  onAddLog: (food: Food, serving: Serving) => void;
  onClose: () => void;
};

export function ServingModal({ meal, selectedFood, onAddLog, onClose }: ServingModalProps) {
  return (
    <Modal visible={!!selectedFood} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          {selectedFood ? (
            <>
              <Text style={styles.sheetTitle}>{selectedFood.name}</Text>
              <Text style={styles.sheetSubtitle}>
                Choose serving for {meal.toLowerCase()} • {selectedFood.proteinPer100g}g protein/100g
              </Text>
              {selectedFood.servings.map((serving) => (
                <Pressable key={serving.label} style={styles.servingRow} onPress={() => onAddLog(selectedFood, serving)}>
                  <View>
                    <Text style={styles.servingLabel}>{serving.label}</Text>
                    <Text style={styles.servingDetail}>{serving.grams}g quantity</Text>
                  </View>
                  <Text style={styles.servingProtein}>{proteinFor(selectedFood, serving.grams)}g</Text>
                </Pressable>
              ))}
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
