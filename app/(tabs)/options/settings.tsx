import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  User, 
  Shield, 
  Database, 
  Trash2, 
  Info, 
  Mail,
  Globe,
  Smartphone,
  Volume2,
  Vibrate,
} from 'lucide-react-native';
import { useApp } from '@/hooks/app-store';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}

function SettingItem({ icon, title, subtitle, onPress, rightElement, showChevron = true }: SettingItemProps) {
  const { colors } = useApp();
  
  return (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { colors, currentUser, signOut } = useApp();
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    autoSync: true,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAccountSettings = () => {
    Alert.alert(
      'Account-Einstellungen',
      'Hier kannst du deine Profildaten bearbeiten.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Datenschutz',
      'Verwalte deine Datenschutz-Einstellungen und Berechtigungen.',
      [{ text: 'OK' }]
    );
  };

  const handleDataManagement = () => {
    Alert.alert(
      'Daten verwalten',
      'Exportiere, importiere oder lösche deine Daten.',
      [{ text: 'OK' }]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Cache leeren',
      'Möchtest du den App-Cache leeren? Dies kann die Performance verbessern.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Leeren', 
          onPress: () => {
            Alert.alert('Erledigt', 'Cache wurde geleert.');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Account löschen',
      'Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Löschen', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account gelöscht', 'Dein Account wurde erfolgreich gelöscht.');
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Über die App',
      'Wohnideen App v1.0\\n\\nEine App für Paare und Mitbewohner zum gemeinsamen Einrichten.\\n\\n© 2024 Wohnideen Team',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Brauchst du Hilfe? Kontaktiere uns unter support@wohnideen.app',
      [
        { text: 'OK' },
        { 
          text: 'E-Mail senden',
          onPress: () => {
            Alert.alert('E-Mail', 'E-Mail-App wird geöffnet...');
          }
        }
      ]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      'Sprache',
      'Wähle deine bevorzugte Sprache:',
      [
        { text: 'Deutsch', onPress: () => {} },
        { text: 'English', onPress: () => {} },
        { text: 'Abbrechen', style: 'cancel' }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Abmelden', 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Einstellungen',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Account */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          
          <SettingItem
            icon={<User size={24} color={colors.primary} />}
            title="Profil bearbeiten"
            subtitle={currentUser?.email || 'Nicht angemeldet'}
            onPress={handleAccountSettings}
          />
          
          <SettingItem
            icon={<Shield size={24} color={colors.success} />}
            title="Datenschutz"
            subtitle="Berechtigungen und Privatsphäre"
            onPress={handlePrivacySettings}
          />
        </View>

        {/* App Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App-Einstellungen</Text>
          
          <SettingItem
            icon={<Volume2 size={24} color={colors.warning} />}
            title="Töne"
            subtitle="Benachrichtigungstöne aktivieren"
            rightElement={
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSetting('soundEnabled', value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={settings.soundEnabled ? colors.primary : colors.textSecondary}
              />
            }
            showChevron={false}
          />
          
          <SettingItem
            icon={<Vibrate size={24} color={colors.secondary} />}
            title="Vibration"
            subtitle="Haptisches Feedback aktivieren"
            rightElement={
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) => updateSetting('vibrationEnabled', value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={settings.vibrationEnabled ? colors.primary : colors.textSecondary}
              />
            }
            showChevron={false}
          />
          
          <SettingItem
            icon={<Globe size={24} color={colors.secondary} />}
            title="Sprache"
            subtitle="Deutsch"
            onPress={handleLanguage}
          />
        </View>

        {/* Data */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daten</Text>
          
          <SettingItem
            icon={<Smartphone size={24} color={colors.primary} />}
            title="Automatische Synchronisation"
            subtitle="Daten automatisch synchronisieren"
            rightElement={
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => updateSetting('autoSync', value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={settings.autoSync ? colors.primary : colors.textSecondary}
              />
            }
            showChevron={false}
          />
          
          <SettingItem
            icon={<Database size={24} color={colors.secondary} />}
            title="Daten verwalten"
            subtitle="Export, Import und Backup"
            onPress={handleDataManagement}
          />
          
          <SettingItem
            icon={<Trash2 size={24} color={colors.warning} />}
            title="Cache leeren"
            subtitle="Temporäre Dateien löschen"
            onPress={handleClearCache}
          />
        </View>

        {/* Support */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          
          <SettingItem
            icon={<Mail size={24} color={colors.primary} />}
            title="Hilfe & Support"
            subtitle="Kontaktiere unser Support-Team"
            onPress={handleSupport}
          />
          
          <SettingItem
            icon={<Info size={24} color={colors.secondary} />}
            title="Über die App"
            subtitle="Version und Informationen"
            onPress={handleAbout}
          />
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>Gefahrenbereich</Text>
          
          <SettingItem
            icon={<User size={24} color={colors.danger} />}
            title="Abmelden"
            subtitle="Von diesem Gerät abmelden"
            onPress={handleSignOut}
          />
          
          <SettingItem
            icon={<Trash2 size={24} color={colors.danger} />}
            title="Account löschen"
            subtitle="Account permanent löschen"
            onPress={handleDeleteAccount}
          />
        </View>
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
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
});