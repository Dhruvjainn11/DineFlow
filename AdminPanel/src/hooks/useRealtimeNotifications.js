import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { socket } from '../utils/socket';
import { useAuth } from '../context/AuthContext';

export const useRealtimeNotifications = () => {
  const { cafe } = useAuth();

  useEffect(() => {
    if (!cafe?._id) {
      console.log('No cafe ID available for real-time notifications');
      return;
    }
    
    console.log('Setting up real-time notifications for cafe:', cafe._id);

    // Join cafe room for real-time updates
    socket.emit('joinCafeRoom', cafe._id);

    // Menu Operations
    socket.on('menuCreated', (data) => {
      console.log('Received menuCreated event:', data);
      toast.success(`✅ Menu item "${data.name}" created successfully!`);
    });

    socket.on('menuUpdated', (data) => {
      console.log('Received menuUpdated event:', data);
      toast.info(`📝 Menu item "${data.name}" updated!`);
    });

    socket.on('menuDeleted', (data) => {
      console.log('Received menuDeleted event:', data);
      toast.warning(`🗑️ Menu item deleted!`);
    });

    socket.on('menuError', (error) => {
      console.log('Received menuError event:', error);
      toast.error(`❌ Menu Error: ${error.message}`);
    });

    // Category Operations
    socket.on('category:created', (data) => {
      console.log('Received category:created event:', data);
      toast.success(`✅ Category "${data.name}" created successfully!`);
    });

    socket.on('category:updated', (data) => {
      console.log('Received category:updated event:', data);
      toast.info(`📝 Category "${data.name}" updated!`);
    });

    socket.on('category:deleted', (data) => {
      console.log('Received category:deleted event:', data);
      toast.warning(`🗑️ Category deleted!`);
    });

    socket.on('category:error', (error) => {
      console.log('Received category:error event:', error);
      toast.error(`❌ Category Error: ${error.message}`);
    });

    // Table Operations
    socket.on('tableCreated', (data) => {
      toast.success(`✅ Table ${data.tableNumber} created successfully!`);
    });

    socket.on('tableUpdated', (data) => {
      toast.info(`📝 Table ${data.tableNumber} updated!`);
    });

    socket.on('tableDeleted', (data) => {
      toast.warning(`🗑️ Table deleted!`);
    });

    socket.on('tableError', (error) => {
      toast.error(`❌ Table Error: ${error.message}`);
    });

    // Order Operations
    socket.on('newOrder', (data) => {
      toast.success(`🛍️ New order received for Table ${data.tableNumber}!`, {
        autoClose: 5000,
      });
    });

    socket.on('orderStatusUpdated', (data) => {
      toast.info(`📋 Order #${data._id.slice(-6)} status: ${data.status}`);
    });

    socket.on('orderCompleted', (data) => {
      toast.success(`✅ Order #${data._id.slice(-6)} completed!`);
    });

    socket.on('orderError', (error) => {
      toast.error(`❌ Order Error: ${error.message}`);
    });

    // Payment Operations
    socket.on('paymentRequestedBulk', (data) => {
      toast.info(`💳 Payment requested for Table ${data.tableId}`);
    });

    socket.on('paymentCompletedBulk', (data) => {
      toast.success(`✅ Payment completed for table!`);
    });

    socket.on('paymentError', (error) => {
      toast.error(`❌ Payment Error: ${error.message}`);
    });

    // General System Notifications
    socket.on('systemNotification', (data) => {
      const { type, message, title } = data;
      switch (type) {
        case 'success':
          toast.success(`✅ ${title}: ${message}`);
          break;
        case 'info':
          toast.info(`ℹ️ ${title}: ${message}`);
          break;
        case 'warning':
          toast.warning(`⚠️ ${title}: ${message}`);
          break;
        case 'error':
          toast.error(`❌ ${title}: ${message}`);
          break;
        default:
          toast(`📢 ${title}: ${message}`);
      }
    });

    // Connection status notifications
    socket.on('connect', () => {
      toast.success('🟢 Connected to real-time updates!', { autoClose: 2000 });
    });

    socket.on('disconnect', () => {
      toast.warning('🔴 Disconnected from real-time updates', { autoClose: 3000 });
    });

    socket.on('reconnect', () => {
      toast.success('🔄 Reconnected to real-time updates!', { autoClose: 2000 });
    });

    // Cleanup function
    return () => {
      socket.off('menuCreated');
      socket.off('menuUpdated');
      socket.off('menuDeleted');
      socket.off('menuError');
      socket.off('category:created');
      socket.off('category:updated');
      socket.off('category:deleted');
      socket.off('category:error');
      socket.off('tableCreated');
      socket.off('tableUpdated');
      socket.off('tableDeleted');
      socket.off('tableError');
      socket.off('newOrder');
      socket.off('orderStatusUpdated');
      socket.off('orderCompleted');
      socket.off('orderError');
      socket.off('paymentRequestedBulk');
      socket.off('paymentCompletedBulk');
      socket.off('paymentError');
      socket.off('systemNotification');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect');
      
      if (cafe?._id) {
        socket.emit('leaveCafeRoom', cafe._id);
      }
    };
  }, [cafe?._id]);
};