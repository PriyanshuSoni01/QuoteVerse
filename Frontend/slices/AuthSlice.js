// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { loginUser } from "../slices/LoginSlice.js";
import { signupUser } from "../slices/SignupSlice.js";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

// 🔹 Send OTP thunk
export const sendOtp = createAsyncThunk("auth/sendOtp", async (email, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/user/send-otp`, { email });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: "Failed to send OTP" });
  }
});

// 🔹 Verify OTP thunk
export const verifyOtp = createAsyncThunk("auth/verifyOtp", async ({ email, otp }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/user/verify-otp`, { email, otp });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: "OTP verification failed" });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!localStorage.getItem("token"), // Check if user is logged in
    currentUser: JSON.parse(localStorage.getItem("user") || 'null'), // Get user from storage
    otpSent: false,   // after signup or sendOtp
    isVerified: false, // after verifyOtp
    loading: false,
    error: null,
    pendingEmail: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload.user;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
      setPendingEmail: (state, action) => {
    state.pendingEmail = action.payload;
  },
  clearPendingEmail: (state) => {
    state.pendingEmail = null;
  },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 login - when user successfully logs in
      .addCase(loginUser.fulfilled, (state, action) => {
        state.currentUser = action.payload.user; // Save user info
        state.isAuthenticated = true; // Mark as logged in
        state.error = null; // Clear any errors
        // Save user data so it stays after page refresh
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      // 🔹 signup
      .addCase(signupUser.fulfilled, (state) => {
        // User created → OTP should be sent
        state.otpSent = true;
        state.isVerified = false;
      })

      // 🔹 sendOtp
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // 🔹 verifyOtp
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.isVerified = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const {  setPendingEmail, clearPendingEmail, setUser, clearUser} = authSlice.actions;
export default authSlice.reducer;