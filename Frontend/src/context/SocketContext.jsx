import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  // Don't throw error if context is not available, just return null
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [notifications, setNotifications] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser._id) {
      console.log('Initializing socket connection for user:', currentUser.username);
      try {
        // Check if socket already exists and is connected
        if (socketRef.current) {
          socketRef.current.close();
        }
        
        // Initialize socket connection
        const newSocket = io('http://localhost:3000');
        socketRef.current = newSocket;
        setSocket(newSocket);

        // Join with user ID
        newSocket.emit('join', currentUser._id);

        // Listen for online users
        newSocket.on('userOnline', (userId) => {
          setOnlineUsers(prev => new Set([...prev, userId]));
        });

        newSocket.on('userOffline', (userId) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        });

        // Listen for new message notifications
        newSocket.on('newMessageNotification', (data) => {
          setNotifications(prev => {
            const newNotifications = new Map(prev);
            const key = data.chatId;
            const existing = newNotifications.get(key) || { count: 0, senderName: data.senderName };
            newNotifications.set(key, {
              count: existing.count + 1,
              senderName: data.senderName,
              senderId: data.senderId
            });
            return newNotifications;
          });
        });

        // Listen for typing status
        newSocket.on('userTyping', (data) => {
          if (data.isTyping) {
            setTypingUsers(prev => new Set([...prev, data.userId]));
          } else {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }
        });

        // Cleanup on unmount
        return () => {
          if (newSocket) {
            newSocket.close();
          }
          setSocket(null);
          setOnlineUsers(new Set());
          setNotifications(new Map());
          setTypingUsers(new Set());
        };
      } catch (error) {
        console.error('Socket connection failed:', error);
      }
    }
    
    // Cleanup function for when user logs out
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setSocket(null);
      setOnlineUsers(new Set());
      setNotifications(new Map());
      setTypingUsers(new Set());
    };
  }, [isAuthenticated, currentUser]);

  const sendMessage = (messageData) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', messageData);
    }
  };

  const sendTypingStatus = (receiverId, isTyping) => {
    if (socketRef.current && currentUser) {
      socketRef.current.emit('typing', {
        senderId: currentUser._id,
        receiverId,
        isTyping
      });
    }
  };

  const clearNotifications = (chatId) => {
    setNotifications(prev => {
      const newNotifications = new Map(prev);
      newNotifications.delete(chatId);
      return newNotifications;
    });
  };

  const value = {
    socket: socketRef.current,
    onlineUsers,
    notifications,
    typingUsers,
    sendMessage,
    sendTypingStatus,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};