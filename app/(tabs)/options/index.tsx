import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { 
  UserPlus, 
  Heart, 
  Bell, 
  Settings, 
  Home,
  Share,
  Download,
  Upload,
  Truck,
  Palette,
  Moon,
  Sun,
  Smartphone,
  ChevronRight,
  Users,
  RefreshCw,
} from 'lucide-react-native';
import { useApp } from '@/hooks/app-store';

interface OptionItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: number;
}

function OptionItem({ icon, title, subtitle, onPress, badge }: OptionItemProps) {
  const { colors } = useApp();
  
  return (
    <TouchableOpacity style={[styles.optionItem, { borderBottomColor: colors.border }]} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.optionRight}>
        {badge && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

export default function OptionsScreen() {
  const { 
    colors, 
    isDarkTheme, 
    setTheme, 
    unreadNotifications, 
    favoriteItems,
    currentSpace,
    allSpaces = [],
    generateInviteCode,
  } = useApp();

  const handleInvite = () => {
    router.push('/(tabs)/options/invite');
  };

  const handleFavorites = () => {
    router.push('/(tabs)/options/favorites');
  };

  const handleNotifications = () => {
    router.push('/(tabs)/options/notifications');
  };

  const handleSettings = () => {
    router.push('/(tabs)/options/settings');
  };

  const handleAddRoom = () => {
    router.push('/(tabs)/options/add-room');
  };

  const handleJoinSpace = () => {
    router.push('/(tabs)/options/join-space');
  };
  
  const handleManageSpaces = () => {
    router.push('/(tabs)/options/manage-spaces');
  };

  const handleShare = () => {
    if (!currentSpace) return;
    
    const code = generateInviteCode();
    if (code) {
      Alert.alert(
        'Space teilen',
        `Teile diesen Code mit anderen:\n\n${code}\n\nDer Code ist 20 Sekunden gültig.`,
        [
          { text: 'OK' },
          { 
            text: 'Code kopieren', 
            onPress: () => {
              // In a real app, copy to clipboard
              Alert.alert('Kopiert', 'Code wurde in die Zwischenablage kopiert');
            }
          }
        ]
      );
    }
  };

  const handleExport = () => {
    Alert.alert(
      'Daten exportieren',
      'Möchtest du deine Daten als JSON-Datei exportieren?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Exportieren', 
          onPress: () => {
            Alert.alert('Exportiert', 'Daten wurden erfolgreich exportiert');
          }
        }
      ]
    );
  };

  const handleImport = () => {
    Alert.alert(
      'Daten importieren',
      'Möchtest du Daten aus einer JSON-Datei importieren?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Importieren', 
          onPress: () => {
            Alert.alert('Importiert', 'Daten wurden erfolgreich importiert');
          }
        }
      ]
    );
  };

  const handleDeliveries = () => {
    Alert.alert(
      'Lieferungen',
      'Hier kannst du deine Bestellungen und Liefertermine verwalten.',
      [{ text: 'OK' }]
    );
  };

  const handleMoodboard = () => {
    Alert.alert(
      'Moodboards',
      'Erstelle visuelle Collagen für deine Räume.',
      [{ text: 'OK' }]
    );
  };

  const handleThemeToggle = () => {
    if (isDarkTheme === null) {
      setTheme(true); // Force dark
    } else if (isDarkTheme) {
      setTheme(false); // Force light
    } else {
      setTheme(null); // System
    }
  };

  const getThemeText = () => {
    if (isDarkTheme === null) return 'System';
    return isDarkTheme ? 'Dunkel' : 'Hell';
  };

  const getThemeIcon = () => {
    if (isDarkTheme === null) {
      return <Smartphone size={24} color={colors.primary} />;
    }
    if (isDarkTheme) {
      return <Moon size={24} color={colors.primary} />;
    }
    return <Sun size={24} color={colors.primary} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Space Management */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Space verwalten</Text>
          
          <OptionItem
            icon={<UserPlus size={24} color={colors.primary} />}
            title="Leute einladen"
            subtitle="Lade andere zu deinem Space ein"
            onPress={handleInvite}
          />
          
          <OptionItem
            icon={<Share size={24} color={colors.primary} />}
            title="Space teilen"
            subtitle="Teile einen Einladungscode"
            onPress={handleShare}
          />
          
          <OptionItem
            icon={<Home size={24} color={colors.primary} />}
            title="Raum hinzufügen"
            subtitle="Erstelle einen neuen Raum"
            onPress={handleAddRoom}
          />
          
          <OptionItem
            icon={<Users size={24} color={colors.secondary} />}
            title="Space beitreten"
            subtitle="Tritt einem weiteren Space bei"
            onPress={handleJoinSpace}
          />
          
          <OptionItem
            icon={<RefreshCw size={24} color={colors.primary} />}
            title="Spaces verwalten"
            subtitle={`${(allSpaces || []).length} Space${(allSpaces || []).length !== 1 ? 's' : ''} verwalten`}
            onPress={handleManageSpaces}
          />
        </View>

        {/* Content */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Inhalte</Text>
          
          <OptionItem
            icon={<Heart size={24} color={colors.danger} />}
            title="Favoriten"
            subtitle={`${(favoriteItems || []).length} favorisierte Artikel`}
            onPress={handleFavorites}
          />
          
          <OptionItem
            icon={<Bell size={24} color={colors.warning} />}
            title="Benachrichtigungen"
            subtitle="Verwalte deine Mitteilungen"
            onPress={handleNotifications}
            badge={unreadNotifications}
          />
          
          <OptionItem
            icon={<Palette size={24} color={colors.secondary} />}
            title="Moodboards"
            subtitle="Visuelle Collagen erstellen"
            onPress={handleMoodboard}
          />
        </View>

        {/* Tools */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tools</Text>
          
          <OptionItem
            icon={<Truck size={24} color={colors.success} />}
            title="Lieferungen"
            subtitle="Bestellungen und Termine"
            onPress={handleDeliveries}
          />
          
          <OptionItem
            icon={<Download size={24} color={colors.primary} />}
            title="Daten exportieren"
            subtitle="Sichere deine Daten"
            onPress={handleExport}
          />
          
          <OptionItem
            icon={<Upload size={24} color={colors.primary} />}
            title="Daten importieren"
            subtitle="Lade gesicherte Daten"
            onPress={handleImport}
          />
        </View>

        {/* Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Einstellungen</Text>
          
          <OptionItem
            icon={getThemeIcon()}
            title="Design"
            subtitle={`Aktuell: ${getThemeText()}`}
            onPress={handleThemeToggle}
          />
          
          <OptionItem
            icon={<Settings size={24} color={colors.textSecondary} />}
            title="Weitere Einstellungen"
            subtitle="App-Einstellungen verwalten"
            onPress={handleSettings}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Wohnideen App v1.0
          </Text>
        </View>
      </ScrollView>
    </View>
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLeft: {
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
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
  },
});