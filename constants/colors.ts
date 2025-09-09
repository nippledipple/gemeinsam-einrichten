export interface ColorScheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  error: string;
  
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  
  priority: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  
  rooms: {
    livingRoom: string;
    bedroom: string;
    kitchen: string;
    bathroom: string;
    office: string;
    dining: string;
    balcony: string;
  };
  
  tabIconDefault: string;
  tabIconSelected: string;
}

export const LightColors: ColorScheme = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  error: '#FF3B30',
  
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  
  priority: {
    1: '#007AFF',
    2: '#34C759',
    3: '#FFCC00',
    4: '#FF9500',
    5: '#FF3B30',
  },
  
  rooms: {
    livingRoom: '#5856D6',
    bedroom: '#AF52DE',
    kitchen: '#FF9500',
    bathroom: '#00C7BE',
    office: '#FF3B30',
    dining: '#34C759',
    balcony: '#FFCC00',
  },
  
  tabIconDefault: '#C7C7CC',
  tabIconSelected: '#007AFF',
};

export const DarkColors: ColorScheme = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',
  error: '#FF453A',
  
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  
  priority: {
    1: '#0A84FF',
    2: '#30D158',
    3: '#FFD60A',
    4: '#FF9F0A',
    5: '#FF453A',
  },
  
  rooms: {
    livingRoom: '#5E5CE6',
    bedroom: '#BF5AF2',
    kitchen: '#FF9F0A',
    bathroom: '#40C8E0',
    office: '#FF453A',
    dining: '#30D158',
    balcony: '#FFD60A',
  },
  
  tabIconDefault: '#8E8E93',
  tabIconSelected: '#0A84FF',
};

// Default export for backward compatibility
export const Colors = LightColors;
export default Colors;