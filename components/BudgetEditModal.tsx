import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/colors';

interface BudgetEditModalProps {
  visible: boolean;
  room: { id: string; name: string; budget?: number } | null;
  onClose: () => void;
  onSave: (roomId: string, budget: number) => void;
}

export function BudgetEditModal({ visible, room, onClose, onSave }: BudgetEditModalProps) {
  const [budgetText, setBudgetText] = useState<string>('');

  useEffect(() => {
    if (room) {
      setBudgetText((room.budget || 0).toString());
    }
  }, [room]);

  const handleSave = () => {
    if (!room) return;
    
    const budget = parseFloat(budgetText || '0');
    if (!isNaN(budget) && budget >= 0) {
      onSave(room.id, budget);
      Alert.alert('Gespeichert', `Budget für ${room.name} wurde auf €${budget} gesetzt.`);
      onClose();
    } else {
      Alert.alert('Fehler', 'Bitte gib einen gültigen Betrag ein.');
    }
  };

  const handleClose = () => {
    onClose();
    if (room) {
      setBudgetText((room.budget || 0).toString());
    }
  };

  if (!room) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Budget bearbeiten</Text>
          <Text style={styles.subtitle}>
            Aktuelles Budget für {room.name}: €{room.budget || 0}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Neues Budget (€)</Text>
            <TextInput
              style={styles.input}
              value={budgetText}
              onChangeText={setBudgetText}
              placeholder="0"
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Speichern</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.background,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});