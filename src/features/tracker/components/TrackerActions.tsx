import { Repeat2, Send } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { styles } from '../styles';

type TrackerActionsProps = {
  onRepeatYesterday: () => void;
  onShareProgress: () => void;
};

export function TrackerActions({ onRepeatYesterday, onShareProgress }: TrackerActionsProps) {
  return (
    <View style={styles.actionRow}>
      <Pressable style={styles.primaryAction} onPress={onRepeatYesterday}>
        <Repeat2 size={18} color="#fff" />
        <Text style={styles.primaryActionText}>Same as yesterday</Text>
      </Pressable>
      <Pressable style={styles.secondaryAction} onPress={onShareProgress}>
        <Send size={18} color="#16302b" />
        <Text style={styles.secondaryActionText}>Share</Text>
      </Pressable>
    </View>
  );
}
