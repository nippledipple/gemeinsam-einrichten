import { Stack, router } from 'expo-router';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="home"
        options={{
          title: 'Wohnideen',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('../../modal')}
              style={styles.headerButton}
            >
              <MoreVertical size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
  },
});