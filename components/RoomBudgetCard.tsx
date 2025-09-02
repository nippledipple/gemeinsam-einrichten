import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Room } from '@/types';
import { Colors } from '@/constants/colors';
import * as Icons from 'lucide-react-native';

interface RoomBudgetCardProps {
  room: Room;
  onPress: () => void;
}

export function RoomBudgetCard({ room, onPress }: RoomBudgetCardProps) {
  const percentage = room.budget ? (room.spent / room.budget) * 100 : 0;
  const remaining = (room.budget || 0) - room.spent;
  const isOverBudget = remaining < 0;
  
  const getProgressColor = () => {
    if (isOverBudget) return Colors.danger;
    if (percentage > 80) return Colors.warning;
    return Colors.success;
  };

  const IconComponent = room.icon ? (Icons as any)[room.icon.charAt(0).toUpperCase() + room.icon.slice(1)] || Icons.Home : Icons.Home;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: room.color + '20' }]}>
        <IconComponent size={24} color={room.color} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{room.name}</Text>
        <View style={styles.budgetInfo}>
          <Text style={styles.spent}>€{room.spent.toFixed(0)}</Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.budget}>€{room.budget?.toFixed(0) || '0'}</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.remaining, { color: getProgressColor() }]}>
          {isOverBudget ? `-€${Math.abs(remaining).toFixed(0)}` : `€${remaining.toFixed(0)}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spent: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  separator: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 4,
  },
  budget: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  remaining: {
    fontSize: 12,
    fontWeight: '600',
  },
});