import { Tabs } from 'expo-router';
import { Home, Search, Grid3X3, MoreHorizontal } from 'lucide-react-native';
import { useApp } from '@/hooks/app-store';

export default function TabsLayout() {
  const { colors } = useApp();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Hinzufügen',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="boards"
        options={{
          title: 'Boards',
          tabBarIcon: ({ color, size }) => <Grid3X3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="options"
        options={{
          title: 'Mehr',
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}