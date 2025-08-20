import React, { useState, useEffect } from 'react';
import { socket } from '../utils/socket';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Listen for all real-time events and create notifications
    const handleMenuCreated = (data) => {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Menu Item Created',
        message: `"${data.name}" has been added to the menu`,
        timestamp: new Date(),
      });
    };

    const handleMenuUpdated = (data) => {
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Menu Item Updated',
        message: `"${data.name}" has been updated`,
        timestamp: new Date(),
      });
    };

    const handleMenuDeleted = () => {
      addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Menu Item Deleted',
        message: 'A menu item has been removed',
        timestamp: new Date(),
      });
    };

    const handleCategoryCreated = (data) => {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Category Created',
        message: `Category "${data.name}" has been created`,
        timestamp: new Date(),
      });
    };

    const handleNewOrder = (data) => {
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'New Order Received',
        message: `Order for Table ${data.tableNumber} - ₹${data.totalPrice}`,
        timestamp: new Date(),
        priority: 'high',
      });
    };

    const handleOrderStatusUpdated = (data) => {
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Order Status Updated',
        message: `Order #${data._id.slice(-6)} is now ${data.status}`,
        timestamp: new Date(),
      });
    };

    const handleTableCreated = (data) => {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Table Created',
        message: `Table ${data.tableNumber} has been added`,
        timestamp: new Date(),
      });
    };

    const handleError = (error) => {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Error Occurred',
        message: error.message,
        timestamp: new Date(),
        priority: 'high',
      });
    };

    // Register all event listeners
    socket.on('menuCreated', handleMenuCreated);
    socket.on('menuUpdated', handleMenuUpdated);
    socket.on('menuDeleted', handleMenuDeleted);
    socket.on('category:created', handleCategoryCreated);
    socket.on('newOrder', handleNewOrder);
    socket.on('orderStatusUpdated', handleOrderStatusUpdated);
    socket.on('tableCreated', handleTableCreated);
    socket.on('menuError', handleError);
    socket.on('category:error', handleError);
    socket.on('tableError', handleError);
    socket.on('orderError', handleError);

    return () => {
      socket.off('menuCreated', handleMenuCreated);
      socket.off('menuUpdated', handleMenuUpdated);
      socket.off('menuDeleted', handleMenuDeleted);
      socket.off('category:created', handleCategoryCreated);
      socket.off('newOrder', handleNewOrder);
      socket.off('orderStatusUpdated', handleOrderStatusUpdated);
      socket.off('tableCreated', handleTableCreated);
      socket.off('menuError', handleError);
      socket.off('category:error', handleError);
      socket.off('tableError', handleError);
      socket.off('orderError', handleError);
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);
    
    // Auto-remove after 30 seconds for non-error notifications
    if (notification.type !== 'error') {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 30000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllAsRead();
        }}
        className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 ${
                      notification.priority === 'high' ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;