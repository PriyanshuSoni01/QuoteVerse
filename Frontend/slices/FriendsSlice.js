import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Send Friend Request
export const sendFriendRequest = createAsyncThunk(
  "friends/sendFriendRequest",
  async ({ receiverId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_BASE}/friends/request/send`,
        { receiverId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { ...data, receiverId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Incoming Friend Requests
export const getIncomingRequests = createAsyncThunk(
  "friends/getIncomingRequests",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/friends/requests/incoming`, {
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

// Get Outgoing Friend Requests
export const getOutgoingRequests = createAsyncThunk(
  "friends/getOutgoingRequests",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/friends/requests/outgoing`, {
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

// Accept Friend Request
export const acceptFriendRequest = createAsyncThunk(
  "friends/acceptFriendRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_BASE}/friends/request/${requestId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { ...data, requestId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Reject Friend Request
export const rejectFriendRequest = createAsyncThunk(
  "friends/rejectFriendRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_BASE}/friends/request/${requestId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { ...data, requestId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Friends List
export const getFriends = createAsyncThunk(
  "friends/getFriends",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/friends/list`, {
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

// Remove Friend
export const removeFriend = createAsyncThunk(
  "friends/removeFriend",
  async (friendId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(`${API_BASE}/friends/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { ...data, friendId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Search Users
export const searchUsers = createAsyncThunk(
  "friends/searchUsers",
  async (query, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${API_BASE}/friends/search?query=${encodeURIComponent(query)}`,
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

// Get Suggested Users
export const getSuggestedUsers = createAsyncThunk(
  "friends/getSuggestedUsers",
  async ({ limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${API_BASE}/user/suggested?limit=${limit}`,
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

const friendsSlice = createSlice({
  name: "friends",
  initialState: {
    // Friends list
    friends: [],
    friendsLoading: false,
    friendsError: null,
    friendsCount: 0,

    // Incoming requests
    incomingRequests: [],
    incomingLoading: false,
    incomingError: null,

    // Outgoing requests
    outgoingRequests: [],
    outgoingLoading: false,
    outgoingError: null,

    // Search
    searchResults: [],
    searchLoading: false,
    searchError: null,
    searchQuery: "",

    // Suggested users
    suggestedUsers: [],
    suggestedLoading: false,
    suggestedError: null,

    // Action states
    sendRequestLoading: {},
    acceptRejectLoading: {},
    removeLoading: {},
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = "";
      state.searchError = null;
    },
    updateSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    resetActionStates: (state) => {
      state.sendRequestLoading = {};
      state.acceptRejectLoading = {};
      state.removeLoading = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Friend Request (Follow User)
      .addCase(sendFriendRequest.pending, (state, action) => {
        const { receiverId } = action.meta.arg;
        state.sendRequestLoading[receiverId] = true;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        const { receiverId } = action.payload;
        state.sendRequestLoading[receiverId] = false;
        
        // Update search results to show now following
        state.searchResults = state.searchResults.map((user) =>
          user._id === receiverId
            ? { ...user, relationshipStatus: "friends" }
            : user
        );
        
        // Update suggested users to show now following
        state.suggestedUsers = state.suggestedUsers.map((user) =>
          user._id === receiverId
            ? { ...user, relationshipStatus: "friends" }
            : user
        );
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        const { receiverId } = action.meta.arg;
        state.sendRequestLoading[receiverId] = false;
      })

      // Get Incoming Requests
      .addCase(getIncomingRequests.pending, (state) => {
        state.incomingLoading = true;
        state.incomingError = null;
      })
      .addCase(getIncomingRequests.fulfilled, (state, action) => {
        state.incomingLoading = false;
        state.incomingRequests = action.payload.requests;
      })
      .addCase(getIncomingRequests.rejected, (state, action) => {
        state.incomingLoading = false;
        state.incomingError = action.payload;
      })

      // Get Outgoing Requests
      .addCase(getOutgoingRequests.pending, (state) => {
        state.outgoingLoading = true;
        state.outgoingError = null;
      })
      .addCase(getOutgoingRequests.fulfilled, (state, action) => {
        state.outgoingLoading = false;
        state.outgoingRequests = action.payload.requests;
      })
      .addCase(getOutgoingRequests.rejected, (state, action) => {
        state.outgoingLoading = false;
        state.outgoingError = action.payload;
      })

      // Accept Friend Request
      .addCase(acceptFriendRequest.pending, (state, action) => {
        const requestId = action.meta.arg;
        state.acceptRejectLoading[requestId] = true;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const { requestId, friendRequest } = action.payload;
        state.acceptRejectLoading[requestId] = false;
        
        // Remove from incoming requests
        state.incomingRequests = state.incomingRequests.filter(
          (req) => req._id !== requestId
        );
        
        // Add to friends list
        state.friends.push(friendRequest.sender);
        state.friendsCount += 1;
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        const requestId = action.meta.arg;
        state.acceptRejectLoading[requestId] = false;
      })

      // Reject Friend Request
      .addCase(rejectFriendRequest.pending, (state, action) => {
        const requestId = action.meta.arg;
        state.acceptRejectLoading[requestId] = true;
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        const { requestId } = action.payload;
        state.acceptRejectLoading[requestId] = false;
        
        // Remove from incoming requests
        state.incomingRequests = state.incomingRequests.filter(
          (req) => req._id !== requestId
        );
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        const requestId = action.meta.arg;
        state.acceptRejectLoading[requestId] = false;
      })

      // Get Friends
      .addCase(getFriends.pending, (state) => {
        state.friendsLoading = true;
        state.friendsError = null;
      })
      .addCase(getFriends.fulfilled, (state, action) => {
        state.friendsLoading = false;
        state.friends = action.payload.friends;
        state.friendsCount = action.payload.friendsCount;
      })
      .addCase(getFriends.rejected, (state, action) => {
        state.friendsLoading = false;
        state.friendsError = action.payload;
      })

      // Remove Friend
      .addCase(removeFriend.pending, (state, action) => {
        const friendId = action.meta.arg;
        state.removeLoading[friendId] = true;
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        const { friendId } = action.payload;
        state.removeLoading[friendId] = false;
        
        // Remove from friends list
        state.friends = state.friends.filter((friend) => friend._id !== friendId);
        state.friendsCount = Math.max(0, state.friendsCount - 1);
        
        // Update search results if present
        state.searchResults = state.searchResults.map((user) =>
          user._id === friendId
            ? { ...user, relationshipStatus: "none" }
            : user
        );
      })
      .addCase(removeFriend.rejected, (state, action) => {
        const friendId = action.meta.arg;
        state.removeLoading[friendId] = false;
      })

      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.users;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })

      // Get Suggested Users
      .addCase(getSuggestedUsers.pending, (state) => {
        state.suggestedLoading = true;
        state.suggestedError = null;
      })
      .addCase(getSuggestedUsers.fulfilled, (state, action) => {
        state.suggestedLoading = false;
        state.suggestedUsers = action.payload.users;
      })
      .addCase(getSuggestedUsers.rejected, (state, action) => {
        state.suggestedLoading = false;
        state.suggestedError = action.payload;
      });
  },
});

export const { 
  clearSearchResults, 
  updateSearchQuery, 
  resetActionStates 
} = friendsSlice.actions;

export default friendsSlice.reducer;