import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Send Message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, content, messageType, replyTo }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_BASE}/chat/send`,
        { receiverId, content, messageType, replyTo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Chat Messages
export const getChatMessages = createAsyncThunk(
  "chat/getChatMessages",
  async ({ friendId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${API_BASE}/chat/messages/${friendId}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { ...data, friendId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get All Conversations
export const getAllChats = createAsyncThunk(
  "chat/getAllChats",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Mark Messages as Read
export const markAsRead = createAsyncThunk(
  "chat/markAsRead",
  async (friendId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_BASE}/chat/read/${friendId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { ...data, friendId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete Message
export const deleteMessage = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(`${API_BASE}/chat/message/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { ...data, messageId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Unread Count
export const getUnreadCount = createAsyncThunk(
  "chat/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/chat/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    // Conversations list
    conversations: [],
    conversationsLoading: false,
    conversationsError: null,

    // Current chat
    currentChat: null,
    currentChatMessages: [],
    currentChatLoading: false,
    currentChatError: null,
    currentChatPagination: null,
    hasMoreMessages: true,

    // Send message
    sendLoading: false,
    sendError: null,

    // Unread count
    unreadCount: 0,
    unreadLoading: false,

    // UI state
    activeChat: null, // Currently active chat friend ID
    typing: {}, // typing indicators
    onlineUsers: [], // online status
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
      state.currentChatMessages = [];
      state.currentChatPagination = null;
      state.hasMoreMessages = true;
      state.activeChat = null;
    },
    addMessageToCurrentChat: (state, action) => {
      const message = action.payload;
      if (state.currentChatMessages) {
        // Check if message already exists to prevent duplicates
        const messageExists = state.currentChatMessages.some(msg => msg._id === message._id);
        if (!messageExists) {
          state.currentChatMessages.push(message);
        }
      }
    },
    updateMessageInCurrentChat: (state, action) => {
      const { messageId, updates } = action.payload;
      const messageIndex = state.currentChatMessages.findIndex(
        (msg) => msg._id === messageId
      );
      if (messageIndex !== -1) {
        state.currentChatMessages[messageIndex] = {
          ...state.currentChatMessages[messageIndex],
          ...updates,
        };
      }
    },
    removeMessageFromCurrentChat: (state, action) => {
      const messageId = action.payload;
      state.currentChatMessages = state.currentChatMessages.filter(
        (msg) => msg._id !== messageId
      );
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    setTypingStatus: (state, action) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        state.typing[userId] = true;
      } else {
        delete state.typing[userId];
      }
    },
    updateOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    // New reducer to update conversations when new messages arrive
    updateConversationsWithNewMessage: (state, action) => {
      const newMessage = action.payload;
      const senderId = newMessage.sender._id;
      
      // Find existing conversation with this sender
      const conversationIndex = state.conversations.findIndex(
        conv => conv.otherUser._id === senderId
      );
      
      if (conversationIndex !== -1) {
        // Update existing conversation
        const updatedConversation = {
          ...state.conversations[conversationIndex],
          lastMessage: newMessage,
          unreadCount: state.conversations[conversationIndex].unreadCount + 1
        };
        
        // Move conversation to top
        state.conversations.splice(conversationIndex, 1);
        state.conversations.unshift(updatedConversation);
      } else {
        // Create new conversation entry
        const newConversation = {
          otherUser: newMessage.sender,
          lastMessage: newMessage,
          unreadCount: 1
        };
        state.conversations.unshift(newConversation);
      }
      
      // Update overall unread count
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.sendLoading = true;
        state.sendError = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendLoading = false;
        const message = action.payload.data;
        
        // Add to current chat if it's the active conversation
        if (
          state.activeChat &&
          (message.sender._id === state.activeChat || 
           message.receiver._id === state.activeChat)
        ) {
          // Prevent duplicate messages
          const messageExists = state.currentChatMessages.some(msg => msg._id === message._id);
          if (!messageExists) {
            state.currentChatMessages.push(message);
          }
        }
        
        // Update conversations list
        const conversationIndex = state.conversations.findIndex(
          (conv) => conv.otherUser._id === message.receiver._id || 
                   conv.otherUser._id === message.sender._id
        );
        
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = message;
          // Move to top
          const updatedConversation = state.conversations[conversationIndex];
          state.conversations.splice(conversationIndex, 1);
          state.conversations.unshift(updatedConversation);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendLoading = false;
        state.sendError = action.payload;
      })

      // Get Chat Messages
      .addCase(getChatMessages.pending, (state) => {
        state.currentChatLoading = true;
        state.currentChatError = null;
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        state.currentChatLoading = false;
        const { messages, pagination, friendId } = action.payload;
        
        if (pagination.currentPage === 1) {
          state.currentChatMessages = messages;
        } else {
          // Prepend older messages
          state.currentChatMessages = [...messages, ...state.currentChatMessages];
        }
        
        state.currentChatPagination = pagination;
        state.hasMoreMessages = pagination.hasNextPage;
        state.activeChat = friendId;
      })
      .addCase(getChatMessages.rejected, (state, action) => {
        state.currentChatLoading = false;
        state.currentChatError = action.payload;
      })

      // Get All Chats
      .addCase(getAllChats.pending, (state) => {
        state.conversationsLoading = true;
        state.conversationsError = null;
      })
      .addCase(getAllChats.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload.chats;
        
        // Calculate total unread count
        state.unreadCount = action.payload.chats.reduce((total, conv) => 
          total + (conv.unreadCount || 0), 0
        );
      })
      .addCase(getAllChats.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.conversationsError = action.payload;
      })

      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { friendId, modifiedCount } = action.payload;
        
        // Update unread count for the conversation
        const conversationIndex = state.conversations.findIndex(
          (conv) => conv.otherUser._id === friendId
        );
        
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 0;
        }
        
        // Update overall unread count
        state.unreadCount = Math.max(0, state.unreadCount - modifiedCount);
        
        // Mark messages as read in current chat
        if (state.activeChat === friendId) {
          state.currentChatMessages = state.currentChatMessages.map((msg) =>
            msg.receiver._id === state.activeChat ? { ...msg, isRead: true } : msg
          );
        }
      })

      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { messageId } = action.payload;
        
        // Remove from current chat
        state.currentChatMessages = state.currentChatMessages.filter(
          (msg) => msg._id !== messageId
        );
      })

      // Get Unread Count
      .addCase(getUnreadCount.pending, (state) => {
        state.unreadLoading = true;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadLoading = false;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(getUnreadCount.rejected, (state) => {
        state.unreadLoading = false;
      });
  },
});

export const {
  setActiveChat,
  clearCurrentChat,
  addMessageToCurrentChat,
  updateMessageInCurrentChat,
  removeMessageFromCurrentChat,
  updateUnreadCount,
  setTypingStatus,
  updateOnlineUsers,
  updateConversationsWithNewMessage
} = chatSlice.actions;

export default chatSlice.reducer;