import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";

// Health check handler
const healthHandler = (c: any) => {
  c.header("Cache-Control", "no-store");
  c.header("Content-Type", "application/json; charset=utf-8");
  return c.json({ status: "ok" });
};

// API app (will be mounted at /api)
const apiApp = new Hono();

// Root app (handles both /healthz and /api routes)
const app = new Hono();

// Socket.IO server setup
const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  path: "/realtime",
  transports: ["websocket"],
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory storage for presence
interface ClientPresence {
  socketId: string;
  spaceId?: string;
  sessionId?: string;
  lastSeen: number;
}

const clients = new Map<string, ClientPresence>();
const rooms = new Map<string, Set<string>>();

// Presence timeout check (45 seconds)
setInterval(() => {
  const now = Date.now();
  const timeout = 45000; // 45 seconds
  
  clients.forEach((client, socketId) => {
    if (now - client.lastSeen > timeout) {
      // Client timed out
      if (client.spaceId && client.sessionId) {
        const roomKey = `${client.spaceId}:${client.sessionId}`;
        const roomClients = rooms.get(roomKey);
        if (roomClients) {
          roomClients.delete(socketId);
          // Send presence update to remaining clients in room
          io.to(roomKey).emit("presence:update", {
            count: roomClients.size,
            users: Array.from(roomClients).map(id => ({ id }))
          });
        }
      }
      clients.delete(socketId);
    }
  });
}, 10000); // Check every 10 seconds

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  // Initialize client presence
  clients.set(socket.id, {
    socketId: socket.id,
    lastSeen: Date.now()
  });
  
  // Send connection confirmation
  socket.emit("connect", {
    ok: true,
    ts: new Date().toISOString()
  });
  
  socket.on("room:join", ({ spaceId, sessionId }) => {
    const roomKey = `${spaceId}:${sessionId}`;
    
    // Update client presence
    const client = clients.get(socket.id);
    if (client) {
      client.spaceId = spaceId;
      client.sessionId = sessionId;
      client.lastSeen = Date.now();
    }
    
    // Join socket room
    socket.join(roomKey);
    
    // Add to room tracking
    if (!rooms.has(roomKey)) {
      rooms.set(roomKey, new Set());
    }
    rooms.get(roomKey)!.add(socket.id);
    
    // Send presence update to all clients in room
    const roomClients = rooms.get(roomKey)!;
    io.to(roomKey).emit("presence:update", {
      count: roomClients.size,
      users: Array.from(roomClients).map(id => ({ id }))
    });
    
    console.log(`Client ${socket.id} joined room ${roomKey}`);
  });
  
  socket.on("room:leave", ({ spaceId, sessionId }) => {
    const roomKey = `${spaceId}:${sessionId}`;
    
    // Leave socket room
    socket.leave(roomKey);
    
    // Remove from room tracking
    const roomClients = rooms.get(roomKey);
    if (roomClients) {
      roomClients.delete(socket.id);
      
      // Send presence update to remaining clients
      io.to(roomKey).emit("presence:update", {
        count: roomClients.size,
        users: Array.from(roomClients).map(id => ({ id }))
      });
    }
    
    // Update client presence
    const client = clients.get(socket.id);
    if (client) {
      client.spaceId = undefined;
      client.sessionId = undefined;
    }
    
    console.log(`Client ${socket.id} left room ${roomKey}`);
  });
  
  socket.on("presence:ping", () => {
    // Update last seen timestamp
    const client = clients.get(socket.id);
    if (client) {
      client.lastSeen = Date.now();
    }
  });
  
  socket.on("state:patch", (data) => {
    // Broadcast state patch to all clients in the same room
    const client = clients.get(socket.id);
    if (client && client.spaceId && client.sessionId) {
      const roomKey = `${client.spaceId}:${client.sessionId}`;
      io.to(roomKey).emit("state:broadcast", data);
    }
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    
    // Clean up client from rooms
    const client = clients.get(socket.id);
    if (client && client.spaceId && client.sessionId) {
      const roomKey = `${client.spaceId}:${client.sessionId}`;
      const roomClients = rooms.get(roomKey);
      if (roomClients) {
        roomClients.delete(socket.id);
        
        // Send presence update to remaining clients
        io.to(roomKey).emit("presence:update", {
          count: roomClients.size,
          users: Array.from(roomClients).map(id => ({ id }))
        });
      }
    }
    
    // Remove client from presence tracking
    clients.delete(socket.id);
  });
});

// Start Socket.IO server on port 3001
httpServer.listen(3001, () => {
  console.log("Socket.IO server running on port 3001");
});

// Enable CORS for API routes
apiApp.use("*", cors());

// Mount tRPC router at /trpc
apiApp.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Health check endpoint for API
apiApp.get("/healthz", healthHandler);

// Simple health check endpoint for API root
apiApp.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// Enable CORS for root app
app.use("*", cors());

// Ping endpoint
app.get("/__ping", (c) => {
  c.header("Cache-Control", "no-store");
  c.header("Content-Type", "text/plain; charset=utf-8");
  return c.text("pong");
});

