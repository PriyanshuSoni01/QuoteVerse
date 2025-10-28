import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const loginUser = createAsyncThunk(
  'login/loginUser', async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/user/signin`, credentials);
      return data; // returns { success: true, message: "user created successfully!" }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
)

const LoginSlice = createSlice({
  name: 'login',
  initialState: {
    loading: false,
    user: null,
    token: null,
    error: null,
    success: false,
    message: ""
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    resetLoginState: (state) => {
      state.success = false;
      state.message = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user)); // Store user data
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
})

export const { logout, resetLoginState } = LoginSlice.actions;
export default LoginSlice.reducer;