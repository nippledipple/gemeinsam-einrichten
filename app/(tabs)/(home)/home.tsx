import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { router } from 'expo-router';
import { Users, Wifi, WifiOff } from 'lucide-react-native';

import { useApp } from '@/hooks/app-store';
import { ProposalBanner } from '@/components/ProposalBanner';
import { PriorityCard } from '@/components/PriorityCard';

export default function HomeScreen() {
  const { currentSpace, priorityItems, pendingProposals, respondToProposal, togglePriority, colors } = useApp();

  const handleProposalResponse = (proposalId: string) => (response: 'accepted' | 'rejected' | 'later') => {
    respondToProposal(proposalId, response);
  };

  const handleAddItem = () => {
    router.push('/(tabs)/search');
  };

  const memberCount = currentSpace?.members?.length || 1;
  const isConnected = memberCount > 1; // Simulate connection status



  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginHorizontal: 20,
      marginBottom: 16,
    },
    prioritiesContainer: {
      paddingHorizontal: 20,
      gap: 12,
    },
    welcomeSection: {
      padding: 20,
      alignItems: 'center',
      marginTop: 40,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    welcomeText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    addButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    statusBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    statusIcon: {
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Participant Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusIcon}>
            {memberCount > 1 ? (
              <Wifi size={16} color={colors.success} />
            ) : (
              <WifiOff size={16} color={colors.textSecondary} />
            )}
          </View>
          <Users size={16} color={colors.primary} style={styles.statusIcon} />
          <Text style={styles.statusText}>
            {memberCount} Teilnehmer{memberCount !== 1 ? '' : ''} {memberCount > 1 ? '• Synchronisiert' : '• Offline'}
          </Text>
        </View>

        {/* Proposal Banners */}
        {pendingProposals && pendingProposals.length > 0 && pendingProposals.map((proposal) => (
          <ProposalBanner 
            key={proposal.id} 
            proposal={proposal} 
            onRespond={handleProposalResponse(proposal.id)}
          />
        ))}

        {/* Priorities Section */}
        {priorityItems && priorityItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prioritäten</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.prioritiesContainer}
            >
              {priorityItems.map((item) => (
                <PriorityCard
                  key={item.id}
                  item={item}
                  priorityLevel={item.priorityLevel || 1}
                  onTogglePriority={() => togglePriority(item.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Willkommen in {currentSpace?.name || 'deinem Space'}!
          </Text>
          <Text style={styles.welcomeText}>
            Hier siehst du alle Vorschläge und eure gemeinsamen Prioritäten.
          </Text>
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>Erstes Item hinzufügen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}