import { Mic, Repeat2, Send } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { styles } from '../styles';

type TrackerActionsProps = {
  onRepeatYesterday: () => void;
  onShareProgress: () => void;
  onVoiceLog: () => void;
};

export function TrackerActions({ onRepeatYesterday, onShareProgress, onVoiceLog }: TrackerActionsProps) {
  return (
    <View style={styles.actionRow}>
      <Pressable style={styles.primaryAction} onPress={onVoiceLog}>
        <Mic size={18} color="#fff" />
        <Text style={styles.primaryActionText}>Log by voice</Text>
      </Pressable>
      <Pressable style={styles.secondaryAction} onPress={onRepeatYesterday}>
        <Repeat2 size={18} color="#16302b" />
        <Text style={styles.secondaryActionText}>Repeat</Text>
      </Pressable>
      <Pressable style={styles.secondaryAction} onPress={onShareProgress}>
        <Send size={18} color="#16302b" />
        <Text style={styles.secondaryActionText}>Share</Text>
      </Pressable>
    </View>
  );
}
