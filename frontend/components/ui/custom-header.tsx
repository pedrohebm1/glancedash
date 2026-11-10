import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

export default function CustomHeader() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.header}>
      <View style={styles.leftContainer}>
        <View style={styles.mockIcon}><Feather size={20} name='edit' color={"white"}/></View>
        <ThemedText style={styles.text}>Glancedash</ThemedText>
      </View>

      <View style={styles.mockAvatar} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter_400Regular'
  },
  mockIcon: {
    padding: 4,
    backgroundColor: '#0055ff',
    borderRadius: 4,
  },
  mockAvatar: {
    width: 36,
    height: 36,
    backgroundColor: '#ccc',
    borderRadius: 18,
  },
});
