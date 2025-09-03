import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { User, Space, Item, Proposal, Category, Room, Notification } from '@/types';
import { generateSpaceCode } from '@/utils/code-generator';
import { detectCategory, defaultRooms } from '@/utils/categories';
import { ColorScheme, LightColors, DarkColors } from '@/constants/colors';
import { useColorScheme } from 'react-native';

interface AppState {
  currentUser: User | null;
  currentSpace: Space | null;
  items: Item[];
  proposals: Proposal[];
  categories: Category[];
  rooms: Room[];
  notifications: Notification[];
  isLoading: boolean;
  isDarkMode: boolean | null; // null = system preference
}

const STORAGE_KEY = 'wohnideen_app_state';

export const [AppProvider, useApp] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [state, setState] = useState<AppState>({
    currentUser: null,
    currentSpace: null,
    items: [],
    proposals: [],
    categories: [],
    rooms: defaultRooms,
    notifications: [],
    isLoading: true,
    isDarkMode: null,
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
        items: state.items,
        proposals: state.proposals,
        categories: state.categories,
        rooms: state.rooms,
        notifications: state.notifications,
        isDarkMode: state.isDarkMode,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save state:', error);
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
        const parsed = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          ...parsed,
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
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState({
      currentUser: null,
      currentSpace: null,
      items: [],
      proposals: [],
      categories: [],
      rooms: defaultRooms,
      notifications: [],
      isLoading: false,
      isDarkMode: null,
    });
  }, []);

  // Space functions
  const createSpace = useCallback((name: string) => {
    if (!state.currentUser) return;
    
    const space: Space = {
      id: Date.now().toString(),
      name,
      members: [state.currentUser],
      createdAt: Date.now(),
    };
    
    setState(prev => ({ ...prev, currentSpace: space }));
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
      notifications: [newNotification, ...prev.notifications],
    }));
  }, []);

  const joinSpace = useCallback((code: string) => {
    if (!state.currentUser) return false;
    
    if (code.length !== 4 || !/^[A-Z0-9]{4}$/.test(code)) {
      return false;
    }
    
    // Check if current space has this code and it's not expired
    if (state.currentSpace?.code === code && 
        state.currentSpace.codeExpiry && 
        Date.now() < state.currentSpace.codeExpiry) {
      
      // Check if user is already a member
      const isAlreadyMember = state.currentSpace.members.some(m => m.id === state.currentUser!.id);
      if (isAlreadyMember) {
        addNotification({
          type: 'info',
          title: 'Bereits Mitglied',
          message: 'Du bist bereits Mitglied dieses Spaces.',
        });
        return true;
      }
      
      // Add user to space
      setState(prev => ({
        ...prev,
        currentSpace: prev.currentSpace ? {
          ...prev.currentSpace,
          members: [...prev.currentSpace.members, state.currentUser!],
        } : null,
      }));
      
      addNotification({
        type: 'joined',
        title: 'Space beigetreten',
        message: `Du bist dem Space "${state.currentSpace.name}" beigetreten!`,
      });
      
      return true;
    }
    
    // Check if there's a pending invite with this code
    if (state.currentSpace?.pendingInvites) {
      const validInvite = state.currentSpace.pendingInvites.find(invite => 
        invite.code === code && 
        Date.now() < invite.expiry &&
        invite.email.toLowerCase() === state.currentUser!.email.toLowerCase()
      );
      
      if (validInvite) {
        // Check if user is already a member
        const isAlreadyMember = state.currentSpace.members.some(m => m.id === state.currentUser!.id);
        if (isAlreadyMember) {
          addNotification({
            type: 'info',
            title: 'Bereits Mitglied',
            message: 'Du bist bereits Mitglied dieses Spaces.',
          });
          return true;
        }
        
        // Add user to space and remove the used invite
        setState(prev => ({
          ...prev,
          currentSpace: prev.currentSpace ? {
            ...prev.currentSpace,
            members: [...prev.currentSpace.members, state.currentUser!],
            pendingInvites: prev.currentSpace.pendingInvites?.filter(inv => inv.code !== code) || [],
          } : null,
        }));
        
        addNotification({
          type: 'joined',
          title: 'Space beigetreten',
          message: `Du bist dem Space "${state.currentSpace.name}" beigetreten!`,
        });
        
        return true;
      }
    }
    
    addNotification({
      type: 'error',
      title: 'Code ungültig',
      message: 'Dieser Code ist nicht gültig, abgelaufen oder nicht für deine E-Mail-Adresse bestimmt.',
    });
    
    return false;
  }, [state.currentUser, state.currentSpace, addNotification]);

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
    if (!state.currentUser) return;
    
    const detected = detectCategory(title);
    const finalCategoryName = categoryName || detected.categoryName;
    const finalRoomId = roomId || detected.roomId;
    const icon = detected.icon;
    
    // Find or create category
    let category = state.categories.find(c => c.name === finalCategoryName);
    if (!category) {
      category = {
        id: Date.now().toString(),
        name: finalCategoryName,
        roomId: finalRoomId,
        itemCount: 0,
        icon,
      };
      setState(prev => ({
        ...prev,
        categories: [...prev.categories, category!],
      }));
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
    
    setState(prev => ({
      ...prev,
      items: [...prev.items, item],
      categories: prev.categories.map(c => 
        c.id === category!.id 
          ? { ...c, itemCount: c.itemCount + 1 }
          : c
      ),
    }));
    
    // Proposals will be handled by real backend in production
    // For now, items are added directly without proposal system
    
    return item;
  }, [state.currentUser, state.categories]);

  const respondToProposal = useCallback((proposalId: string, response: 'accepted' | 'rejected' | 'later') => {
    setState(prev => {
      const proposal = prev.proposals.find(p => p.id === proposalId);
      if (!proposal) return prev;
      
      const updatedProposals = prev.proposals.map(p => 
        p.id === proposalId 
          ? { ...p, status: response, respondedAt: Date.now() }
          : p
      );
      
      const updatedItems = response === 'accepted' 
        ? prev.items.map(i => 
            i.id === proposal.itemId 
              ? { ...i, status: 'accepted' as const, updatedAt: Date.now() }
              : i
          )
        : response === 'rejected'
        ? prev.items.filter(i => i.id !== proposal.itemId)
        : prev.items;
      
      return {
        ...prev,
        proposals: updatedProposals,
        items: updatedItems,
      };
    });
    
    // Add response notification
    const responseText = response === 'accepted' ? 'angenommen' : response === 'rejected' ? 'abgelehnt' : 'verschoben';
    addNotification({
      type: 'response',
      title: 'Antwort erhalten',
      message: `Dein Vorschlag wurde ${responseText}`,
    });
  }, [addNotification]);

  const togglePriority = useCallback((itemId: string) => {
    setState(prev => {
      const priorityItems = prev.items.filter(i => i.isPriority);
      const item = prev.items.find(i => i.id === itemId);
      
      if (!item) return prev;
      
      if (item.isPriority) {
        // Remove from priority
        return {
          ...prev,
          items: prev.items.map(i => 
            i.id === itemId 
              ? { ...i, isPriority: false, priorityLevel: undefined }
              : i.priorityLevel && i.priorityLevel > (item.priorityLevel || 0)
              ? { ...i, priorityLevel: i.priorityLevel - 1 }
              : i
          ),
        };
      } else if (priorityItems.length < 5) {
        // Add to priority
        return {
          ...prev,
          items: prev.items.map(i => 
            i.id === itemId 
              ? { ...i, isPriority: true, priorityLevel: priorityItems.length + 1 }
              : i
          ),
        };
      }
      
      return prev;
    });
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(i => 
        i.id === itemId 
          ? { ...i, isFavorite: !i.isFavorite }
          : i
      ),
    }));
  }, []);

  const updateRoomBudget = useCallback((roomId: string, budget: number) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => 
        r.id === roomId 
          ? { ...r, budget }
          : r
      ),
    }));
  }, []);



  const markNotificationRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
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
    const room: Room = {
      id: Date.now().toString(),
      name,
      icon,
      color,
      budget: 0,
      spent: 0,
    };
    
    setState(prev => ({
      ...prev,
      rooms: [...prev.rooms, room],
    }));
    
    return room;
  }, []);

  // Clean up expired invites
  const cleanupExpiredInvites = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSpace: prev.currentSpace ? {
        ...prev.currentSpace,
        pendingInvites: prev.currentSpace.pendingInvites?.filter(invite => 
          Date.now() < invite.expiry
        ) || [],
      } : null,
    }));
  }, []);

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
    const isAlreadyMember = state.currentSpace.members.some(m => m.email.toLowerCase() === email.toLowerCase());
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
          ...(prev.currentSpace.pendingInvites || []),
          {
            email,
            code: inviteCode,
            expiry,
            invitedBy: state.currentUser!.id,
          }
        ],
      } : null,
    }));
    
    addNotification({
      type: 'info',
      title: 'Einladung erstellt',
      message: `Einladungscode für ${email}: ${inviteCode}\nGültig für 5 Minuten. Teile diesen Code mit der Person.`,
    });
    
    return true;
  }, [state.currentSpace, state.currentUser, addNotification]);

  // Computed values
  const priorityItems = useMemo(() => 
    state.items
      .filter(i => i.isPriority && i.status === 'accepted')
      .sort((a, b) => (a.priorityLevel || 0) - (b.priorityLevel || 0)),
    [state.items]
  );

  const pendingProposals = useMemo(() => 
    state.proposals.filter(p => p.status === 'pending'),
    [state.proposals]
  );

  const acceptedItems = useMemo(() => 
    state.items.filter(i => i.status === 'accepted'),
    [state.items]
  );

  const favoriteItems = useMemo(() => 
    state.items.filter(i => i.isFavorite),
    [state.items]
  );

  const unreadNotifications = useMemo(() => 
    state.notifications.filter(n => !n.read).length,
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
    signIn,
    signOut,
    createSpace,
    generateInviteCode,
    joinSpace,
    addItem,
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
  };
});