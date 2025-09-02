import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/hooks/app-store';
import { ItemCard } from '@/components/ItemCard';
import { RoomBudgetCard } from '@/components/RoomBudgetCard';
import { BudgetEditModal } from '@/components/BudgetEditModal';

export default function BoardsScreen() {
  const { rooms, categories, acceptedItems, toggleFavorite, updateRoomBudget } = useApp();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [budgetModalVisible, setBudgetModalVisible] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<{ id: string; name: string; budget?: number } | null>(null);

  const roomTabs = [
    { id: null, name: 'Alle' },
    ...rooms,
  ];

  const filteredItems = selectedRoom
    ? acceptedItems.filter(item => item.roomId === selectedRoom)
    : acceptedItems;

  const sections = categories
    .filter(cat => !selectedRoom || cat.roomId === selectedRoom)
    .map(cat => ({
      title: cat.name,
      data: filteredItems.filter(item => item.categoryId === cat.id),
    }))
    .filter(section => section.data.length > 0);

  const handleEditBudget = (room: any) => {
    setEditingRoom(room);
    setBudgetModalVisible(true);
  };

  const handleSaveBudget = (roomId: string, budget: number) => {
    updateRoomBudget(roomId, budget);
  };

  const handleCloseBudgetModal = () => {
    setBudgetModalVisible(false);
    setEditingRoom(null);
  };

  return (
    <View style={styles.container}>
      {/* Room Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {roomTabs.map((room) => (
          <TouchableOpacity
            key={room.id || 'all'}
            style={[
              styles.tab,
              selectedRoom === room.id && styles.tabActive,
            ]}
            onPress={() => setSelectedRoom(room.id)}
          >
            <Text
              style={[
                styles.tabText,
                selectedRoom === room.id && styles.tabTextActive,
              ]}
            >
              {room.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Budget Overview */}
      {selectedRoom && (
        <View style={styles.budgetSection}>
          {rooms
            .filter(r => r.id === selectedRoom)
            .map(room => (
              <RoomBudgetCard
                key={room.id}
                room={room}
                onPress={() => handleEditBudget(room)}
              />
            ))}
        </View>
      )}

      {/* Items by Category */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <ItemCard
              item={item}
              onPress={() => {}}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Keine Artikel</Text>
            <Text style={styles.emptyText}>
              Füge Artikel hinzu, um sie hier zu sehen
            </Text>
          </View>
        }
      />
      
      <BudgetEditModal
        visible={budgetModalVisible}
        room={editingRoom}
        onClose={handleCloseBudgetModal}
        onSave={handleSaveBudget}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabs: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  tabTextActive: {
    color: 'white',
  },
  budgetSection: {
    padding: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  itemContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});