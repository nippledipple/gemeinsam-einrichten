import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { User, Space, Item, Proposal, Category, Room, Notification } from '@/types';
import { generateSpaceCode } from '@/utils/code-generator';
import { detectCategory, getDefaultRooms } from '@/utils/categories';
import { ColorScheme, LightColors, DarkColors } from '@/constants/colors';
import { useColorScheme } from 'react-native';
import { startConnectivityLoop } from '@/utils/net/ConnectivityStabilizer';
import realtimeService, { RoomPresence } from '@/utils/net/RealtimeService';

interface SpaceData {
  items: Item[];
  proposals: Proposal[];
  categories: Category[];
  rooms: Room[];
}

interface AppState {
  currentUser: User | null;
  currentSpace: Space | null;
  allSpaces: Space[];
  spaceData: { [spaceId: string]: SpaceData };
  notifications: Notification[];
  isLoading: boolean;
  isDarkMode: boolean | null;
  isOnline: boolean;
  lastSyncTime: number | null;
  isRealtimeConnected: boolean;
  spacePresence: { [spaceId: string]: RoomPresence };
}

const STORAGE_KEY = 'wohnideen_app_state';

export const [AppProvider, useApp] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [state, setState] = useState<AppState>({
    currentUser: null,
    currentSpace: null,
    allSpaces: [],
    spaceData: {},
    notifications: [],
    isLoading: true,
    isDarkMode: null,
    isOnline: true,
    lastSyncTime: null,
    isRealtimeConnected: false,
    spacePresence: {},
  });

  // Add notification function
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: Date.now(),
    };
    
    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...(prev.notifications || [])],
    }));
  }, []);

  // Real-time WebSocket connection management
  const connectToRealtime = useCallback(async () => {
    if (!state.currentUser || !state.isOnline) {
      console.log('[REALTIME] Cannot connect - no user or offline');
      return;
    }

    console.log('[REALTIME] Attempting to connect to WebSocket...');
    
    try {
      const connected = await realtimeService.connect();
      
      setState(prev => ({
        ...prev,
        isRealtimeConnected: connected,
      }));

      if (connected && state.currentSpace) {
        realtimeService.joinRoom(state.currentSpace.id, {
          id: state.currentUser.id,
          name: state.currentUser.name,
        });
      }
    } catch (error) {
      console.error('[REALTIME] Failed to connect:', error);
      setState(prev => ({
        ...prev,
        isRealtimeConnected: false,
      }));
    }
  }, [state.currentUser, state.isOnline, state.currentSpace]);

  // Setup real-time event listeners
  useEffect(() => {
    const handleConnect = () => {
      console.log('[REALTIME] Connected to WebSocket');
      setState(prev => ({ ...prev, isRealtimeConnected: true }));
      
      if (state.currentSpace && state.currentUser) {
        realtimeService.joinRoom(state.currentSpace.id, {
          id: state.currentUser.id,
          name: state.currentUser.name,
        });
      }
    };

    const handleDisconnect = () => {
      console.log('[REALTIME] Disconnected from WebSocket');
      setState(prev => ({ ...prev, isRealtimeConnected: false }));
    };

    const handleError = (error: any) => {
      console.error('[REALTIME] WebSocket error:', error);
      setState(prev => ({ ...prev, isRealtimeConnected: false }));
    };

    const handlePresenceUpdate = (data: { spaceId: string; presence: RoomPresence }) => {
      console.log('[REALTIME] Presence update:', data);
      setState(prev => ({
        ...prev,
        spacePresence: {
          ...prev.spacePresence,
          [data.spaceId]: data.presence,
        },
      }));
    };

    const handleStateUpdate = (data: { spaceId: string; state: any }) => {
      console.log('[REALTIME] State update received:', data);
      
      if (state.currentSpace?.id === data.spaceId) {
        setState(prev => ({
          ...prev,
          spaceData: {
            ...prev.spaceData,
            [data.spaceId]: data.state,
          },
          lastSyncTime: Date.now(),
        }));

        addNotification({
          type: 'info',
          title: 'Daten aktualisiert',
          message: 'Neue Änderungen von anderen Teilnehmern erhalten.',
        });
      }
    };

    realtimeService.on('connect', handleConnect);
    realtimeService.on('disconnect', handleDisconnect);
    realtimeService.on('error', handleError);
    realtimeService.on('presence:update', handlePresenceUpdate);
    realtimeService.on('state:broadcast', handleStateUpdate);

    return () => {
      realtimeService.off('connect', handleConnect);
      realtimeService.off('disconnect', handleDisconnect);
      realtimeService.off('error', handleError);
      realtimeService.off('presence:update', handlePresenceUpdate);
      realtimeService.off('state:broadcast', handleStateUpdate);
    };
  }, [state.currentSpace, state.currentUser, addNotification]);

  // Load persisted state and setup connectivity monitoring
  useEffect(() => {
    loadState();
    
    const cleanup = startConnectivityLoop((online: boolean) => {
      console.log('[APP-STORE] Stable connectivity change:', { online });
      
      setState(prev => {
        const wasOffline = !prev.isOnline;
        
        const newState = {
          ...prev,
          isOnline: online,
          lastSyncTime: online ? Date.now() : prev.lastSyncTime,
        };
        
        if (online && wasOffline) {
          setTimeout(() => {
            console.log('[APP-STORE] Triggering realtime connection after coming back online...');
            if (prev.currentSpace && prev.currentUser) {
              connectToRealtime();
            }
          }, 1000);
        }
        
        return newState;
      });
    });
    
    return cleanup;
  }, [connectToRealtime]);

  // Connect to realtime when user signs in
  useEffect(() => {
    if (state.currentUser && state.isOnline && !state.isLoading) {
      connectToRealtime();
    }
  }, [state.currentUser, state.isOnline, state.isLoading, connectToRealtime]);

  // Handle space switching for realtime
  useEffect(() => {
    if (state.currentSpace && state.currentUser && state.isRealtimeConnected) {
      console.log('[REALTIME] Switching to space:', state.currentSpace.id);
      realtimeService.joinRoom(state.currentSpace.id, {
        id: state.currentUser.id,
        name: state.currentUser.name,
      });
    }
  }, [state.currentSpace, state.currentUser, state.isRealtimeConnected]);

  const saveState = useCallback(async () => {
    try {
      const toSave = {
        currentUser: state.currentUser,
        currentSpace: state.currentSpace,
        allSpaces: state.allSpaces || [],
        spaceData: state.spaceData || {},
        notifications: state.notifications || [],
        isDarkMode: state.isDarkMode,
      };
      
      const jsonString = JSON.stringify(toSave);
      if (jsonString.length > 0) {
        await AsyncStorage.setItem(STORAGE_KEY, jsonString);
        console.log('State saved successfully');
      }
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [state]);

  useEffect(() => {
    if (!state.isLoading) {
      saveState();
    }
  }, [state.isLoading, saveState]);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        setState(prev => ({
          ...prev,
          currentUser: parsed.currentUser || null,
          currentSpace: parsed.currentSpace || null,
          allSpaces: Array.isArray(parsed.allSpaces) ? parsed.allSpaces : [],
          spaceData: (typeof parsed.spaceData === 'object' && parsed.spaceData !== null) ? parsed.spaceData : {},
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          isDarkMode: parsed.isDarkMode || null,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load state:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const validDomains = [
      'gmail.com', 'googlemail.com',
      'gmx.de', 'gmx.net', 'gmx.at', 'gmx.ch',
      'web.de', 't-online.de',
      'yahoo.com', 'yahoo.de',
      'hotmail.com', 'hotmail.de',
      'outlook.com', 'outlook.de',
      'icloud.com', 'me.com',
      'aol.com', 'aol.de'
    ];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    const domain = email.split('@')[1]?.toLowerCase();
    return validDomains.includes(domain);
  };

  // Auth functions
  const signIn = useCallback((name: string, email: string) => {
    if (!isValidEmail(email)) {
      throw new Error('Bitte verwende eine gültige E-Mail-Adresse von einem bekannten Anbieter (Gmail, GMX, Web.de, etc.)');
    }
    
    const user: User = {
      id: Date.now().toString(),
      name,
      email,
    };
    setState(prev => ({ ...prev, currentUser: user }));
  }, []);

  const signOut = useCallback(async () => {
    realtimeService.disconnect();
    
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState({
      currentUser: null,
      currentSpace: null,
      allSpaces: [],
      spaceData: {},
      notifications: [],
      isLoading: false,
      isDarkMode: null,
      isOnline: true,
      lastSyncTime: null,
      isRealtimeConnected: false,
      spacePresence: {},
    });
  }, []);

  // Real-time sync with WebSocket
  const syncWithRealtime = useCallback(() => {
    if (!state.currentSpace || !state.isRealtimeConnected) return;
    
    console.log('[REALTIME] Broadcasting state change...');
    
    const spaceData = state.spaceData?.[state.currentSpace.id] || {
      items: [],
      proposals: [],
      categories: [],
      rooms: getDefaultRooms(),
    };

    realtimeService.broadcastStateChange(state.currentSpace.id, spaceData);
    
    setState(prev => ({
      ...prev,
      lastSyncTime: Date.now(),
    }));
  }, [state.currentSpace, state.spaceData, state.isRealtimeConnected]);

  // Space functions
  const createSpace = useCallback((name: string) => {
    if (!state.currentUser) return;
    
    const spaceId = Date.now().toString();
    const space: Space = {
      id: spaceId,
      name,
      members: [state.currentUser],
      createdAt: Date.now(),
    };
    
    const initialSpaceData: SpaceData = {
      items: [],
      proposals: [],
      categories: [],
      rooms: getDefaultRooms(),
    };
    
    setState(prev => ({ 
      ...prev, 
      currentSpace: space,
      allSpaces: [...(prev.allSpaces || []), space],
      spaceData: {
        ...(prev.spaceData || {}),
        [spaceId]: initialSpaceData,
      },
    }));
  }, [state.currentUser]);

  const generateInviteCode = useCallback(() => {
    if (!state.currentSpace) return null;
    
    const code = generateSpaceCode();
    const expiry = Date.now() + 20000; // 20 seconds
    
    setState(prev => ({
      ...prev,
      currentSpace: prev.currentSpace ? {
        ...prev.currentSpace,
        code,
        codeExpiry: expiry,
      } : null,
      allSpaces: (prev.allSpaces || []).map(s => 
        s.id === prev.currentSpace?.id ? {
          ...s,
          code,
          codeExpiry: expiry,
        } : s
      ),
    }));
    
    return code;
  }, [state.currentSpace]);

  const joinSpace = useCallback((code: string) => {
    if (!state.currentUser) return false;
    
    if (code.length !== 4 || !/^[A-Z0-9]{4}$/.test(code)) {
      return false;
    }
    
    // Create a mock space for demo purposes
    if (code.match(/^[A-Z0-9]{4}$/)) {
      const spaceId = `space_${code}_${Date.now()}`;
      const mockSpace: Space = {
        id: spaceId,
        name: `Gemeinsamer Space ${code}`,
        members: [state.currentUser!],
        createdAt: Date.now(),
      };
      
      const initialSpaceData: SpaceData = {
        items: [],
        proposals: [],
        categories: [],
        rooms: getDefaultRooms(),
      };
      
      setState(prev => ({
        ...prev,
        currentSpace: mockSpace,
        allSpaces: [...(prev.allSpaces || []), mockSpace],
        spaceData: {
          ...(prev.spaceData || {}),
          [spaceId]: initialSpaceData,
        },
      }));
      
      addNotification({
        type: 'joined',
        title: 'Space beigetreten',
        message: `Du bist dem Space "${mockSpace.name}" beigetreten!`,
      });
      
      // Trigger realtime sync after joining
      setTimeout(() => {
        syncWithRealtime();
      }, 500);
      
      return true;
    }
    
    return false;
  }, [state.currentUser, addNotification, syncWithRealtime]);

  // Helper to get current space data
  const getCurrentSpaceData = useCallback((): SpaceData => {
    if (!state.currentSpace) {
      return { items: [], proposals: [], categories: [], rooms: getDefaultRooms() };
    }
    const data = state.spaceData?.[state.currentSpace.id];
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      proposals: Array.isArray(data?.proposals) ? data.proposals : [],
      categories: Array.isArray(data?.categories) ? data.categories : [],
      rooms: Array.isArray(data?.rooms) ? data.rooms : getDefaultRooms(),
    };
  }, [state.currentSpace, state.spaceData]);

  // Get current space presence
  const getCurrentSpacePresence = useCallback((): RoomPresence | null => {
    if (!state.currentSpace) return null;
    return state.spacePresence[state.currentSpace.id] || null;
  }, [state.currentSpace, state.spacePresence]);

  // Computed values
  const currentSpaceData = useMemo(() => getCurrentSpaceData(), [getCurrentSpaceData]);
  const currentSpacePresence = useMemo(() => getCurrentSpacePresence(), [getCurrentSpacePresence]);
  
  const priorityItems = useMemo(() => 
    (currentSpaceData.items || [])
      .filter(i => i.isPriority && i.status === 'accepted')
      .sort((a, b) => (a.priorityLevel || 0) - (b.priorityLevel || 0)),
    [currentSpaceData.items]
  );

  const pendingProposals = useMemo(() => 
    (currentSpaceData.proposals || []).filter(p => p.status === 'pending'),
    [currentSpaceData.proposals]
  );

  const acceptedItems = useMemo(() => 
    (currentSpaceData.items || []).filter(i => i.status === 'accepted'),
    [currentSpaceData.items]
  );

  const favoriteItems = useMemo(() => 
    (currentSpaceData.items || []).filter(i => i.isFavorite),
    [currentSpaceData.items]
  );
  
  const items = useMemo(() => currentSpaceData.items, [currentSpaceData.items]);
  const categories = useMemo(() => currentSpaceData.categories, [currentSpaceData.categories]);
  const rooms = useMemo(() => currentSpaceData.rooms, [currentSpaceData.rooms]);
  const proposals = useMemo(() => currentSpaceData.proposals, [currentSpaceData.proposals]);

  const unreadNotifications = useMemo(() => 
    (state.notifications || []).filter(n => !n.read).length,
    [state.notifications]
  );

  // Current theme colors
  const colors: ColorScheme = useMemo(() => {
    const isDark = state.isDarkMode === null 
      ? systemColorScheme === 'dark' 
      : state.isDarkMode;
    return isDark ? DarkColors : LightColors;
  }, [state.isDarkMode, systemColorScheme]);

  const isDarkTheme = useMemo(() => {
    return state.isDarkMode === null 
      ? systemColorScheme === 'dark' 
      : state.isDarkMode;
  }, [state.isDarkMode, systemColorScheme]);

  // Simple functions for demo
  const markNotificationRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => 
        n.id === notificationId 
          ? { ...n, read: true }
          : n
      ),
    }));
  }, []);

  const setTheme = useCallback((isDark: boolean | null) => {
    setState(prev => ({ ...prev, isDarkMode: isDark }));
  }, []);

  return {
    ...state,
    items: items || [],
    categories: categories || [],
    rooms: rooms || [],
    proposals: proposals || [],
    currentSpacePresence,
    signIn,
    signOut,
    createSpace,
    generateInviteCode,
    joinSpace,
    addNotification,
    markNotificationRead,
    setTheme,
    priorityItems,
    pendingProposals,
    acceptedItems,
    favoriteItems,
    unreadNotifications,
    colors,
    isDarkTheme,
    syncWithRealtime,
    isOnline: state.isOnline,
    lastSyncTime: state.lastSyncTime,
    isRealtimeConnected: state.isRealtimeConnected,
    spacePresence: state.spacePresence,
  };
});