import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, googleLoginApi, logoutApi, getDeliveryPartnerProfileApi, updateDeliveryPartnerProfileApi, registerApi } from '../../api/Api';

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
      const loginResponse = await loginApi(credentials);
      
      // Check if user is admin
      if (loginResponse.data.user && loginResponse.data.user.role === 'admin') {
        // For admin users, return the user data directly without fetching delivery partner profile
        return {
          _id: loginResponse.data.user.id,
          name: loginResponse.data.user.username,
          email: loginResponse.data.user.email,
          username: loginResponse.data.user.username,
          role: loginResponse.data.user.role,
          isAdmin: true
        };
      } else {
        // For regular delivery partners, fetch the profile
        const profileResult = await dispatch(fetchProfileThunk());
        if (fetchProfileThunk.fulfilled.match(profileResult)) {
          return profileResult.payload;
        } else {
          return rejectWithValue(profileResult.payload || 'Failed to fetch profile after login');
        }
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
      const loginResponse = await googleLoginApi(credentials);
      
      // Check if user is admin
      if (loginResponse.data.user && loginResponse.data.user.role === 'admin') {
        // For admin users, return the user data directly without fetching delivery partner profile
        return {
          _id: loginResponse.data.user.id,
          name: loginResponse.data.user.username,
          email: loginResponse.data.user.email,
          username: loginResponse.data.user.username,
          role: loginResponse.data.user.role,
          isAdmin: true
        };
      } else {
        // For regular delivery partners, fetch the profile
        const profileResult = await dispatch(fetchProfileThunk());
        if (fetchProfileThunk.fulfilled.match(profileResult)) {
          return profileResult.payload;
        } else {
          return rejectWithValue(profileResult.payload || 'Failed to fetch profile after Google login');
        }
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