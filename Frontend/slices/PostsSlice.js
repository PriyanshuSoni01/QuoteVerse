import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Create Post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`${API_BASE}/posts/create`, postData, {
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

// Get Feed
export const getFeed = createAsyncThunk(
  "posts/getFeed",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${API_BASE}/posts/feed?page=${page}&limit=${limit}`,
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

// Get User Posts
export const getUserPosts = createAsyncThunk(
  "posts/getUserPosts",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${API_BASE}/posts/user-posts?page=${page}&limit=${limit}`,
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

// Toggle Like
export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_BASE}/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { ...data, postId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add Comment
export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_BASE}/posts/${postId}/comment`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { ...data, postId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Post by ID
export const getPostById = createAsyncThunk(
  "posts/getPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/posts/${postId}`, {
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

// Delete Post
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(`${API_BASE}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { ...data, postId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update Post
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_BASE}/posts/${postId}`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { ...data, postId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    // Feed state
    feed: [],
    feedLoading: false,
    feedError: null,
    feedPagination: null,
    hasMoreFeed: true,

    // User posts state
    userPosts: [],
    userPostsLoading: false,
    userPostsError: null,
    userPostsPagination: null,

    // Create post state
    createLoading: false,
    createError: null,
    createSuccess: false,

    // Update post state
    updateLoading: false,
    updateError: null,
    updateSuccess: false,

    // Current post state
    currentPost: null,
    currentPostLoading: false,
    currentPostError: null,

    // UI state
    likeLoading: {},
    commentLoading: {},
  },
  reducers: {
    resetCreateState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
    },
    resetUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.currentPostError = null;
    },
    clearFeed: (state) => {
      state.feed = [];
      state.feedPagination = null;
      state.hasMoreFeed = true;
    },
    updatePostInFeed: (state, action) => {
      const { postId, updates } = action.payload;
      const postIndex = state.feed.findIndex((post) => post._id === postId);
      if (postIndex !== -1) {
        state.feed[postIndex] = { ...state.feed[postIndex], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        // Add new post to the beginning of feed
        state.feed.unshift(action.payload.post);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // Get Feed
      .addCase(getFeed.pending, (state) => {
        state.feedLoading = true;
        state.feedError = null;
      })
      .addCase(getFeed.fulfilled, (state, action) => {
        state.feedLoading = false;
        const { posts, pagination } = action.payload;
        
        if (pagination.currentPage === 1) {
          state.feed = posts;
        } else {
          state.feed = [...state.feed, ...posts];
        }
        
        state.feedPagination = pagination;
        state.hasMoreFeed = pagination.hasNextPage;
      })
      .addCase(getFeed.rejected, (state, action) => {
        state.feedLoading = false;
        state.feedError = action.payload;
      })

      // Get User Posts
      .addCase(getUserPosts.pending, (state) => {
        state.userPostsLoading = true;
        state.userPostsError = null;
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.userPostsLoading = false;
        const { posts, pagination } = action.payload;
        
        if (pagination.currentPage === 1) {
          state.userPosts = posts;
        } else {
          state.userPosts = [...state.userPosts, ...posts];
        }
        
        state.userPostsPagination = pagination;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.userPostsLoading = false;
        state.userPostsError = action.payload;
      })

      // Toggle Like
      .addCase(toggleLike.pending, (state, action) => {
        const postId = action.meta.arg;
        state.likeLoading[postId] = true;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked, likesCount } = action.payload;
        state.likeLoading[postId] = false;
        
        // Update in feed
        const feedPostIndex = state.feed.findIndex((post) => post._id === postId);
        if (feedPostIndex !== -1) {
          state.feed[feedPostIndex].likesCount = likesCount;
          state.feed[feedPostIndex].isLikedByUser = liked;
        }
        
        // Update in user posts
        const userPostIndex = state.userPosts.findIndex((post) => post._id === postId);
        if (userPostIndex !== -1) {
          state.userPosts[userPostIndex].likesCount = likesCount;
          state.userPosts[userPostIndex].isLikedByUser = liked;
        }
        
        // Update current post
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.likesCount = likesCount;
          state.currentPost.isLikedByUser = liked;
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        const postId = action.meta.arg;
        state.likeLoading[postId] = false;
      })

      // Add Comment
      .addCase(addComment.pending, (state, action) => {
        const { postId } = action.meta.arg;
        state.commentLoading[postId] = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment, commentsCount } = action.payload;
        state.commentLoading[postId] = false;
        
        // Update in feed
        const feedPostIndex = state.feed.findIndex((post) => post._id === postId);
        if (feedPostIndex !== -1) {
          state.feed[feedPostIndex].commentsCount = commentsCount;
          if (state.feed[feedPostIndex].comments) {
            state.feed[feedPostIndex].comments.push(comment);
          }
        }
        
        // Update current post
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.commentsCount = commentsCount;
          if (state.currentPost.comments) {
            state.currentPost.comments.push(comment);
          }
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        const { postId } = action.meta.arg;
        state.commentLoading[postId] = false;
      })

      // Get Post by ID
      .addCase(getPostById.pending, (state) => {
        state.currentPostLoading = true;
        state.currentPostError = null;
      })
      .addCase(getPostById.fulfilled, (state, action) => {
        state.currentPostLoading = false;
        state.currentPost = action.payload.post;
      })
      .addCase(getPostById.rejected, (state, action) => {
        state.currentPostLoading = false;
        state.currentPostError = action.payload;
      })

      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload.postId;
        
        // Remove from feed
        state.feed = state.feed.filter((post) => post._id !== postId);
        
        // Remove from user posts
        state.userPosts = state.userPosts.filter((post) => post._id !== postId);
        
        // Clear current post if it was deleted
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost = null;
        }
      })

      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        const updatedPost = action.payload.post;
        
        // Update in feed
        const feedPostIndex = state.feed.findIndex((post) => post._id === updatedPost._id);
        if (feedPostIndex !== -1) {
          state.feed[feedPostIndex] = updatedPost;
        }
        
        // Update in user posts
        const userPostIndex = state.userPosts.findIndex((post) => post._id === updatedPost._id);
        if (userPostIndex !== -1) {
          state.userPosts[userPostIndex] = updatedPost;
        }
        
        // Update current post
        if (state.currentPost && state.currentPost._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { 
  resetCreateState, 
  resetUpdateState,
  clearCurrentPost, 
  clearFeed, 
  updatePostInFeed 
} = postsSlice.actions;

export default postsSlice.reducer;