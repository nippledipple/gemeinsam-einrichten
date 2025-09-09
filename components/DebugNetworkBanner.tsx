import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useApp } from '@/hooks/app-store';
import { pingOnce } from '@/utils/net/Pinger';
import { HEALTH_CHECK_URL } from '@/constants/config';

interface NetworkDebugInfo {
  pingResult: boolean | null;
  lastPingTime: string;
  netInfoConnected: boolean | null;
  netInfoReachable: boolean | null;
  connectionType: string;
  logs: string[];
}

export default function DebugNetworkBanner() {
  const { isOnline, lastSyncTime, isRealtimeConnected, currentSpacePresence } = useApp();
  const [debugInfo, setDebugInfo] = useState<NetworkDebugInfo>({
    pingResult: null,
    lastPingTime: '-',
    netInfoConnected: null,
    netInfoReachable: null,
    connectionType: 'unknown',
    logs: [],
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    console.log(`[DEBUG-NETWORK] ${logEntry}`);
    
    setDebugInfo(prev => ({
      ...prev,
      logs: [logEntry, ...prev.logs.slice(0, 2)] // Keep last 3 logs
    }));
  };

  // Monitor NetInfo changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      addLog(`NetInfo changed: connected=${state.isConnected}, reachable=${state.isInternetReachable}, type=${state.type}`);
      
      setDebugInfo(prev => ({
        ...prev,
        netInfoConnected: state.isConnected,
        netInfoReachable: state.isInternetReachable,
        connectionType: state.type || 'unknown',
      }));
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      addLog(`Initial NetInfo: connected=${state.isConnected}, reachable=${state.isInternetReachable}, type=${state.type}`);
      
      setDebugInfo(prev => ({
        ...prev,
        netInfoConnected: state.isConnected,
        netInfoReachable: state.isInternetReachable,
        connectionType: state.type || 'unknown',
      }));
    });

    return unsubscribe;
  }, []);

  // Perform ping test using centralized pinger
  useEffect(() => {
    const performPing = async () => {
      const result = await pingOnce(3000);
      setDebugInfo(prev => ({
        ...prev,
        pingResult: result,
        lastPingTime: new Date().toISOString(),
      }));
      addLog(`Ping result: ${result ? 'SUCCESS' : 'FAILED'}`);
    };

    performPing(); // Initial ping
    const interval = setInterval(performPing, 5000); // Match stabilizer interval
    return () => clearInterval(interval);
  }, []);

  // Log app online status changes
  useEffect(() => {
    addLog(`App online status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
  }, [isOnline]);

  const formatTime = (timestamp: string) => {
    if (timestamp === '-') return '-';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = () => {
    if (debugInfo.pingResult === true && isOnline) return '#4CAF50'; // Green
    if (debugInfo.pingResult === false || !isOnline) return '#F44336'; // Red
    return '#FF9800'; // Orange for unknown
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.title}>🔍 Network Debug</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Ping:</Text>
        <Text style={styles.value}>{String(debugInfo.pingResult)}</Text>
        
        <Text style={styles.label}>NetInfo:</Text>
        <Text style={styles.value}>
          {debugInfo.netInfoConnected}/{debugInfo.netInfoReachable}
        </Text>
        
        <Text style={styles.label}>Online:</Text>
        <Text style={styles.value}>{isOnline ? 'true' : 'false'} (stable)</Text>
        
        <Text style={styles.label}>WS:</Text>
        <Text style={styles.value}>{isRealtimeConnected ? 'connected' : 'disconnected'}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{debugInfo.connectionType}</Text>
        
        <Text style={styles.label}>Last Ping:</Text>
        <Text style={styles.value}>{formatTime(debugInfo.lastPingTime)}</Text>
        
        <Text style={styles.label}>Last Sync:</Text>
        <Text style={styles.value}>
          {lastSyncTime ? formatTime(new Date(lastSyncTime).toISOString()) : 'Never'}
        </Text>
        
        <Text style={styles.label}>Participants:</Text>
        <Text style={styles.value}>{currentSpacePresence?.count || 0}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Health URL:</Text>
        <Text style={styles.value} numberOfLines={1}>{HEALTH_CHECK_URL}</Text>
      </View>
      
      {debugInfo.logs.length > 0 && (
        <View style={styles.logsContainer}>
          <Text style={styles.logsTitle}>Recent Logs:</Text>
          {debugInfo.logs.slice(0, 2).map((log, index) => (
            <Text key={`log-${index}-${log.substring(0, 10)}`} style={styles.logEntry} numberOfLines={1}>
              {log}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginRight: 4,
  },
  value: {
    color: '#fff',
    fontSize: 10,
    marginRight: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  logsContainer: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  logsTitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  logEntry: {
    color: '#fff',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    opacity: 0.9,
  },
});