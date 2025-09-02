import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Home, Users } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/hooks/app-store';

export default function WelcomeScreen() {
  const { currentUser, currentSpace, signIn, createSpace } = useApp();
  const [step, setStep] = useState<'welcome' | 'signin' | 'space'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [spaceName, setSpaceName] = useState('');

  useEffect(() => {
    if (currentUser && currentSpace) {
      router.replace('/(tabs)/(home)');
    } else if (currentUser) {
      setStep('space');
    }
  }, [currentUser, currentSpace]);

  const handleSignIn = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }
    signIn(name, email);
    setStep('space');
  };

  const handleCreateSpace = () => {
    if (!spaceName.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Namen für deinen Space ein');
      return;
    }
    createSpace(spaceName);
    // Navigation will be handled by the useEffect when currentSpace is set
  };

  const handleJoinSpace = () => {
    router.push('./join');
  };

  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContent}>
          <View style={styles.logoContainer}>
            <Home size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Wohnideen</Text>
          <Text style={styles.subtitle}>Gemeinsam einrichten</Text>
          
          <View style={styles.welcomeActions}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => setStep('signin')}
            >
              <Text style={styles.primaryButtonText}>Los geht's</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'signin') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Willkommen!</Text>
              <Text style={styles.formSubtitle}>Erzähl uns von dir</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Dein Name"
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-Mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="deine@email.de"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSignIn}
              >
                <Text style={styles.primaryButtonText}>Weiter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Dein Space</Text>
            <Text style={styles.formSubtitle}>Erstelle einen neuen Space oder tritt einem bei</Text>
            
            <View style={styles.spaceOptions}>
              <View style={styles.spaceCard}>
                <Home size={32} color={Colors.primary} />
                <Text style={styles.spaceCardTitle}>Neuen Space erstellen</Text>
                <TextInput
                  style={styles.input}
                  value={spaceName}
                  onChangeText={setSpaceName}
                  placeholder="z.B. Wohnung Max & Lisa"
                />
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleCreateSpace}
                >
                  <Text style={styles.primaryButtonText}>Space erstellen</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>oder</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <TouchableOpacity
                style={[styles.spaceCard, styles.joinCard]}
                onPress={handleJoinSpace}
              >
                <Users size={32} color={Colors.secondary} />
                <Text style={styles.spaceCardTitle}>Space beitreten</Text>
                <Text style={styles.joinText}>Mit 4-stelligem Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 48,
  },
  welcomeActions: {
    width: '100%',
    maxWidth: 300,
  },
  formContainer: {
    padding: 24,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spaceOptions: {
    marginTop: 24,
  },
  spaceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  joinCard: {
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderStyle: 'dashed',
  },
  spaceCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  joinText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});