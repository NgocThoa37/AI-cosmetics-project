import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/api/auth.service';
import { userService } from '@/services/api/user.service';
import { LoginRequest, RegisterRequest, User, Customer } from '@/types';
import {
  setAccessToken,
  setRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setUser,
  removeUser,
  getAccessToken,
  getUser,
} from '@/helpers/storage.helper';

interface AuthState {
  isAuthenticated: boolean;
  user: Customer | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: !!getAccessToken(),
  user: getUser(),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      const userProfile = await userService.getMyProfile();
      setUser(userProfile);
      return { ...response, userProfile };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      removeAccessToken();
      removeRefreshToken();
      removeUser();
      return {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại');
    }
  }
);

export const fetchMyProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const userProfile = await userService.getMyProfile();
      setUser(userProfile);
      return userProfile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin thất bại');
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { fullName?: string; phone?: string; dob?: string; gender?: string; avatar?: string | null }, { rejectWithValue }) => {
    try {
      const userProfile = await userService.updateMyProfile(data);
      setUser(userProfile);
      return userProfile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật thông tin thất bại');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserFromStorage: (state) => {
      const user = getUser();
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
      }
    },
    updateUser: (state, action: PayloadAction<Partial<Customer>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        setUser(state.user);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.userProfile;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      // Fetch My Profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Update My Profile
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUserFromStorage, updateUser } = authSlice.actions;
export default authSlice.reducer;