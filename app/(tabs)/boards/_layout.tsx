import { Stack } from 'expo-router';

export default function BoardsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Boards',
        }}
      />
    </Stack>
  );
}