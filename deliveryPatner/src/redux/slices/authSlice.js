import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, googleLoginApi, logoutApi, getDeliveryPartnerProfileApi, updateDeliveryPartnerProfileApi, registerApi, getProfileApi } from '../../api/Api';

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  registerSuccess: false,
};

// Register thunk
export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await registerApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// Fetch delivery partner profile thunk
export const fetchProfileThunk = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getDeliveryPartnerProfileApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch delivery partner profile failed');
    }
  }
);

// Fetch authenticated user profile (role, username, email)
export const fetchAuthProfileThunk = createAsyncThunk(
  'auth/fetchAuthProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProfileApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch auth profile failed');
    }
  }
);

// Update delivery partner profile thunk
export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const res = await updateDeliveryPartnerProfileApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update profile failed');
    }
  }
);

// Login thunk
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      // 1) Login
      await loginApi(credentials);

      // 2) Fetch authenticated profile to determine role
      const authProfileRes = await getProfileApi();
      const authUser = authProfileRes?.data;

      if (authUser?.role === 'admin') {
        // Admin user: return compact admin object
        return {
          _id: authUser._id,
          name: authUser.username,
          email: authUser.email,
          username: authUser.username,
          role: authUser.role,
          isAdmin: true,
        };
      }

      // Non-admin (delivery partner): fetch DP profile and merge role
      const profileResult = await dispatch(fetchProfileThunk());
      if (fetchProfileThunk.fulfilled.match(profileResult)) {
        const dp = profileResult.payload;
        return {
          ...dp,
          role: authUser?.role || 'user',
          isAdmin: false,
        };
      } else {
        return rejectWithValue(profileResult.payload || 'Failed to fetch profile after login');
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// Google login thunk
export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      // 1) Google login
      await googleLoginApi(credentials);

      // 2) Fetch authenticated profile to determine role
      const authProfileRes = await getProfileApi();
      const authUser = authProfileRes?.data;

      if (authUser?.role === 'admin') {
        return {
          _id: authUser._id,
          name: authUser.username,
          email: authUser.email,
          username: authUser.username,
          role: authUser.role,
          isAdmin: true,
        };
      }

      // Non-admin (delivery partner): fetch DP profile and merge role
      const profileResult = await dispatch(fetchProfileThunk());
      if (fetchProfileThunk.fulfilled.match(profileResult)) {
        const dp = profileResult.payload;
        return {
          ...dp,
          role: authUser?.role || 'user',
          isAdmin: false,
        };
      } else {
        return rejectWithValue(profileResult.payload || 'Failed to fetch profile after Google login');
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Google login failed');
    }
  }
);

// Logout thunk
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const res = await logoutApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.registerSuccess = true;
        state.error = null;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.registerSuccess = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch auth profile
      .addCase(fetchAuthProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuthProfileThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        const authUser = action.payload || {};
        state.user = {
          _id: authUser._id,
          name: authUser.username, // temp until DP profile overrides
          email: authUser.email,
          username: authUser.username,
          role: authUser.role,
          isAdmin: authUser.role === 'admin',
          ...authUser,
        };
        state.loading = false;
      })
      .addCase(fetchAuthProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Google login
      .addCase(googleLoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      // Fetch profile
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        // Map delivery partner data to user format
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.mobileNumber, // Use mobile number as email
          username: action.payload.name,
          mobileNumber: action.payload.mobileNumber,
          ...action.payload
        };
        state.loading = false;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Update user data with new profile data
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.mobileNumber,
          username: action.payload.name,
          mobileNumber: action.payload.mobileNumber,
          ...action.payload
        };
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer; 