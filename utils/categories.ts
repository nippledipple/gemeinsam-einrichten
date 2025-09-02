import { Room } from '@/types';
import { Colors } from '@/constants/colors';

const categoryMappings: Record<string, { room: string; icon: string }> = {
  'sofa': { room: 'livingRoom', icon: 'sofa' },
  'couch': { room: 'livingRoom', icon: 'sofa' },
  'stuhl': { room: 'dining', icon: 'armchair' },
  'chair': { room: 'dining', icon: 'armchair' },
  'tisch': { room: 'dining', icon: 'square' },
  'table': { room: 'dining', icon: 'square' },
  'bett': { room: 'bedroom', icon: 'bed' },
  'bed': { room: 'bedroom', icon: 'bed' },
  'schrank': { room: 'bedroom', icon: 'archive' },
  'wardrobe': { room: 'bedroom', icon: 'archive' },
  'küche': { room: 'kitchen', icon: 'utensils' },
  'kitchen': { room: 'kitchen', icon: 'utensils' },
  'bad': { room: 'bathroom', icon: 'droplet' },
  'bathroom': { room: 'bathroom', icon: 'droplet' },
  'lampe': { room: 'livingRoom', icon: 'lamp' },
  'lamp': { room: 'livingRoom', icon: 'lamp' },
  'teppich': { room: 'livingRoom', icon: 'square' },
  'rug': { room: 'livingRoom', icon: 'square' },
  'regal': { room: 'livingRoom', icon: 'book' },
  'shelf': { room: 'livingRoom', icon: 'book' },
};

export function detectCategory(title: string): { categoryName: string; roomId: string; icon: string } {
  const lowerTitle = title.toLowerCase();
  
  for (const [keyword, mapping] of Object.entries(categoryMappings)) {
    if (lowerTitle.includes(keyword)) {
      return {
        categoryName: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        roomId: mapping.room,
        icon: mapping.icon,
      };
    }
  }
  
  return {
    categoryName: 'Sonstiges',
    roomId: 'livingRoom',
    icon: 'package',
  };
}

export const defaultRooms: Room[] = [
  { id: 'livingRoom', name: 'Wohnzimmer', budget: 3000, spent: 0, color: Colors.rooms.livingRoom, icon: 'sofa' },
  { id: 'bedroom', name: 'Schlafzimmer', budget: 2000, spent: 0, color: Colors.rooms.bedroom, icon: 'bed' },
  { id: 'kitchen', name: 'Küche', budget: 4000, spent: 0, color: Colors.rooms.kitchen, icon: 'utensils' },
  { id: 'bathroom', name: 'Badezimmer', budget: 1500, spent: 0, color: Colors.rooms.bathroom, icon: 'droplet' },
  { id: 'dining', name: 'Esszimmer', budget: 1500, spent: 0, color: Colors.rooms.dining, icon: 'utensils-crossed' },
  { id: 'office', name: 'Büro', budget: 1000, spent: 0, color: Colors.rooms.office, icon: 'briefcase' },
  { id: 'balcony', name: 'Balkon', budget: 500, spent: 0, color: Colors.rooms.balcony, icon: 'sun' },
];