import { useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useApp } from '@/hooks/app-store';

export default function IndexScreen() {
  const { currentUser, currentSpace, isLoading } = useApp();

  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        if (currentUser && currentSpace) {
          router.replace('/(tabs)/(home)');
        } else {
          router.replace('/(auth)/welcome');
        }
      }
    }, [currentUser, currentSpace, isLoading])
  );

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});