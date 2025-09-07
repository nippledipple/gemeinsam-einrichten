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
import { ArrowLeft, Users } from 'lucide-react-native';
import { useApp } from '@/hooks/app-store';

export default function JoinAnotherSpaceScreen() {
  const { colors, joinSpace, currentSpace } = useApp();
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
        'Du bist dem neuen Space erfolgreich beigetreten.',
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <Users size={32} color="white" />
          </View>
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>Anderem Space beitreten</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Gib den 4-stelligen Code ein, um einem weiteren Space beizutreten
        </Text>
        
        {currentSpace && (
          <View style={[styles.currentSpaceInfo, { backgroundColor: colors.surface }]}>
            <Text style={[styles.currentSpaceText, { color: colors.textSecondary }]}>
              Aktueller Space: <Text style={[styles.currentSpaceName, { color: colors.text }]}>{currentSpace.name}</Text>
            </Text>
          </View>
        )}
        
        <View style={styles.codeContainer}>
          <TextInput
            style={[styles.codeInput, { 
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              color: colors.text,
            }]}
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            placeholder="ABCD"
            placeholderTextColor={colors.textSecondary}
            maxLength={4}
            autoCapitalize="characters"
            autoFocus
          />
        </View>
        
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Der Code ist nur 20 Sekunden gültig (für schnelle Codes) oder 5 Minuten (für E-Mail-Einladungen)
        </Text>
        
        <TouchableOpacity
          style={[
            styles.button,
            code.length === 4 
              ? [styles.buttonActive, { backgroundColor: colors.primary }]
              : [styles.buttonDisabled, { backgroundColor: colors.border }],
          ]}
          onPress={handleJoin}
          disabled={code.length !== 4}
        >
          <Text style={styles.buttonText}>Space beitreten</Text>
        </TouchableOpacity>
        
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            💡 Du kannst mehreren Spaces gleichzeitig angehören und zwischen ihnen wechseln.
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  currentSpaceInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  currentSpaceText: {
    fontSize: 14,
  },
  currentSpaceName: {
    fontWeight: '600',
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeInput: {
    borderRadius: 16,
    padding: 24,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    minWidth: 200,
    borderWidth: 2,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonActive: {},
  buttonDisabled: {},
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});