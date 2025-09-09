import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Check, X, Clock } from 'lucide-react-native';
import { Proposal } from '@/types';
import { useApp } from '@/hooks/app-store';

interface ProposalBannerProps {
  proposal: Proposal;
  onRespond: (response: 'accepted' | 'rejected' | 'later') => void;
}

export function ProposalBanner({ proposal, onRespond }: ProposalBannerProps) {
  const { colors } = useApp();
  const [animation] = useState(new Animated.Value(0));
  const [showUndo, setShowUndo] = useState(false);
  const [lastResponse, setLastResponse] = useState<'accepted' | 'rejected' | 'later' | null>(null);

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const handleResponse = (response: 'accepted' | 'rejected' | 'later') => {
    setLastResponse(response);
    setShowUndo(true);
    
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        if (showUndo) {
          onRespond(response);
        }
      }, 5000);
    });
    
    setTimeout(() => {
      setShowUndo(false);
    }, 5000);
  };

  const handleUndo = () => {
    setShowUndo(false);
    Animated.spring(animation, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      overflow: 'hidden',
    },
    content: {
      flexDirection: 'row',
      padding: 16,
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    info: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'center',
    },
    label: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    description: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    price: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    actions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    acceptButton: {
      backgroundColor: colors.success,
    },
    laterButton: {
      backgroundColor: colors.surface,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.border,
    },
    rejectButton: {
      backgroundColor: colors.danger,
    },
    buttonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 14,
    },
    undoContainer: {
      backgroundColor: colors.text,
      borderRadius: 8,
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    undoText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '500',
    },
    undoButton: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 6,
    },
    undoButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  if (showUndo) {
    return (
      <View style={styles.undoContainer}>
        <Text style={styles.undoText}>
          {lastResponse === 'accepted' ? 'Angenommen' : 
           lastResponse === 'rejected' ? 'Abgelehnt' : 'Verschoben'}
        </Text>
        <TouchableOpacity onPress={handleUndo} style={styles.undoButton}>
          <Text style={styles.undoButtonText}>Rückgängig</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <Image source={{ uri: proposal.item.imageUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.label}>Neuer Vorschlag</Text>
          <Text style={styles.title} numberOfLines={2}>{proposal.item.title}</Text>
          {proposal.item.description && (
            <Text style={styles.description} numberOfLines={1}>{proposal.item.description}</Text>
          )}
          {proposal.item.price && (
            <Text style={styles.price}>€{proposal.item.price.toFixed(2)}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleResponse('accepted')}
          testID="accept-button"
        >
          <Check size={24} color="white" />
          <Text style={styles.buttonText}>JA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.laterButton]}
          onPress={() => handleResponse('later')}
          testID="later-button"
        >
          <Clock size={20} color={colors.primary} />
          <Text style={[styles.buttonText, { color: colors.primary }]}>Später</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleResponse('rejected')}
          testID="reject-button"
        >
          <X size={24} color="white" />
          <Text style={styles.buttonText}>NEIN</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

