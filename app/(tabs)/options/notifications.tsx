import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, MessageSquare, Heart, Home, Truck } from 'lucide-react-native';
import { useApp } from '@/hooks/app-store';

interface NotificationSettingProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

function NotificationSetting({ icon, title, subtitle, value, onToggle }: NotificationSettingProps) {
  const { colors } = useApp();
  
  return (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + '40' }}
        thumbColor={value ? colors.primary : colors.textSecondary}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const { colors, markNotificationRead, notifications } = useApp();
  const [settings, setSettings] = useState({
    proposals: true,
    responses: true,
    favorites: false,
    roomUpdates: true,
    deliveries: true,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleMarkAllRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationRead(notification.id);
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Benachrichtigungen',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aktionen</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleMarkAllRead}
          >
            <Text style={styles.actionButtonText}>Alle als gelesen markieren</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Benachrichtigungstypen</Text>
          
          <NotificationSetting
            icon={<MessageSquare size={24} color={colors.primary} />}
            title="Neue Vorschläge"
            subtitle="Wenn jemand einen neuen Artikel vorschlägt"
            value={settings.proposals}
            onToggle={(value) => updateSetting('proposals', value)}
          />
          
          <NotificationSetting
            icon={<Bell size={24} color={colors.success} />}
            title="Antworten auf Vorschläge"
            subtitle="Wenn jemand auf deine Vorschläge antwortet"
            value={settings.responses}
            onToggle={(value) => updateSetting('responses', value)}
          />
          
          <NotificationSetting
            icon={<Heart size={24} color={colors.danger} />}
            title="Favoriten-Updates"
            subtitle="Wenn favorisierte Artikel aktualisiert werden"
            value={settings.favorites}
            onToggle={(value) => updateSetting('favorites', value)}
          />
          
          <NotificationSetting
            icon={<Home size={24} color={colors.secondary} />}
            title="Raum-Updates"
            subtitle="Änderungen an Räumen und Budgets"
            value={settings.roomUpdates}
            onToggle={(value) => updateSetting('roomUpdates', value)}
          />
          
          <NotificationSetting
            icon={<Truck size={24} color={colors.warning} />}
            title="Lieferungen"
            subtitle="Erinnerungen an Liefertermine"
            value={settings.deliveries}
            onToggle={(value) => updateSetting('deliveries', value)}
          />
        </View>

        {/* Info */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Push-Benachrichtigungen können in den Systemeinstellungen deines Geräts verwaltet werden.
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
  actionButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    padding: 16,
    textAlign: 'center',
  },
});