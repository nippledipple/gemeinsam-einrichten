import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Copy, Share } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '@/hooks/app-store';

export default function InviteScreen() {
  const { colors, inviteToSpace, generateInviteCode, currentSpace } = useApp();
  const [email, setEmail] = useState<string>('');

  const handleEmailInvite = () => {
    if (!email.trim()) {
      Alert.alert('Fehler', 'Bitte gib eine E-Mail-Adresse ein.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Fehler', 'Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    const success = inviteToSpace(email);
    if (success) {
      setEmail('');
      Alert.alert('Einladung gesendet', `Eine Einladung wurde an ${email} gesendet.`);
    }
  };

  const handleGenerateCode = async () => {
    const code = generateInviteCode();
    if (code) {
      Alert.alert(
        'Einladungscode',
        `Teile diesen Code mit anderen:\n\n${code}\n\nDer Code ist 20 Sekunden gültig.`,
        [
          { text: 'OK' },
          { 
            text: 'Code kopieren', 
            onPress: async () => {
              await Clipboard.setStringAsync(code);
              Alert.alert('Kopiert', 'Code wurde in die Zwischenablage kopiert');
            }
          }
        ]
      );
    }
  };

  const handleShareSpace = async () => {
    if (!currentSpace) return;
    
    const code = generateInviteCode();
    if (code) {
      const shareText = `Tritt meinem Wohnideen-Space "${currentSpace.name}" bei!\n\nCode: ${code}\n\nDer Code ist 20 Sekunden gültig.`;
      
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(shareText);
        Alert.alert('Kopiert', 'Einladungstext wurde in die Zwischenablage kopiert');
      } else {
        // On mobile, we could use Share API here
        await Clipboard.setStringAsync(shareText);
        Alert.alert('Kopiert', 'Einladungstext wurde in die Zwischenablage kopiert. Du kannst ihn jetzt in WhatsApp, iMessage oder anderen Apps teilen.');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.section}>
          <Text style={[styles.title, { color: colors.text }]}>
            Leute zu deinem Space einladen
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Lade Freunde, Familie oder Mitbewohner ein, um gemeinsam einzurichten.
          </Text>
        </View>

        {/* Email Invitation */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Mail size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Per E-Mail einladen
            </Text>
          </View>
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            }]}
            placeholder="E-Mail-Adresse eingeben"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleEmailInvite}
          >
            <Text style={styles.buttonText}>Einladung senden</Text>
          </TouchableOpacity>
        </View>

        {/* Code Generation */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Copy size={24} color={colors.secondary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Einladungscode generieren
            </Text>
          </View>
          
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Erstelle einen 4-stelligen Code, den andere eingeben können. Der Code ist 20 Sekunden gültig.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { 
              backgroundColor: colors.background,
              borderColor: colors.secondary,
            }]}
            onPress={handleGenerateCode}
          >
            <Text style={[styles.buttonText, { color: colors.secondary }]}>
              Code generieren
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Share size={24} color={colors.success} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Space teilen
            </Text>
          </View>
          
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Teile deinen Space über WhatsApp, iMessage oder andere Apps.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { 
              backgroundColor: colors.background,
              borderColor: colors.success,
            }]}
            onPress={handleShareSpace}
          >
            <Text style={[styles.buttonText, { color: colors.success }]}>
              Space teilen
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            💡 Tipp: Eingeladene Personen können Vorschläge machen und gemeinsam mit dir Prioritäten setzen.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});