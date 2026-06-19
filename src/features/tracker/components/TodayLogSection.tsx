import { Target, X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { FoodLog } from '../../../domain/types';
import { styles } from '../styles';

type TodayLogSectionProps = {
  logs: FoodLog[];
  onRemoveLog: (id: string) => void;
};

export function TodayLogSection({ logs, onRemoveLog }: TodayLogSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today's log</Text>
      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Target size={28} color="#61746b" />
          <Text style={styles.emptyTitle}>No protein logged yet</Text>
          <Text style={styles.emptyText}>Start with the thing you already ate. Accuracy beats memory.</Text>
        </View>
      ) : (
        logs.map((log) => (
          <View key={log.id} style={styles.logRow}>
            <View>
              <Text style={styles.logName}>{log.foodName}</Text>
              <Text style={styles.logDetail}>
                {log.meal} • {log.servingLabel}
              </Text>
            </View>
            <View style={styles.logRight}>
              <Text style={styles.logProtein}>{log.protein}g</Text>
              <Pressable onPress={() => onRemoveLog(log.id)} style={styles.deleteButton}>
                <X size={15} color="#7a3b30" />
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
