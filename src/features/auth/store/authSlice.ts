import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens } from '@/shared/types';
import { STORAGE_KEYS } from '@/shared/constants';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>
    ) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.error = null;
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload.user));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, action.payload.tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, action.payload.tokens.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    restoreSession: (state) => {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (userStr && accessToken && refreshToken) {
        state.user = JSON.parse(userStr);
        state.tokens = { accessToken, refreshToken };
        state.isAuthenticated = true;
      }
    },
  },
});

export const { setCredentials, logout, setLoading, setError, restoreSession } = authSlice.actions;
export default authSlice.reducer;