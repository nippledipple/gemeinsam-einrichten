import { Stack } from 'expo-router';
import { useApp } from '@/hooks/app-store';

export default function OptionsLayout() {
  const { colors } = useApp();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Mehr Optionen',
          headerLargeTitle: true,
        }} 
      />
      <Stack.Screen 
        name="invite" 
        options={{ 
          title: 'Leute einladen',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="favorites" 
        options={{ 
          title: 'Favoriten',
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: 'Benachrichtigungen',
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Einstellungen',
        }} 
      />
      <Stack.Screen 
        name="add-room" 
        options={{ 
          title: 'Raum hinzufügen',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="join-space" 
        options={{ 
          title: 'Space beitreten',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="manage-spaces" 
        options={{ 
          title: 'Spaces verwalten',
        }} 
      />
    </Stack>
  );
}