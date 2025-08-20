import React, { useState, useEffect } from 'react';
import { socket } from '../utils/socket';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

const RealtimeStatusIndicator = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      setConnectionError(error.message || 'Connection failed');
      setIsConnected(false);
    };

    const handleReconnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect', handleReconnect);
    };
  }, []);

  const getStatusColor = () => {
    if (connectionError) return 'text-red-500';
    return isConnected ? 'text-green-500' : 'text-yellow-500';
  };

  const getStatusText = () => {
    if (connectionError) return 'Connection Error';
    return isConnected ? 'Real-time Connected' : 'Connecting...';
  };

  const getIcon = () => {
    if (connectionError) return <AlertCircle size={16} />;
    return isConnected ? <Wifi size={16} /> : <WifiOff size={16} />;
  };

  return (
    <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
      {getIcon()}
      <span className="text-sm font-medium">{getStatusText()}</span>
      {isConnected && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default RealtimeStatusIndicator;