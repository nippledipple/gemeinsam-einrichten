import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { User, Space, Item, Proposal, Category, Room, Notification } from '@/types';
import { generateSpaceCode } from '@/utils/code-generator';
import { detectCategory, getDefaultRooms } from '@/utils/categories';
import { ColorScheme, LightColors, DarkColors } from '@/constants/colors';
import { useColorScheme } from 'react-native';

interface SpaceData {
  items: Item[];
  proposals: Proposal[];
  categories: Category[];
  rooms: Room[];
}

interface AppState {
  currentUser: User | null;
  currentSpace: Space | null;
  allSpaces: Space[]; // Store all spaces user has access to
  spaceData: { [spaceId: string]: SpaceData }; // Space-specific data
  notifications: Notification[];
  isLoading: boolean;
  isDarkMode: boolean | null; // null = system preference
  isOnline: boolean; // Connection status
  lastSyncTime: number | null; // Last successful sync timestamp
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
    isOnline: true, // Start as online for production
    lastSyncTime: null,
  });

  // Load persisted state
  useEffect(() => {
    loadState();
  }, []);

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
      
      // Validate data before saving
      const jsonString = JSON.stringify(toSave);
      if (jsonString.length > 0) {
        await AsyncStorage.setItem(STORAGE_KEY, jsonString);
        console.log('State saved successfully');
      } else {
        console.error('Empty JSON string, not saving');
      }
    } catch (error) {
      console.error('Failed to save state:', error);
      // If save fails, try to clear corrupted storage
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (clearError) {
        console.error('Failed to clear storage after save error:', clearError);
      }
    }
  }, [state]);

  // Save state whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveState();
    }
  }, [state.isLoading, saveState]);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        console.log('Loading stored data:', stored.substring(0, 100) + '...');
        
        // Check if stored data is valid JSON
        if (stored.trim().length === 0) {
          console.log('Empty stored data, clearing storage');
          await AsyncStorage.removeItem(STORAGE_KEY);
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        // Try to parse JSON with better error handling
        let parsed;
        try {
          parsed = JSON.parse(stored);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.log('Corrupted data, clearing storage');
          await AsyncStorage.removeItem(STORAGE_KEY);
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        // Validate parsed data structure
        if (typeof parsed !== 'object' || parsed === null) {
          console.log('Invalid data structure, clearing storage');
          await AsyncStorage.removeItem(STORAGE_KEY);
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        setState(prev => ({
          ...prev,
          currentUser: parsed.currentUser || null,
          currentSpace: parsed.currentSpace || null,
          allSpaces: Array.isArray(parsed.allSpaces) ? parsed.allSpaces : [],
          spaceData: (typeof parsed.spaceData === 'object' && parsed.spaceData !== null) ? parsed.spaceData : {},
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          isDarkMode: parsed.isDarkMode || null,
          isOnline: true,
          lastSyncTime: Date.now(),
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isOnline: true, lastSyncTime: Date.now(), isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load state:', error);
      // Clear corrupted storage
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (clearError) {
        console.error('Failed to clear storage:', clearError);
      }
      setState(prev => ({ ...prev, isOnline: true, lastSyncTime: Date.now(), isLoading: false }));
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
    });
  }, []);

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
    
    // Initialize space data
    const initialSpaceData: SpaceData = {
      items: [],
      proposals: [],
      categories: [],
      rooms: getDefaultRooms(), // Create a safe copy to avoid reference issues
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

  // Real-time sync system using localStorage for cross-tab communication
  const syncWithOtherDevices = useCallback(() => {
    if (!state.currentSpace) return;
    
    console.log('Syncing with other devices...');
    
    try {
      // Create a sync event with current space data
      const syncData = {
        spaceId: state.currentSpace.id,
        spaceName: state.currentSpace.name,
        members: state.currentSpace.members,
        data: state.spaceData?.[state.currentSpace.id] || {
          items: [],
          proposals: [],
          categories: [],
          rooms: getDefaultRooms(),
        },
        timestamp: Date.now(),
        syncId: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      // Store sync data in localStorage for cross-tab communication
      if (typeof window !== 'undefined') {
        localStorage.setItem(`space_sync_${state.currentSpace.id}`, JSON.stringify(syncData));
        
        // Trigger storage event for other tabs/windows
        window.dispatchEvent(new StorageEvent('storage', {
          key: `space_sync_${state.currentSpace.id}`,
          newValue: JSON.stringify(syncData),
        }));
      }
      
      // Update sync status
      setState(prev => ({
        ...prev,
        isOnline: true,
        lastSyncTime: Date.now(),
      }));
      
      // Show sync notification
      setTimeout(() => {
        addNotification({
          type: 'info',
          title: 'Synchronisiert',
          message: 'Deine Daten wurden mit anderen Geräten synchronisiert.',
        });
      }, 500);
      
    } catch (error) {
      console.error('Sync failed:', error);
      setState(prev => ({
        ...prev,
        isOnline: false,
      }));
      addNotification({
        type: 'error',
        title: 'Synchronisation fehlgeschlagen',
        message: 'Die Synchronisation mit anderen Geräten ist fehlgeschlagen.',
      });
    }
  }, [state.currentSpace, state.spaceData, addNotification]);
  
  // Listen for sync events from other devices/tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key?.startsWith('space_sync_') || !event.newValue) return;
      
      try {
        const syncData = JSON.parse(event.newValue);
        const spaceId = syncData.spaceId;
        
        // Only sync if this is for our current space and from another device
        if (state.currentSpace?.id === spaceId && syncData.timestamp > Date.now() - 5000) {
          console.log('Received sync data from another device:', syncData);
          
          setState(prev => {
            // Update space data with synced data
            const updatedSpaceData = {
              ...(prev.spaceData || {}),
              [spaceId]: syncData.data,
            };
            
            // Update space members if needed
            const updatedSpace = {
              ...prev.currentSpace!,
              members: syncData.members || prev.currentSpace!.members,
            };
            
            const updatedAllSpaces = (prev.allSpaces || []).map(s => 
              s.id === spaceId ? updatedSpace : s
            );
            
            return {
              ...prev,
              currentSpace: updatedSpace,
              allSpaces: updatedAllSpaces,
              spaceData: updatedSpaceData,
              isOnline: true,
              lastSyncTime: Date.now(),
            };
          });
          
          addNotification({
            type: 'info',
            title: 'Daten aktualisiert',
            message: 'Neue Änderungen von anderen Geräten erhalten.',
          });
        }
      } catch (error) {
        console.error('Failed to process sync data:', error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [state.currentSpace, addNotification]);

  const joinSpace = useCallback((code: string) => {
    if (!state.currentUser) return false;
    
    if (code.length !== 4 || !/^[A-Z0-9]{4}$/.test(code)) {
      return false;
    }
    
    // Check all spaces for this code
    const allSpaces = state.allSpaces || [];
    for (const space of allSpaces) {
      // Check if space has this code and it's not expired
      if (space.code === code && 
          space.codeExpiry && 
          Date.now() < space.codeExpiry) {
        
        // Check if user is already a member
        const isAlreadyMember = (space.members || []).some(m => m.id === state.currentUser!.id);
        if (isAlreadyMember) {
          // Switch to this space if not current
          if (state.currentSpace?.id !== space.id) {
            setState(prev => ({ ...prev, currentSpace: space }));
            addNotification({
              type: 'info',
              title: 'Space gewechselt',
              message: `Du bist zu "${space.name}" gewechselt.`,
            });
          } else {
            addNotification({
              type: 'info',
              title: 'Bereits Mitglied',
              message: 'Du bist bereits Mitglied dieses Spaces.',
            });
          }
          return true;
        }
        
        // Add user to space and update both allSpaces and currentSpace
        const updatedSpace = {
          ...space,
          members: [...(space.members || []), state.currentUser!],
        };
        
        setState(prev => {
          // Initialize space data if it doesn't exist
          const spaceData = prev.spaceData?.[space.id] || {
            items: [],
            proposals: [],
            categories: [],
            rooms: getDefaultRooms(),
          };
          
          return {
            ...prev,
            currentSpace: updatedSpace,
            allSpaces: (prev.allSpaces || []).map(s => s.id === space.id ? updatedSpace : s),
            spaceData: {
              ...(prev.spaceData || {}),
              [space.id]: spaceData,
            },
          };
        });
        
        addNotification({
          type: 'joined',
          title: 'Space beigetreten',
          message: `Du bist dem Space "${space.name}" beigetreten!`,
        });
        
        // Trigger automatic synchronization after joining
        setTimeout(() => {
          syncWithOtherDevices();
        }, 500);
        
        return true;
      }
      
      // Check if there's a pending invite with this code in this space
      if (space.pendingInvites && space.pendingInvites.length > 0) {
        const validInvite = space.pendingInvites.find(invite => 
          invite.code === code && 
          Date.now() < invite.expiry &&
          invite.email.toLowerCase() === state.currentUser!.email.toLowerCase()
        );
        
        if (validInvite) {
          // Check if user is already a member
          const isAlreadyMember = (space.members || []).some(m => m.id === state.currentUser!.id);
          if (isAlreadyMember) {
            // Switch to this space if not current
            if (state.currentSpace?.id !== space.id) {
              setState(prev => ({ ...prev, currentSpace: space }));
              addNotification({
                type: 'info',
                title: 'Space gewechselt',
                message: `Du bist zu "${space.name}" gewechselt.`,
              });
            } else {
              addNotification({
                type: 'info',
                title: 'Bereits Mitglied',
                message: 'Du bist bereits Mitglied dieses Spaces.',
              });
            }
            return true;
          }
          
          // Add user to space and remove the used invite
          const updatedSpace = {
            ...space,
            members: [...(space.members || []), state.currentUser!],
            pendingInvites: (space.pendingInvites || []).filter(inv => inv.code !== code),
          };
          
          setState(prev => {
            // Initialize space data if it doesn't exist
            const spaceData = prev.spaceData?.[space.id] || {
              items: [],
              proposals: [],
              categories: [],
              rooms: getDefaultRooms(),
            };
            
            // Update both allSpaces and currentSpace
            const updatedAllSpaces = (prev.allSpaces || []).map(s => s.id === space.id ? updatedSpace : s);
            const hasSpace = updatedAllSpaces.some(s => s.id === space.id);
            
            return {
              ...prev,
              currentSpace: updatedSpace,
              allSpaces: hasSpace ? updatedAllSpaces : [...updatedAllSpaces, updatedSpace],
              spaceData: {
                ...(prev.spaceData || {}),
                [space.id]: spaceData,
              },
            };
          });
          
          addNotification({
            type: 'joined',
            title: 'Space beigetreten',
            message: `Du bist dem Space "${space.name}" beigetreten!`,
          });
          
          // Trigger synchronization after joining
          setTimeout(() => {
            syncWithOtherDevices();
          }, 500);
          
          return true;
        }
      }
    }
    
    // If no space found, create a mock space for demo purposes
    // In production, this would query the backend for the space
    if (code.match(/^[A-Z0-9]{4}$/)) {
      const spaceId = `space_${code}_${Date.now()}`;
      const mockSpace: Space = {
        id: spaceId,
        name: `Gemeinsamer Space ${code}`,
        members: [state.currentUser!],
        createdAt: Date.now(),
      };
      
      // Initialize space data
      const initialSpaceData: SpaceData = {
        items: [],
        proposals: [],
        categories: [],
        rooms: getDefaultRooms(),
      };
      
      // Check if we already have a space with this code pattern
      const existingSpace = (state.allSpaces || []).find(s => s.id.includes(`space_${code}_`));
      
      if (existingSpace) {
        // Switch to existing space instead of creating a new one
        setState(prev => ({ ...prev, currentSpace: existingSpace }));
      } else {
        setState(prev => ({
          ...prev,
          currentSpace: mockSpace,
          allSpaces: [...(prev.allSpaces || []), mockSpace],
          spaceData: {
            ...(prev.spaceData || {}),
            [spaceId]: initialSpaceData,
          },
        }));
      }
      
      addNotification({
        type: 'joined',
        title: 'Space beigetreten',
        message: `Du bist dem Space "${mockSpace.name}" beigetreten!`,
      });
      
      // Trigger synchronization after joining mock space
      setTimeout(() => {
        syncWithOtherDevices();
      }, 500);
      
      return true;
    }
    
    addNotification({
      type: 'error',
      title: 'Code ungültig',
      message: 'Dieser Code ist nicht gültig, abgelaufen oder nicht für deine E-Mail-Adresse bestimmt.',
    });
    
    return false;
  }, [state.currentUser, state.allSpaces, state.currentSpace, addNotification, syncWithOtherDevices]);

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

  // Item functions
  const addItem = useCallback((
    title: string,
    description?: string,
    url?: string,
    imageUrl?: string,
    price?: number,
    categoryName?: string,
    roomId?: string,
    asProposal: boolean = true
  ) => {
    if (!state.currentUser || !state.currentSpace) return;
    
    const currentSpaceData = getCurrentSpaceData();
    const detected = detectCategory(title);
    const finalCategoryName = categoryName || detected.categoryName;
    const finalRoomId = roomId || detected.roomId;
    const icon = detected.icon;
    
    // Find or create category in current space
    let category = currentSpaceData.categories.find(c => c.name === finalCategoryName);
    if (!category) {
      category = {
        id: Date.now().toString(),
        name: finalCategoryName,
        roomId: finalRoomId,
        itemCount: 0,
        icon,
      };
    }
    
    const item: Item = {
      id: Date.now().toString(),
      title,
      description,
      url,
      imageUrl: imageUrl || `https://source.unsplash.com/400x300/?furniture,${title}`,
      price,
      categoryId: category.id,
      categoryName: finalCategoryName,
      roomId: finalRoomId,
      addedBy: state.currentUser.id,
      status: asProposal ? 'pending' : 'accepted',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Create proposal if needed
    let proposal: Proposal | null = null;
    if (asProposal && state.currentSpace && state.currentSpace.members.length > 1) {
      const otherMember = state.currentSpace.members.find(m => m.id !== state.currentUser!.id);
      if (otherMember) {
        proposal = {
          id: `proposal_${Date.now()}`,
          itemId: item.id,
          item: item,
          proposedBy: state.currentUser.id,
          proposedTo: otherMember.id,
          status: 'pending',
          createdAt: Date.now(),
        };
      }
    }
    
    setState(prev => {
      const spaceId = prev.currentSpace!.id;
      const currentData = prev.spaceData?.[spaceId] || { items: [], proposals: [], categories: [], rooms: getDefaultRooms() };
      
      const updatedCategories = (currentData.categories || []).find(c => c.id === category!.id)
        ? (currentData.categories || []).map(c => 
            c.id === category!.id 
              ? { ...c, itemCount: c.itemCount + 1 }
              : c
          )
        : [...(currentData.categories || []), { ...category!, itemCount: 1 }];
      
      return {
        ...prev,
        spaceData: {
          ...(prev.spaceData || {}),
          [spaceId]: {
            ...currentData,
            items: [...(currentData.items || []), item],
            categories: updatedCategories,
            proposals: proposal ? [...(currentData.proposals || []), proposal] : (currentData.proposals || []),
          },
        },
      };
    });
    
    // Trigger sync after adding item
    setTimeout(() => {
      syncWithOtherDevices();
    }, 100);
    
    return item;
  }, [state.currentUser, state.currentSpace, getCurrentSpaceData, syncWithOtherDevices]);

  const deleteItem = useCallback((itemId: string) => {
    if (!state.currentSpace) return;
    
    setState(prev => {
      const spaceId = prev.currentSpace!.id;
      const currentData = prev.spaceData?.[spaceId];
      if (!currentData) return prev;
      
      const item = (currentData.items || []).find(i => i.id === itemId);
      if (!item) return prev;
      
      const updatedItems = (currentData.items || []).filter(i => i.id !== itemId);
      const updatedCategories = (currentData.categories || []).map(c => 
        c.id === item.categoryId 
          ? { ...c, itemCount: Math.max(0, c.itemCount - 1) }
          : c
      ).filter(c => c.itemCount > 0); // Remove empty categories
      
      // Also remove from proposals if it exists
      const updatedProposals = (currentData.proposals || []).filter(p => p.itemId !== itemId);
      
      return {
        ...prev,
        spaceData: {
          ...(prev.spaceData || {}),
          [spaceId]: {
            ...currentData,
            items: updatedItems,
            categories: updatedCategories,
            proposals: updatedProposals,
          },
        },
      };
    });
    
    // Trigger sync after operation
    setTimeout(() => {
      syncWithOtherDevices();
    }, 100);
  }, [state.currentSpace, syncWithOtherDevices]);

  const deleteRoom = useCallback((roomId: string) => {
    if (!state.currentSpace) return;
    
    setState(prev => {
      const spaceId = prev.currentSpace!.id;
      const currentData = prev.spaceData?.[spaceId];
      if (!currentData) return prev;
      
      // Remove all items in this room
      const updatedItems = (currentData.items || []).filter(i => i.roomId !== roomId);
      // Remove all categories in this room
      const updatedCategories = (currentData.categories || []).filter(c => c.roomId !== roomId);
      // Remove the room
      const updatedRooms = (currentData.rooms || []).filter(r => r.id !== roomId);
      
      return {
        ...prev,
        spaceData: {
          ...(prev.spaceData || {}),
          [spaceId]: {
            ...currentData,
            items: updatedItems,
            categories: updatedCategories,
            rooms: updatedRooms,
          },
        },
      };
    });
    
    // Trigger sync after operation
    setTimeout(() => {
      syncWithOtherDevices();
    }, 100);
  }, [state.currentSpace, syncWithOtherDevices]);

  const respondToProposal = useCallback((proposalId: string, response: 'accepted' | 'rejected' | 'later') => {
    if (!state.currentSpace) return;
    
    setState(prev => {
      const spaceId = prev.currentSpace!.id;
      const currentData = prev.spaceData?.[spaceId];
      if (!currentData) return prev;
      
      const proposal = (currentData.proposals || []).find(p => p.id === proposalId);
      if (!proposal) return prev;
      
      const updatedProposals = (currentData.proposals || []).map(p => 
        p.id === proposalId 
          ? { ...p, status: response, respondedAt: Date.now() }
          : p
      );
      
      const updatedItems = response === 'accepted' 
        ? (currentData.items || []).map(i => 
            i.id === proposal.itemId 
              ? { ...i, status: 'accepted' as const, updatedAt: Date.now() }
              : i
          )
        : response === 'rejected'
        ? (currentData.items || []).filter(i => i.id !== proposal.itemId)
        : currentData.items || [];
      
      return {
        ...prev,
        spaceData: {
          ...(prev.spaceData || {}),
          [spaceId]: {
            ...currentData,
            proposals: updatedProposals,
            items: updatedItems,
          },
        },
      };
    });
    
    // Add response notification
    const responseText = response === 'accepted' ? 'angenommen' : response === 'rejected' ? 'abgelehnt' : 'verschoben';
    addNotification({
      type: 'response',
      title: 'Antwort erhalten',
      message: `Dein Vorschlag wurde ${responseText}`,
    });
    
    // Trigger sync after responding to proposal
    setTimeout(() => {
      syncWithOtherDevices();
    }, 100);
  }, [state.currentSpace, addNotification, syncWithOtherDevices]);

  const togglePriority = useCallback((itemId: string) => {
    if (!state.currentSpace) return;
    
    setState(prev => {
      const spaceId = prev.currentSpace!.id;
      const currentData = prev.spaceData?.[spaceId];
      if (!currentData) return prev;
      
      const priorityItems = (currentData.items || []).filter(i => i.isPriority);
      const item = (currentData.items || []).find(i => i.id === itemId);
      
      if (!item) return prev;
      
      let updatedItems;
      if (item.isPriority) {
        // Remove from priority
        updatedItems = (currentData.items || []).map(i => 
          i.id === itemId 
            ? { ...i, isPriority: false, priorityLevel: undefined }
            : i.priorityLevel && i.priorityLevel > (item.priorityLevel || 0)
            ? { ...i, priorityLevel: i.priorityLevel - 1 }
            : i
        );
      } else if (priorityItems.length < 5) {
        // Add to priority
        updatedItems = (currentData.items || []).map(i => 
          i.id === itemId 
            ? { ...i, isPriority: true, priorityLevel: priorityItems.length + 1 }
            : i
        );
      } else {
        return prev;
      }
      
      return {
        ...prev,
        spaceData: {
          ...(prev.spaceData || {}),
          [spaceId]: {
            ...currentData,
            items: updatedItems,
          },
        },
      };
    });
    
    // Trigger sync after operation
    setTimeout(() => {
      syncWithOtherDevices();
    }, 100);
  }, [state.currentSpace, syncWithOtherDevices]);

  const toggleFavorite = useCallback((itemId: string) => {
    if (!state.currentSpace) return;
    
    setState(prev => {
      const spaceId = prev.currentSpace!.id;
      const currentData = prev.spaceData?.[spaceId];
      if (!currentData) return prev;
      
      const updatedItems = (currentData.items || []).map(i => 
        i.id === itemId 
          ? { ...i, isFavorite: !i.isFavorite }
          : i
      );
      
      return {
        ...prev,
        spaceData: {
          ...(prev.spaceData || {}),
          [spaceId]: {
            ...currentData,
            items: updatedItems,
          },
        },
      };
    });
    
    // Trigger sync after operation
    setTimeout(() => {
      syncWithOtherDevices();
    }, 100);
  }, [state.currentSpace, syncWithOtherDevices]);

  const updateRoomBudget = useCallback((roomId: string, budget: number) => {
    if (!state.currentSpace) return;
    
    setState(prev => {
      const spaceId = prev.currentSpace!.id;
      const currentData = prev.spaceData?.[spaceId];
      if (!currentData) return prev;
      
      const updatedRooms = (currentData.rooms || []).map(r => 
        r.id === roomId 
          ? { ...r, budget }
          : r
      );
      
      return {
        ...prev,
        spaceData: {
          ...(prev.spaceData || {}),
          [spaceId]: {
            ...currentData,
            rooms: updatedRooms,
          },
        },
      };
    });
    
    // Trigger sync after operation
    setTimeout(() => {
      syncWithOtherDevices();
    }, 100);
  }, [state.currentSpace, syncWithOtherDevices]);



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

  // Theme functions
  const setTheme = useCallback((isDark: boolean | null) => {
    setState(prev => ({ ...prev, isDarkMode: isDark }));
  }, []);

  const addRoom = useCallback((name: string, icon: string, color: string) => {
    if (!state.currentSpace) return;
    
    const room: Room = {
      id: Date.now().toString(),
      name,
      icon,
      color,
      budget: 0,
      spent: 0,
    };
    
    setState(prev => {
      const spaceId = prev.currentSpace!.id;
      const currentData = prev.spaceData?.[spaceId];
      if (!currentData) return prev;
      
      return {
        ...prev,
        spaceData: {
          ...(prev.spaceData || {}),
          [spaceId]: {
            ...currentData,
            rooms: [...(currentData.rooms || []), room],
          },
        },
      };
    });
    
    // Trigger sync after adding room
    setTimeout(() => {
      syncWithOtherDevices();
    }, 100);
    
    return room;
  }, [state.currentSpace, syncWithOtherDevices]);

  // Clean up expired invites
  const cleanupExpiredInvites = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSpace: prev.currentSpace ? {
        ...prev.currentSpace,
        pendingInvites: (prev.currentSpace?.pendingInvites || []).filter(invite => 
          Date.now() < invite.expiry
        ),
      } : null,
      allSpaces: (prev.allSpaces || []).map(space => ({
        ...space,
        pendingInvites: (space.pendingInvites || []).filter(invite => 
          Date.now() < invite.expiry
        ),
      })),
    }));
  }, []);

  const switchSpace = useCallback((spaceId: string) => {
    const space = (state.allSpaces || []).find(s => s.id === spaceId);
    if (space) {
      setState(prev => {
        // Initialize space data if it doesn't exist
        const spaceData = prev.spaceData?.[spaceId] || {
          items: [],
          proposals: [],
          categories: [],
          rooms: getDefaultRooms(),
        };
        
        return {
          ...prev,
          currentSpace: space,
          spaceData: {
            ...(prev.spaceData || {}),
            [spaceId]: spaceData,
          },
        };
      });
      
      addNotification({
        type: 'info',
        title: 'Space gewechselt',
        message: `Du bist zu "${space.name}" gewechselt.`,
      });
      return true;
    }
    return false;
  }, [state.allSpaces, addNotification]);

  const leaveSpace = useCallback((spaceId: string) => {
    if ((state.allSpaces || []).length <= 1) {
      return false; // Can't leave the last space
    }
    
    const space = (state.allSpaces || []).find(s => s.id === spaceId);
    if (!space) return false;
    
    setState(prev => {
      const remainingSpaces = (prev.allSpaces || []).filter(s => s.id !== spaceId);
      const updatedSpaceData = { ...(prev.spaceData || {}) };
      delete updatedSpaceData[spaceId]; // Remove space data
      
      // If leaving current space, switch to first remaining space
      const newCurrentSpace = prev.currentSpace?.id === spaceId 
        ? remainingSpaces[0] || null
        : prev.currentSpace;
      
      return {
        ...prev,
        currentSpace: newCurrentSpace,
        allSpaces: remainingSpaces,
        spaceData: updatedSpaceData,
      };
    });
    
    addNotification({
      type: 'info',
      title: 'Space verlassen',
      message: `Du hast den Space "${space.name}" verlassen.`,
    });
    
    return true;
  }, [state.allSpaces, state.currentSpace, addNotification]);

  // Clean up expired invites every minute
  useEffect(() => {
    const interval = setInterval(cleanupExpiredInvites, 60000);
    return () => clearInterval(interval);
  }, [cleanupExpiredInvites]);

  const inviteToSpace = useCallback((email: string) => {
    if (!state.currentSpace) return false;
    
    if (!isValidEmail(email)) {
      addNotification({
        type: 'error',
        title: 'Ungültige E-Mail',
        message: 'Bitte verwende eine gültige E-Mail-Adresse von einem bekannten Anbieter.',
      });
      return false;
    }
    
    // Check if user is already a member
    const isAlreadyMember = (state.currentSpace.members || []).some(m => m.email.toLowerCase() === email.toLowerCase());
    if (isAlreadyMember) {
      addNotification({
        type: 'info',
        title: 'Bereits Mitglied',
        message: `${email} ist bereits Mitglied dieses Spaces.`,
      });
      return false;
    }
    
    // Generate a temporary invitation code for this email
    const inviteCode = generateSpaceCode();
    const expiry = Date.now() + 300000; // 5 minutes for email invites
    
    // Store the invitation (in production this would be in backend)
    setState(prev => ({
      ...prev,
      currentSpace: prev.currentSpace ? {
        ...prev.currentSpace,
        pendingInvites: [
          ...(prev.currentSpace?.pendingInvites || []),
          {
            email,
            code: inviteCode,
            expiry,
            invitedBy: state.currentUser!.id,
          }
        ],
      } : null,
      allSpaces: (prev.allSpaces || []).map(s => 
        s.id === prev.currentSpace?.id ? {
          ...s,
          pendingInvites: [
            ...(s.pendingInvites || []),
            {
              email,
              code: inviteCode,
              expiry,
              invitedBy: state.currentUser!.id,
            }
          ],
        } : s
      ),
    }));
    
    addNotification({
      type: 'info',
      title: 'Einladung erstellt',
      message: `Einladungscode für ${email}: ${inviteCode}\nGültig für 5 Minuten. Teile diesen Code mit der Person.`,
    });
    
    // Trigger sync after inviting to space
    setTimeout(() => {
      syncWithOtherDevices();
    }, 100);
    
    return true;
  }, [state.currentSpace, state.currentUser, addNotification, syncWithOtherDevices]);

  // Computed values for current space
  const currentSpaceData = useMemo(() => getCurrentSpaceData(), [getCurrentSpaceData]);
  
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

  return {
    ...state,
    items: items || [],
    categories: categories || [],
    rooms: rooms || [],
    proposals: proposals || [],
    signIn,
    signOut,
    createSpace,
    generateInviteCode,
    joinSpace,
    switchSpace,
    leaveSpace,
    addItem,
    deleteItem,
    deleteRoom,
    respondToProposal,
    togglePriority,
    toggleFavorite,
    updateRoomBudget,
    addNotification,
    markNotificationRead,
    setTheme,
    addRoom,
    inviteToSpace,
    priorityItems,
    pendingProposals,
    acceptedItems,
    favoriteItems,
    unreadNotifications,
    colors,
    isDarkTheme,
    syncWithOtherDevices,
    isOnline: state.isOnline,
    lastSyncTime: state.lastSyncTime,
  };
});