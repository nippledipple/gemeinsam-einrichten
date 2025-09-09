import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Star, Check, Trash2 } from 'lucide-react-native';
import { Item } from '@/types';
import { useApp } from '@/hooks/app-store';

interface ItemCardProps {
  item: Item;
  onPress: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  showStatus?: boolean;
}

export function ItemCard({ item, onPress, onToggleFavorite, onDelete, showStatus = true }: ItemCardProps) {
  const { colors } = useApp();
  
  const handleDelete = () => {
    Alert.alert(
      'Artikel löschen',
      `Möchtest du "${item.title}" wirklich löschen?`,
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.surface }]} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: item.imageUrl }} style={[styles.image, { backgroundColor: colors.border }]} />
      
      {showStatus && item.status === 'pending' && (
        <View style={[styles.statusBadge, { backgroundColor: colors.warning }]}>
          <Text style={styles.statusText}>Ausstehend</Text>
        </View>
      )}
      
      {showStatus && item.status === 'accepted' && (
        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
          <Check size={12} color="white" />
        </View>
      )}
      
      <View style={styles.actionButtons}>
        {onToggleFavorite && (
          <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
            <Star
              size={20}
              color={item.isFavorite ? colors.warning : colors.textSecondary}
              fill={item.isFavorite ? colors.warning : 'transparent'}
            />
          </TouchableOpacity>
        )}
        
        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2
              size={18}
              color={colors.error}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
        {item.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.footer}>
          {item.price && (
            <Text style={[styles.price, { color: colors.text }]}>€{item.price.toFixed(2)}</Text>
          )}
          {item.shop && (
            <Text style={[styles.shop, { color: colors.textSecondary }]} numberOfLines={1}>{item.shop}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  favoriteButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  shop: {
    fontSize: 12,
    flex: 1,
    marginLeft: 8,
    textAlign: 'right',
  },
});