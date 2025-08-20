import React from 'react';
import { socket } from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RealtimeTestPanel = () => {
  const { cafe } = useAuth();

  const testNotifications = () => {
    if (!cafe?._id) {
      toast.error('No cafe connected');
      return;
    }

    // Test different types of notifications
    const tests = [
      {
        event: 'systemNotification',
        data: {
          type: 'success',
          title: 'Test Success',
          message: 'This is a test success notification'
        }
      },
      {
        event: 'systemNotification',
        data: {
          type: 'info',
          title: 'Test Info',
          message: 'This is a test info notification'
        }
      },
      {
        event: 'systemNotification',
        data: {
          type: 'warning',
          title: 'Test Warning',
          message: 'This is a test warning notification'
        }
      },
      {
        event: 'systemNotification',
        data: {
          type: 'error',
          title: 'Test Error',
          message: 'This is a test error notification'
        }
      }
    ];

    tests.forEach((test, index) => {
      setTimeout(() => {
        socket.emit('testNotification', {
          cafeId: cafe._id,
          ...test
        });
      }, index * 1000);
    });
  };

  const testMenuEvents = () => {
    if (!cafe?._id) {
      toast.error('No cafe connected');
      return;
    }

    // Simulate menu events
    setTimeout(() => {
      socket.emit('testMenuCreated', {
        cafeId: cafe._id,
        data: { name: 'Test Pizza', _id: 'test123' }
      });
    }, 500);

    setTimeout(() => {
      socket.emit('testMenuUpdated', {
        cafeId: cafe._id,
        data: { name: 'Updated Test Pizza', _id: 'test123' }
      });
    }, 1500);

    setTimeout(() => {
      socket.emit('testMenuDeleted', {
        cafeId: cafe._id,
        data: 'test123'
      });
    }, 2500);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Real-time Test Panel</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test the real-time notification system with sample events.
      </p>
      
      <div className="space-y-3">
        <button
          onClick={testNotifications}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Test System Notifications
        </button>
        
        <button
          onClick={testMenuEvents}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Test Menu Events
        </button>
        
        <div className="text-xs text-gray-500 mt-4">
          <p>Connection Status: {socket.connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
          <p>Cafe ID: {cafe?._id || 'Not available'}</p>
        </div>
      </div>
    </div>
  );
};

export default RealtimeTestPanel;