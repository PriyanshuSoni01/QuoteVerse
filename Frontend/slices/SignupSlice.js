import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const signupUser = createAsyncThunk(
  "signup/signupUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/user/signup`, credentials);
      return data; // returns { success: true, message: "user created successfully!" }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const SignupSlice = createSlice({
  name: "signup",
  initialState: { loading: false, user: null, error: null, success: false, message: "" },
  reducers: {
    resetSignupState: (state) => {
      state.success = false;
      state.message = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message; // message from API
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSignupState } = SignupSlice.actions;
export default SignupSlice.reducer;
