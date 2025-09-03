import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/hooks/app-store';

export default function JoinSpaceScreen() {
  const { joinSpace } = useApp();
  const [code, setCode] = useState('');

  const handleJoin = () => {
    if (code.length !== 4) {
      Alert.alert('Fehler', 'Der Code muss 4 Zeichen lang sein');
      return;
    }
    
    const success = joinSpace(code.toUpperCase());
    if (success) {
      Alert.alert(
        'Erfolgreich beigetreten!',
        'Du bist dem Space erfolgreich beigetreten.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/(home)')
          }
        ]
      );
    } else {
      Alert.alert('Fehler', 'Ungültiger oder abgelaufener Code. Bitte überprüfe den Code oder frage nach einem neuen.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text style={styles.title}>Space beitreten</Text>
        <Text style={styles.subtitle}>
          Gib den 4-stelligen Code ein, den du erhalten hast
        </Text>
        
        <View style={styles.codeContainer}>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            placeholder="ABCD"
            maxLength={4}
            autoCapitalize="characters"
            autoFocus
          />
        </View>
        
        <Text style={styles.hint}>
          Der Code ist nur 20 Sekunden gültig (für schnelle Codes) oder 5 Minuten (für E-Mail-Einladungen)
        </Text>
        
        <TouchableOpacity
          style={[
            styles.button,
            code.length === 4 ? styles.buttonActive : styles.buttonDisabled,
          ]}
          onPress={handleJoin}
          disabled={code.length !== 4}
        >
          <Text style={styles.buttonText}>Beitreten</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 48,
    textAlign: 'center',
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeInput: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    minWidth: 200,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  hint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: Colors.primary,
  },
  buttonDisabled: {
    backgroundColor: Colors.border,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});