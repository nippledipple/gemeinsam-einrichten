import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useApp } from '@/hooks/app-store';
import { ProposalBanner } from '@/components/ProposalBanner';
import { PriorityCard } from '@/components/PriorityCard';

export default function HomeScreen() {
  const { currentSpace, priorityItems, pendingProposals, respondToProposal, togglePriority } = useApp();

  const handleProposalResponse = (proposalId: string) => (response: 'accepted' | 'rejected' | 'later') => {
    respondToProposal(proposalId, response);
  };

  const handleAddItem = () => {
    router.push('/(tabs)/search');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Proposal Banners */}
        {pendingProposals.map((proposal) => (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.text,
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
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});