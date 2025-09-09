import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Users, Check, LogOut, UserPlus } from 'lucide-react-native';
import { useApp } from '@/hooks/app-store';

export default function ManageSpacesScreen() {
  const { 
    colors, 
    allSpaces, 
    currentSpace, 
    switchSpace,
    leaveSpace,
  } = useApp();

  const handleSwitchSpace = (spaceId: string) => {
    if (spaceId === currentSpace?.id) return;
    
    const success = switchSpace(spaceId);
    if (success) {
      router.back();
    }
  };

  const handleLeaveSpace = (space: any) => {
    if (allSpaces.length <= 1) {
      Alert.alert(
        'Letzter Space',
        'Du kannst deinen letzten Space nicht verlassen. Du musst mindestens einem Space angehören.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Space verlassen',
      `Möchtest du den Space "${space.name}" wirklich verlassen? Alle deine Daten in diesem Space gehen verloren.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Verlassen',
          style: 'destructive',
          onPress: () => {
            const success = leaveSpace(space.id);
            if (success) {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleJoinNewSpace = () => {
    router.push('/(tabs)/options/join-space');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Spaces verwalten</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Du gehörst {allSpaces.length} Space{allSpaces.length !== 1 ? 's' : ''} an. Wechsle zwischen ihnen oder verlasse Spaces.
        </Text>
        
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Deine Spaces</Text>
          
          {allSpaces.map((space, index) => {
            const isCurrentSpace = space.id === currentSpace?.id;
            const memberCount = space.members?.length || 1;
            
            return (
              <View key={space.id} style={[
                styles.spaceItem,
                { borderBottomColor: colors.border },
                index === allSpaces.length - 1 && styles.lastSpaceItem
              ]}>
                <TouchableOpacity
                  style={styles.spaceContent}
                  onPress={() => handleSwitchSpace(space.id)}
                  disabled={isCurrentSpace}
                >
                  <View style={styles.spaceLeft}>
                    <View style={[
                      styles.spaceIcon,
                      { backgroundColor: isCurrentSpace ? colors.primary : colors.background }
                    ]}>
                      <Users size={20} color={isCurrentSpace ? 'white' : colors.primary} />
                    </View>
                    
                    <View style={styles.spaceInfo}>
                      <View style={styles.spaceNameRow}>
                        <Text style={[
                          styles.spaceName,
                          { color: colors.text },
                          isCurrentSpace && styles.currentSpaceName
                        ]}>
                          {space.name}
                        </Text>
                        {isCurrentSpace && (
                          <View style={[styles.currentBadge, { backgroundColor: colors.success }]}>
                            <Check size={12} color="white" />
                            <Text style={styles.currentBadgeText}>Aktiv</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={[styles.spaceMembers, { color: colors.textSecondary }]}>
                        {memberCount} Teilnehmer{memberCount !== 1 ? '' : ''} • {memberCount > 1 ? 'Aktiv' : 'Allein'}
                      </Text>
                      
                      <Text style={[styles.spaceDate, { color: colors.textSecondary }]}>
                        Erstellt am {new Date(space.createdAt).toLocaleDateString('de-DE')}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.spaceActions}>
                    {!isCurrentSpace && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.switchButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleSwitchSpace(space.id)}
                      >
                        <Text style={styles.switchButtonText}>Wechseln</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.leaveButton, { backgroundColor: colors.danger }]}
                      onPress={() => handleLeaveSpace(space)}
                    >
                      <LogOut size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        
        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: colors.secondary }]}
          onPress={handleJoinNewSpace}
        >
          <UserPlus size={20} color="white" />
          <Text style={styles.joinButtonText}>Weiterem Space beitreten</Text>
        </TouchableOpacity>
        
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            💡 Du kannst zwischen deinen Spaces wechseln, ohne Daten zu verlieren. Jeder Space hat seine eigenen Räume, Artikel und Einstellungen.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  spaceItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastSpaceItem: {
    borderBottomWidth: 0,
  },
  spaceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  spaceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spaceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  spaceInfo: {
    flex: 1,
  },
  spaceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  currentSpaceName: {
    fontWeight: '600',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  spaceMembers: {
    fontSize: 14,
    marginBottom: 2,
  },
  spaceDate: {
    fontSize: 12,
  },
  spaceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchButton: {
    minWidth: 70,
  },
  switchButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  leaveButton: {
    width: 36,
    height: 36,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});