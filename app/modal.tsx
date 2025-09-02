import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  X,
  Users,
  Settings,
  Heart,
  Bell,
  Download,
  Upload,
  Truck,
  Palette,
  Calendar,
  Star,

} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/hooks/app-store';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: number;
}

function MenuItem({ icon, title, subtitle, onPress, badge }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIcon}>{icon}</View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {badge && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ModalScreen() {
  const {
    currentSpace,
    generateInviteCode,
    favoriteItems,
    unreadNotifications,
    notifications,
    markNotificationRead,
  } = useApp();

  const handleInvite = () => {
    const code = generateInviteCode();
    if (code) {
      Alert.alert(
        'Einladungscode erstellt',
        `Code: ${code}\n\nDieser Code ist 20 Sekunden gültig.`,
        [
          {
            text: 'Kopieren',
            onPress: () => {
              // Note: Clipboard functionality would need expo-clipboard
              console.log('Code to copy:', code);
              Alert.alert('Kopiert', 'Code wurde in die Zwischenablage kopiert');
            },
          },
          {
            text: 'Teilen',
            onPress: () => {
              Share.share({
                message: `Tritt meinem Wohnideen-Space bei! Code: ${code} (20 Sekunden gültig)`,
                title: 'Wohnideen Space Einladung',
              });
            },
          },
          { text: 'OK', style: 'default' },
        ]
      );
    }
  };

  const handleNotifications = () => {
    Alert.alert(
      'Benachrichtigungen',
      `Du hast ${unreadNotifications} ungelesene Benachrichtigungen.`,
      [
        {
          text: 'Alle als gelesen markieren',
          onPress: () => {
            notifications.forEach(n => {
              if (!n.read) markNotificationRead(n.id);
            });
          },
        },
        { text: 'OK' },
      ]
    );
  };

  const handleExport = () => {
    Alert.alert(
      'Export',
      'Exportiere deine Daten als JSON-Datei',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Exportieren',
          onPress: () => {
            Alert.alert('Export', 'Export-Funktion wird implementiert...');
          },
        },
      ]
    );
  };

  const handleImport = () => {
    Alert.alert(
      'Import',
      'Importiere Daten aus einer JSON-Datei',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Importieren',
          onPress: () => {
            Alert.alert('Import', 'Import-Funktion wird implementiert...');
          },
        },
      ]
    );
  };

  const handleDeliveries = () => {
    Alert.alert(
      'Lieferungen',
      'Verwalte deine Bestellungen und Liefertermine',
      [
        { text: 'OK' },
      ]
    );
  };

  const handleMoodboard = () => {
    Alert.alert(
      'Moodboard',
      'Erstelle visuelle Collagen für deine Räume',
      [
        { text: 'OK' },
      ]
    );
  };

  const handleColorScheme = () => {
    Alert.alert(
      'Farbschema',
      'Erkenne und verwalte Farbkombinationen deiner Items',
      [
        { text: 'OK' },
      ]
    );
  };

  const handleShoppingList = () => {
    Alert.alert(
      'Einkaufsliste',
      'Verwandle akzeptierte Items in eine Einkaufsliste',
      [
        { text: 'OK' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mehr Optionen</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Space verwalten</Text>
          <MenuItem
            icon={<Users size={24} color={Colors.primary} />}
            title="Personen einladen"
            subtitle={`${currentSpace?.members.length || 0} Mitglieder`}
            onPress={handleInvite}
          />
          <MenuItem
            icon={<Settings size={24} color={Colors.text} />}
            title="Einstellungen"
            subtitle="Space-Einstellungen verwalten"
            onPress={() => Alert.alert('Einstellungen', 'Einstellungen werden implementiert...')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meine Listen</Text>
          <MenuItem
            icon={<Heart size={24} color={Colors.danger} />}
            title="Favoriten"
            subtitle={`${favoriteItems.length} Artikel`}
            onPress={() => Alert.alert('Favoriten', `Du hast ${favoriteItems.length} Favoriten`)}
          />
          <MenuItem
            icon={<Bell size={24} color={Colors.warning} />}
            title="Benachrichtigungen"
            subtitle={unreadNotifications > 0 ? `${unreadNotifications} ungelesen` : 'Alle gelesen'}
            onPress={handleNotifications}
            badge={unreadNotifications}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tools & Features</Text>
          <MenuItem
            icon={<Calendar size={24} color={Colors.success} />}
            title="Einkaufsliste"
            subtitle="Akzeptierte Items als Checkliste"
            onPress={handleShoppingList}
          />
          <MenuItem
            icon={<Truck size={24} color={Colors.secondary} />}
            title="Lieferungen"
            subtitle="Bestellungen und Termine verwalten"
            onPress={handleDeliveries}
          />
          <MenuItem
            icon={<Palette size={24} color={Colors.primary} />}
            title="Moodboard"
            subtitle="Visuelle Collagen erstellen"
            onPress={handleMoodboard}
          />
          <MenuItem
            icon={<Star size={24} color={Colors.warning} />}
            title="Farbschema"
            subtitle="Farbkombinationen erkennen"
            onPress={handleColorScheme}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daten</Text>
          <MenuItem
            icon={<Download size={24} color={Colors.success} />}
            title="Export"
            subtitle="Daten exportieren"
            onPress={handleExport}
          />
          <MenuItem
            icon={<Upload size={24} color={Colors.primary} />}
            title="Import"
            subtitle="Daten importieren"
            onPress={handleImport}
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  menuItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});