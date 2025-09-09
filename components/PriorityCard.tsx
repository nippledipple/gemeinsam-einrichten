import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StarOff } from 'lucide-react-native';
import { Item } from '@/types';
import { useApp } from '@/hooks/app-store';

interface PriorityCardProps {
  item: Item;
  priorityLevel: number;
  onTogglePriority: () => void;
}

export function PriorityCard({ item, priorityLevel, onTogglePriority }: PriorityCardProps) {
  const { colors } = useApp();
  const priorityColor = colors.priority[priorityLevel as keyof typeof colors.priority];



  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginRight: 12,
      width: 160,
      height: 100,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    priorityBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      zIndex: 1,
    },
    priorityNumber: {
      color: 'white',
      fontSize: 10,
      fontWeight: '700',
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: colors.border,
    },
    content: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    price: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    starButton: {
      padding: 4,
    },
  });

  return (
    <View style={[styles.container, { borderLeftColor: priorityColor }]}>
      <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
        <Text style={styles.priorityNumber}>#{priorityLevel}</Text>
      </View>
      
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {item.price && (
          <Text style={styles.price}>€{item.price.toFixed(2)}</Text>
        )}
      </View>
      
      <TouchableOpacity onPress={onTogglePriority} style={styles.starButton}>
        <StarOff size={20} color={priorityColor} />
      </TouchableOpacity>
    </View>
  );
}

