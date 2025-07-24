import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, googleLoginApi, guestLoginApi, logoutApi, getProfileApi, registerApi } from '../../api/Api';

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

// Fetch profile thunk
export const fetchProfileThunk = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProfileApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch profile failed');
    }
  }
);

// Login thunk
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      await loginApi(credentials);
      // After login, fetch the profile
      const profileResult = await dispatch(fetchProfileThunk());
      if (fetchProfileThunk.fulfilled.match(profileResult)) {
        return profileResult.payload;
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
      await googleLoginApi(credentials);
      // After login, fetch the profile
      const profileResult = await dispatch(fetchProfileThunk());
      if (fetchProfileThunk.fulfilled.match(profileResult)) {
        return profileResult.payload;
      } else {
        return rejectWithValue(profileResult.payload || 'Failed to fetch profile after Google login');
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Google login failed');
    }
  }
);

// Guest login thunk
export const guestLoginThunk = createAsyncThunk(
  'auth/guestLogin',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      await guestLoginApi(credentials);
      // After login, fetch the profile
      const profileResult = await dispatch(fetchProfileThunk());
      if (fetchProfileThunk.fulfilled.match(profileResult)) {
        return profileResult.payload;
      } else {
        return rejectWithValue(profileResult.payload || 'Failed to fetch profile after guest login');
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Guest login failed');
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
      // Guest login
      .addCase(guestLoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(guestLoginThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(guestLoginThunk.rejected, (state, action) => {
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
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer; 