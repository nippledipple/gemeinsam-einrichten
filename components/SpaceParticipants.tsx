import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { useApp } from '@/hooks/app-store';

interface SpaceParticipantsProps {
  style?: any;
}

export default function SpaceParticipants({ style }: SpaceParticipantsProps) {
  const { currentSpacePresence, colors, isRealtimeConnected } = useApp();

  if (!currentSpacePresence) {
    return null;
  }

  const participantCount = currentSpacePresence.count || 0;
  const isOnline = isRealtimeConnected;

  return (
    <View style={[styles.container, style]}>
      <Users 
        size={16} 
        color={isOnline ? colors.success : colors.textSecondary} 
      />
      <Text style={[
        styles.text, 
        { 
          color: isOnline ? colors.success : colors.textSecondary,
          marginLeft: 4,
        }
      ]}>
        {participantCount} {participantCount === 1 ? 'Teilnehmer' : 'Teilnehmer'}
      </Text>
      {!isOnline && (
        <View style={[styles.offlineIndicator, { backgroundColor: colors.error }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  offlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
});