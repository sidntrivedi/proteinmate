import { Camera } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { styles } from '../styles';

type AppHeaderProps = {
  onAddFoodPress: () => void;
};

export function AppHeader({ onAddFoodPress }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.kicker}>ProteinMate</Text>
        <Text style={styles.title}>Hit today before dinner negotiates.</Text>
      </View>
      <Pressable style={styles.iconButton} onPress={onAddFoodPress}>
        <Camera size={22} color="#16302b" />
      </Pressable>
    </View>
  );
}
