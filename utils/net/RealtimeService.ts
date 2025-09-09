import { WS_CONFIG, WSS_URL } from '@/constants/config';

// TODO: In production, switch back to Socket.IO with proper backend:
// - Replace native WebSocket with socket.io-client
// - Use WSS_URL = 'wss://api.rork.com/realtime'
// - Implement proper room management and presence tracking

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
  private socket: WebSocket | null = null;
  private currentSpaceId: string | null = null;
  private sessionId: string | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private demoParticipantCount = 1; // Demo counter

  constructor() {
    this.generateSessionId();
  }

  private generateSessionId() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve(true);
        return;
      }

      if (this.isConnecting) {
        resolve(false);
        return;
      }

      this.isConnecting = true;
      console.log('[REALTIME] Connecting to demo WebSocket server...');

      try {
        this.socket = new WebSocket(WSS_URL);

        this.socket.onopen = () => {
          console.log('[REALTIME] Connected to demo WebSocket server');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connect');
          resolve(true);
        };

        this.socket.onclose = (event) => {
          console.log('[REALTIME] Disconnected from demo WebSocket server:', event.reason);
          this.stopHeartbeat();
          this.emit('disconnect');
          
          // Auto-reconnect logic
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              this.connect();
            }, WS_CONFIG.RECONNECTION_DELAY * Math.pow(2, this.reconnectAttempts));
          }
        };

        this.socket.onerror = (error) => {
          console.error('[REALTIME] WebSocket error:', error);
          this.isConnecting = false;
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[REALTIME] Max reconnection attempts reached');
            this.emit('error', error);
          }
          resolve(false);
        };

        this.socket.onmessage = (event) => {
          try {
            // Echo server just returns what we send, treat as pong
            console.log('[REALTIME] Demo message received:', event.data);
            
            // Simulate presence update for demo
            if (event.data.includes('ping')) {
              this.emit('presence:update', {
                spaceId: this.currentSpaceId || 'demo',
                presence: {
                  count: this.demoParticipantCount,
                  users: [{
                    id: this.sessionId || 'demo-user',
                    name: 'Demo User',
                    joinedAt: Date.now()
                  }]
                }
              });
            }
          } catch (error) {
            console.error('[REALTIME] Error parsing message:', error);
          }
        };

      } catch (error) {
        console.error('[REALTIME] Failed to create WebSocket connection:', error);
        this.isConnecting = false;
        this.emit('error', error);
        resolve(false);
      }
    });
  }

  disconnect() {
    console.log('[REALTIME] Disconnecting from demo WebSocket server...');
    
    if (this.currentSpaceId && this.sessionId) {
      this.leaveRoom(this.currentSpaceId);
    }
    
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.currentSpaceId = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  joinRoom(spaceId: string, user: { id: string; name: string }): boolean {
    if (this.socket?.readyState !== WebSocket.OPEN || !this.sessionId) {
      console.warn('[REALTIME] Cannot join room - not connected or no session ID');
      return false;
    }

    console.log('[REALTIME] Joining demo room:', { spaceId, sessionId: this.sessionId, user });
    
    // Leave current room if different
    if (this.currentSpaceId && this.currentSpaceId !== spaceId) {
      this.leaveRoom(this.currentSpaceId);
    }

    this.currentSpaceId = spaceId;
    this.demoParticipantCount = Math.floor(Math.random() * 5) + 1; // Demo: 1-5 participants
    
    // Send demo join message
    const joinMessage = JSON.stringify({
      type: 'room:join',
      spaceId,
      sessionId: this.sessionId,
      user
    });
    
    this.socket.send(joinMessage);

    // Simulate presence update
    setTimeout(() => {
      this.emit('presence:update', {
        spaceId,
        presence: {
          count: this.demoParticipantCount,
          users: [{
            id: user.id,
            name: user.name,
            joinedAt: Date.now()
          }]
        }
      });
    }, 100);

    return true;
  }

  leaveRoom(spaceId: string): boolean {
    if (this.socket?.readyState !== WebSocket.OPEN || !this.sessionId) {
      return false;
    }

    console.log('[REALTIME] Leaving demo room:', { spaceId, sessionId: this.sessionId });
    
    const leaveMessage = JSON.stringify({
      type: 'room:leave',
      spaceId,
      sessionId: this.sessionId
    });
    
    this.socket.send(leaveMessage);

    if (this.currentSpaceId === spaceId) {
      this.currentSpaceId = null;
      this.demoParticipantCount = 0;
    }

    return true;
  }

  broadcastStateChange(spaceId: string, state: any) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn('[REALTIME] Cannot broadcast state - not connected');
      return;
    }

    console.log('[REALTIME] Broadcasting demo state change:', { spaceId, state });
    
    const broadcastMessage = JSON.stringify({
      type: 'state:broadcast',
      spaceId,
      state,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
    
    this.socket.send(broadcastMessage);
    
    // Echo back to simulate server broadcast
    setTimeout(() => {
      this.emit('state:broadcast', {
        spaceId,
        state
      });
    }, 50);
  }

  sendStatePatch(spaceId: string, patch: any) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn('[REALTIME] Cannot send patch - not connected');
      return;
    }

    console.log('[REALTIME] Sending demo state patch:', { spaceId, patch });
    
    const patchMessage = JSON.stringify({
      type: 'state:patch',
      op: 'patch',
      payload: patch,
      spaceId,
      sessionId: this.sessionId,
      updatedAt: new Date().toISOString(),
      actorId: this.sessionId,
    });
    
    this.socket.send(patchMessage);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        console.log('[REALTIME] Sending demo heartbeat ping');
        this.socket.send('ping');
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
    return this.socket?.readyState === WebSocket.OPEN;
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