import { io, Socket } from 'socket.io-client';
import { WS_CONFIG, WSS_URL } from '@/constants/config';

interface RoomPresence {
  count: number;
  users: {
    id: string;
    name: string;
    joinedAt: number;
  }[];
}

interface RealtimeEvents {
  'room:join': (data: { spaceId: string; sessionId: string; user: { id: string; name: string } }) => void;
  'room:leave': (data: { spaceId: string; sessionId: string }) => void;
  'presence:update': (data: { spaceId: string; presence: RoomPresence }) => void;
  'presence:ping': () => void;
  'state:patch': (data: { spaceId: string; patch: any }) => void;
  'state:broadcast': (data: { spaceId: string; state: any }) => void;
  'connect': () => void;
  'disconnect': () => void;
  'error': (error: any) => void;
}

type EventCallback<T extends keyof RealtimeEvents> = RealtimeEvents[T];

class RealtimeService {
  private socket: Socket | null = null;
  private currentSpaceId: string | null = null;
  private sessionId: string | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.generateSessionId();
  }

  private generateSessionId() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      if (this.isConnecting) {
        resolve(false);
        return;
      }

      this.isConnecting = true;
      console.log('[REALTIME] Connecting to WebSocket server...');

      try {
        this.socket = io(WSS_URL, {
          transports: ['websocket'],
          timeout: 5000,
          reconnection: true,
          reconnectionAttempts: WS_CONFIG.MAX_RECONNECTION_ATTEMPTS,
          reconnectionDelay: WS_CONFIG.RECONNECTION_DELAY,
          reconnectionDelayMax: WS_CONFIG.RECONNECTION_DELAY_MAX,
          path: '/realtime',
        });

        this.socket.on('connect', () => {
          console.log('[REALTIME] Connected to WebSocket server');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connect');
          resolve(true);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('[REALTIME] Disconnected from WebSocket server:', reason);
          this.stopHeartbeat();
          this.emit('disconnect');
        });

        this.socket.on('connect_error', (error) => {
          console.error('[REALTIME] Connection error:', error);
          this.isConnecting = false;
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[REALTIME] Max reconnection attempts reached');
            this.emit('error', error);
          }
          resolve(false);
        });

        // Set up event listeners
        this.socket.on('presence:update', (data) => {
          console.log('[REALTIME] Presence update:', data);
          this.emit('presence:update', data);
        });

        this.socket.on('state:patch', (data) => {
          console.log('[REALTIME] State patch received:', data);
          this.emit('state:patch', data);
        });

        this.socket.on('state:broadcast', (data) => {
          console.log('[REALTIME] State broadcast received:', data);
          this.emit('state:broadcast', data);
        });

      } catch (error) {
        console.error('[REALTIME] Failed to create socket connection:', error);
        this.isConnecting = false;
        this.emit('error', error);
        resolve(false);
      }
    });
  }

  disconnect() {
    console.log('[REALTIME] Disconnecting from WebSocket server...');
    
    if (this.currentSpaceId && this.sessionId) {
      this.leaveRoom(this.currentSpaceId);
    }
    
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.currentSpaceId = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  joinRoom(spaceId: string, user: { id: string; name: string }): boolean {
    if (!this.socket?.connected || !this.sessionId) {
      console.warn('[REALTIME] Cannot join room - not connected or no session ID');
      return false;
    }

    console.log('[REALTIME] Joining room:', { spaceId, sessionId: this.sessionId, user });
    
    // Leave current room if different
    if (this.currentSpaceId && this.currentSpaceId !== spaceId) {
      this.leaveRoom(this.currentSpaceId);
    }

    this.currentSpaceId = spaceId;
    
    this.socket.emit('room:join', {
      spaceId,
      sessionId: this.sessionId,
      user
    });

    return true;
  }

  leaveRoom(spaceId: string): boolean {
    if (!this.socket?.connected || !this.sessionId) {
      return false;
    }

    console.log('[REALTIME] Leaving room:', { spaceId, sessionId: this.sessionId });
    
    this.socket.emit('room:leave', {
      spaceId,
      sessionId: this.sessionId
    });

    if (this.currentSpaceId === spaceId) {
      this.currentSpaceId = null;
    }

    return true;
  }

  broadcastStateChange(spaceId: string, state: any) {
    if (!this.socket?.connected) {
      console.warn('[REALTIME] Cannot broadcast state - not connected');
      return;
    }

    console.log('[REALTIME] Broadcasting state change:', { spaceId, state });
    
    this.socket.emit('state:broadcast', {
      spaceId,
      state,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  sendStatePatch(spaceId: string, patch: any) {
    if (!this.socket?.connected) {
      console.warn('[REALTIME] Cannot send patch - not connected');
      return;
    }

    console.log('[REALTIME] Sending state patch:', { spaceId, patch });
    
    this.socket.emit('state:patch', {
      op: 'patch',
      payload: patch,
      spaceId,
      sessionId: this.sessionId,
      updatedAt: new Date().toISOString(),
      actorId: this.sessionId,
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        console.log('[REALTIME] Sending heartbeat ping');
        this.socket.emit('presence:ping');
      }
    }, WS_CONFIG.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Event system
  on<T extends keyof RealtimeEvents>(event: T, callback: EventCallback<T>) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off<T extends keyof RealtimeEvents>(event: T, callback: EventCallback<T>) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit<T extends keyof RealtimeEvents>(event: T, ...args: Parameters<EventCallback<T>>) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          (callback as any)(...args);
        } catch (error) {
          console.error(`[REALTIME] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  get currentRoom(): string | null {
    return this.currentSpaceId;
  }

  get session(): string | null {
    return this.sessionId;
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();
export default realtimeService;

// Types for external use
export type { RoomPresence, RealtimeEvents };