import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          title: 'Wohnideen',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('../../modal')}
              style={{ padding: 8 }}
            >
              <MoreVertical size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}