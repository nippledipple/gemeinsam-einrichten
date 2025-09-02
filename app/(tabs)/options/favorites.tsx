import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import { useApp } from '@/hooks/app-store';
import { ItemCard } from '@/components/ItemCard';

export default function FavoritesScreen() {
  const { colors, favoriteItems, toggleFavorite } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {favoriteItems.length > 0 ? (
          <View style={styles.content}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Hier findest du alle deine favorisierten Artikel.
            </Text>
            
            {favoriteItems.map((item) => (
              <View key={item.id} style={styles.itemContainer}>
                <ItemCard
                  item={item}
                  onPress={() => {}}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Heart size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Keine Favoriten
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Markiere Artikel als Favoriten, um sie hier zu sehen.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  itemContainer: {
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});