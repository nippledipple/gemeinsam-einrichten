import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Star, Check } from 'lucide-react-native';
import { Item } from '@/types';
import { Colors } from '@/constants/colors';

interface ItemCardProps {
  item: Item;
  onPress: () => void;
  onToggleFavorite?: () => void;
  showStatus?: boolean;
}

export function ItemCard({ item, onPress, onToggleFavorite, showStatus = true }: ItemCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      
      {showStatus && item.status === 'pending' && (
        <View style={[styles.statusBadge, { backgroundColor: Colors.warning }]}>
          <Text style={styles.statusText}>Ausstehend</Text>
        </View>
      )}
      
      {showStatus && item.status === 'accepted' && (
        <View style={[styles.statusBadge, { backgroundColor: Colors.success }]}>
          <Check size={12} color="white" />
        </View>
      )}
      
      {onToggleFavorite && (
        <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite}>
          <Star
            size={20}
            color={item.isFavorite ? Colors.warning : Colors.textSecondary}
            fill={item.isFavorite ? Colors.warning : 'transparent'}
          />
        </TouchableOpacity>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.footer}>
          {item.price && (
            <Text style={styles.price}>€{item.price.toFixed(2)}</Text>
          )}
          {item.shop && (
            <Text style={styles.shop} numberOfLines={1}>{item.shop}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
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
    backgroundColor: Colors.border,
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
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    color: Colors.text,
  },
  shop: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    marginLeft: 8,
    textAlign: 'right',
  },
});