// Root level health check (redundant route)
app.get("/healthz", healthHandler);

// Mount API app at /api
app.route("/api", apiApp);

// Internal self-test on startup
const testEndpoints = async () => {
  try {
    console.log('🔍 Testing internal endpoints...');
    
    // Test /__ping
    const pingResponse = await fetch(`http://127.0.0.1:${PORT}/__ping`);
    console.log(`/__ping: ${pingResponse.status} - ${await pingResponse.text()}`);
    
    // Test /healthz
    const healthResponse = await fetch(`http://127.0.0.1:${PORT}/healthz`);
    console.log(`/healthz: ${healthResponse.status} - ${JSON.stringify(await healthResponse.json())}`);
    
    console.log('✅ Internal endpoint tests completed');
  } catch (error) {
    console.error('❌ Internal endpoint test failed:', error);
  }
};

// Test endpoints after a short delay to ensure server is ready
setTimeout(testEndpoints, 2000);

// External test endpoint
const testExternalEndpoints = async () => {
  try {
    console.log('🌐 Testing external endpoints...');
    
    // Test external /__ping
    const extPingResponse = await fetch('https://wohnideen-gemeinsam-einrichten.rork.app/__ping');
    console.log(`External /__ping: ${extPingResponse.status} - ${await extPingResponse.text()}`);
    
    // Test external /healthz
    const extHealthResponse = await fetch('https://wohnideen-gemeinsam-einrichten.rork.app/healthz');
    console.log(`External /healthz: ${extHealthResponse.status} - ${JSON.stringify(await extHealthResponse.json())}`);
    
    // Test external /debug/routes
    const extDebugResponse = await fetch('https://wohnideen-gemeinsam-einrichten.rork.app/debug/routes');
    console.log(`External /debug/routes: ${extDebugResponse.status} - ${JSON.stringify(await extDebugResponse.json())}`);
    
    console.log('✅ External endpoint tests completed');
  } catch (error) {
    console.error('❌ External endpoint test failed:', error);
  }
};

// Test external endpoints after internal tests
setTimeout(testExternalEndpoints, 5000);

// Log final URLs after tests
setTimeout(() => {
  console.log('\n🎯 FINAL PUBLIC ENDPOINTS SUMMARY:');
  console.log('📍 Ping: https://wohnideen-gemeinsam-einrichten.rork.app/__ping');
  console.log('🏥 Health: https://wohnideen-gemeinsam-einrichten.rork.app/healthz');
  console.log('🔍 Debug: https://wohnideen-gemeinsam-einrichten.rork.app/debug/routes');
  console.log('📡 WebSocket: wss://wohnideen-gemeinsam-einrichten.rork.app/realtime');
  console.log('\n✅ Backend deployment completed!');
}, 6000);

// Debug endpoint to show all registered routes
app.get('/debug/routes', (c) => {
  c.header("Cache-Control", "no-store");
  c.header("Content-Type", "application/json; charset=utf-8");
  return c.json({
    message: 'Available routes on root app',
    rootRoutes: [
      'GET /__ping -> text/plain "pong"',
      'GET /healthz -> application/json {"status":"ok"}', 
      'GET /debug/routes -> this endpoint'
    ],
    apiRoutes: [
      'GET /api/healthz -> application/json {"status":"ok"}',
      'GET /api/ -> application/json API status',
      'POST /api/trpc/* -> tRPC endpoints'
    ],
    publicDomain: 'https://wohnideen-gemeinsam-einrichten.rork.app',
    timestamp: new Date().toISOString(),
    serverStatus: 'running'
  });
});

// Start the main HTTP server
const PORT = process.env.PORT || 3000;
console.log('🚀 Starting HTTP server...');

// The server will be started by the Rork platform
// Just export the app for the platform to handle

// Startup logging
console.log('🚀 Hono server starting on preview domain...');
console.log(`🌐 HTTP Server will listen on 0.0.0.0:${PORT}`);
console.log('📍 GET /__ping registered -> text/plain "pong"');
console.log('📍 GET /healthz registered -> application/json {"status":"ok"}');
console.log('📍 GET /debug/routes registered -> application/json route list');
console.log('📍 GET /api/healthz registered -> application/json {"status":"ok"}');
console.log('📍 GET /api/ registered -> application/json {"status":"ok","message":"API is running"}');
console.log('📍 POST /api/trpc/* registered -> tRPC endpoints');
console.log('🌐 Public domain: https://wohnideen-gemeinsam-einrichten.rork.app');
console.log('📡 Socket.IO server running on port 3001 (path: /realtime)');
console.log('\n🎯 EXPECTED PUBLIC ENDPOINTS:');
console.log('📍 Ping: https://wohnideen-gemeinsam-einrichten.rork.app/__ping');
console.log('🏥 Health: https://wohnideen-gemeinsam-einrichten.rork.app/healthz');
console.log('🔍 Debug: https://wohnideen-gemeinsam-einrichten.rork.app/debug/routes');
console.log('📡 WebSocket: wss://wohnideen-gemeinsam-einrichten.rork.app/realtime')

export default app;