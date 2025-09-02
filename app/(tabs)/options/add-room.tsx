import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Home, DollarSign, Palette } from 'lucide-react-native';
import { useApp } from '@/hooks/app-store';

const ROOM_TYPES = [
  { id: 'living', name: 'Wohnzimmer', icon: '🛋️' },
  { id: 'bedroom', name: 'Schlafzimmer', icon: '🛏️' },
  { id: 'kitchen', name: 'Küche', icon: '🍳' },
  { id: 'bathroom', name: 'Badezimmer', icon: '🚿' },
  { id: 'dining', name: 'Esszimmer', icon: '🍽️' },
  { id: 'office', name: 'Arbeitszimmer', icon: '💻' },
  { id: 'balcony', name: 'Balkon', icon: '🌿' },
  { id: 'hallway', name: 'Flur', icon: '🚪' },
  { id: 'storage', name: 'Abstellraum', icon: '📦' },
  { id: 'custom', name: 'Benutzerdefiniert', icon: '🏠' },
];

const ROOM_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
];

export default function AddRoomScreen() {
  const { colors, addRoom } = useApp();
  const [selectedType, setSelectedType] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(ROOM_COLORS[0]);

  const handleCreateRoom = () => {
    let roomName = '';
    
    if (selectedType === 'custom') {
      if (!customName.trim()) {
        Alert.alert('Fehler', 'Bitte gib einen Namen für den Raum ein.');
        return;
      }
      roomName = customName.trim();
    } else {
      const roomType = ROOM_TYPES.find(type => type.id === selectedType);
      if (!roomType) {
        Alert.alert('Fehler', 'Bitte wähle einen Raumtyp aus.');
        return;
      }
      roomName = roomType.name;
    }

    const roomBudget = budget ? parseFloat(budget) : 0;
    if (budget && (isNaN(roomBudget) || roomBudget < 0)) {
      Alert.alert('Fehler', 'Bitte gib ein gültiges Budget ein.');
      return;
    }

    const newRoom = {
      id: Date.now().toString(),
      name: roomName,
      budget: roomBudget,
      color: selectedColor,
      categories: [],
    };

    addRoom(roomName, selectedType === 'custom' ? '🏠' : ROOM_TYPES.find(t => t.id === selectedType)?.icon || '🏠', selectedColor);
    
    Alert.alert(
      'Raum erstellt',
      `${roomName} wurde erfolgreich erstellt!`,
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const getRoomName = () => {
    if (selectedType === 'custom') {
      return customName || 'Benutzerdefinierter Raum';
    }
    const roomType = ROOM_TYPES.find(type => type.id === selectedType);
    return roomType?.name || 'Raum auswählen';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Raum hinzufügen',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Room Type Selection */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Raumtyp wählen</Text>
          
          <View style={styles.roomTypeGrid}>
            {ROOM_TYPES.map((roomType) => (
              <TouchableOpacity
                key={roomType.id}
                style={[
                  styles.roomTypeItem,
                  { 
                    backgroundColor: selectedType === roomType.id ? colors.primary + '20' : colors.background,
                    borderColor: selectedType === roomType.id ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setSelectedType(roomType.id)}
              >
                <Text style={styles.roomTypeIcon}>{roomType.icon}</Text>
                <Text style={[
                  styles.roomTypeName, 
                  { 
                    color: selectedType === roomType.id ? colors.primary : colors.text,
                    fontWeight: selectedType === roomType.id ? '600' : '400',
                  }
                ]}>
                  {roomType.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Name Input */}
        {selectedType === 'custom' && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Raumname</Text>
            
            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
              <Home size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="z.B. Gästezimmer, Hobbyraum..."
                placeholderTextColor={colors.textSecondary}
                value={customName}
                onChangeText={setCustomName}
                maxLength={30}
              />
            </View>
          </View>
        )}

        {/* Budget Input */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget (optional)</Text>
          
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <DollarSign size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="z.B. 1500"
              placeholderTextColor={colors.textSecondary}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
            <Text style={[styles.currencyText, { color: colors.textSecondary }]}>€</Text>
          </View>
        </View>

        {/* Color Selection */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Farbe wählen</Text>
          
          <View style={styles.colorGrid}>
            {ROOM_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorItem,
                  { 
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 3 : 1,
                    borderColor: selectedColor === color ? colors.text : colors.border,
                  }
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vorschau</Text>
          
          <View style={[styles.previewCard, { borderColor: colors.border }]}>
            <View style={[styles.previewColorBar, { backgroundColor: selectedColor }]} />
            <View style={styles.previewContent}>
              <Text style={[styles.previewName, { color: colors.text }]}>
                {getRoomName()}
              </Text>
              {budget && (
                <Text style={[styles.previewBudget, { color: colors.textSecondary }]}>
                  Budget: €{budget}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              { 
                backgroundColor: selectedType ? colors.primary : colors.border,
              }
            ]}
            onPress={handleCreateRoom}
            disabled={!selectedType}
          >
            <Text style={[
              styles.createButtonText,
              { 
                color: selectedType ? 'white' : colors.textSecondary,
              }
            ]}>
              Raum erstellen
            </Text>
          </TouchableOpacity>
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  roomTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomTypeItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  roomTypeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roomTypeName: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 4,
  },
  currencyText: {
    fontSize: 16,
    marginLeft: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewColorBar: {
    height: 4,
  },
  previewContent: {
    padding: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewBudget: {
    fontSize: 14,
  },
  buttonContainer: {
    padding: 16,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});