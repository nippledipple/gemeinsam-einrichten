import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
  Image,
  Modal,
} from 'react-native';
import { Camera, Link2, Package, ChevronDown, X, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { useApp } from '@/hooks/app-store';
import { router } from 'expo-router';

export default function SearchScreen() {
  const { addItem, currentSpace, rooms, categories } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [asProposal, setAsProposal] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const hasPartner = currentSpace && currentSpace.members.length > 1;

  const allCategories = [
    'Sofa', 'Stuhl', 'Tisch', 'Bett', 'Schrank', 'Lampe', 'Teppich', 'Regal',
    'Küche', 'Bad', 'Dekoration', 'Sonstiges'
  ];

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Wir benötigen Zugriff auf deine Fotos.');
        return false;
      }
      
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Wir benötigen Zugriff auf deine Kamera.');
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Fehler', 'Foto konnte nicht aufgenommen werden.');
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Fehler', 'Bild konnte nicht ausgewählt werden.');
    }
  };

  const handleAddItem = () => {
    if (!title.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Titel ein');
      return;
    }

    const priceNum = price ? parseFloat(price) : undefined;
    const selectedRoomId = selectedRoom ? rooms.find(r => r.name === selectedRoom)?.id : undefined;
    
    addItem(
      title,
      description || undefined,
      url || undefined,
      imageUri || undefined,
      priceNum,
      selectedCategory || undefined,
      selectedRoomId,
      hasPartner ? asProposal : false
    );

    Alert.alert(
      'Erfolg',
      hasPartner && asProposal 
        ? 'Artikel wurde als Vorschlag gesendet' 
        : 'Artikel wurde hinzugefügt',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleTakePhoto}>
            <Camera size={32} color={Colors.primary} />
            <Text style={styles.quickActionText}>Foto aufnehmen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={handlePickImage}>
            <ImageIcon size={32} color={Colors.primary} />
            <Text style={styles.quickActionText}>Aus Galerie</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setImageUri(null)}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titel *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="z.B. Graues Sofa"
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL (optional)</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Beschreibung (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="z.B. Grauer Stoff, sehr bequem..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategorie (optional)</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={[styles.selectButtonText, selectedCategory && styles.selectButtonTextSelected]}>
                {selectedCategory || 'Kategorie wählen'}
              </Text>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Raum (optional)</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowRoomModal(true)}
            >
              <Text style={[styles.selectButtonText, selectedRoom && styles.selectButtonTextSelected]}>
                {selectedRoom || 'Raum wählen'}
              </Text>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preis (optional)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="299.99"
              keyboardType="decimal-pad"
            />
          </View>

          {hasPartner && (
            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Als Vorschlag senden</Text>
                <Text style={styles.switchDescription}>
                  Dein Partner erhält eine Benachrichtigung
                </Text>
              </View>
              <Switch
                value={asProposal}
                onValueChange={setAsProposal}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="white"
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              title.trim() ? styles.buttonActive : styles.buttonDisabled,
            ]}
            onPress={handleAddItem}
            disabled={!title.trim()}
          >
            <Package size={20} color="white" />
            <Text style={styles.buttonText}>Artikel hinzufügen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategorie wählen</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity 
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCategory('');
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[styles.modalItemText, !selectedCategory && styles.modalItemTextSelected]}>
                  Automatisch erkennen
                </Text>
              </TouchableOpacity>
              {allCategories.map((category) => (
                <TouchableOpacity 
                  key={category}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, selectedCategory === category && styles.modalItemTextSelected]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Room Modal */}
      <Modal
        visible={showRoomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Raum wählen</Text>
              <TouchableOpacity onPress={() => setShowRoomModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity 
                style={styles.modalItem}
                onPress={() => {
                  setSelectedRoom('');
                  setShowRoomModal(false);
                }}
              >
                <Text style={[styles.modalItemText, !selectedRoom && styles.modalItemTextSelected]}>
                  Automatisch zuordnen
                </Text>
              </TouchableOpacity>
              {rooms.map((room) => (
                <TouchableOpacity 
                  key={room.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedRoom(room.name);
                    setShowRoomModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, selectedRoom === room.name && styles.modalItemTextSelected]}>
                    {room.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  quickActionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 20,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  button: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  imagePreview: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectButton: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  selectButtonTextSelected: {
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});