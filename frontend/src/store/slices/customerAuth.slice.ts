// src/store/slices/customerAuth.slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/api/auth.service';
import { customerService } from '@/services/api/customer.service';
import { fetchCart } from './cart.slice';

interface CustomerAuthState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  error: string | null;
}

// ✅ Hàm khởi tạo state từ localStorage - KIỂM TRA WINDOW
const getInitialState = (): CustomerAuthState => {
  // ✅ Chỉ chạy trên Client, không chạy trên Server
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    };
  }
  
  const token = localStorage.getItem('customer_token');
  const userInfo = localStorage.getItem('user_info');
  
  return {
    isAuthenticated: !!token,
    user: userInfo ? JSON.parse(userInfo) : null,
    loading: false,
    error: null,
  };
};

const initialState: CustomerAuthState = getInitialState();

// Login khách hàng
export const customerLogin = createAsyncThunk(
  'customerAuth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const res = await authService.login({ username, password });
      const { accessToken, refreshToken, user } = res;
      
      localStorage.setItem('customer_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_info', JSON.stringify(user));
      
      await dispatch(fetchCart());
      
      return { accessToken, refreshToken, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

// Register khách hàng
export const customerRegister = createAsyncThunk(
  'customerAuth/register',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

// Fetch profile từ customerService
export const fetchMyProfile = createAsyncThunk(
  'customerAuth/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await customerService.getProfile();
      return res;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy hồ sơ thất bại');
    }
  }
);

// Update profile từ customerService
export const updateMyProfile = createAsyncThunk(
  'customerAuth/updateMyProfile',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await customerService.updateProfile(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    }
  }
);

// Logout khách hàng
export const customerLogout = createAsyncThunk(
  'customerAuth/logout',
  async () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    return true;
  }
);

const customerAuthSlice = createSlice({
  name: 'customerAuth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(customerLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(customerLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(customerLogin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string || 'Đăng nhập thất bại';
      })
      // Register
      .addCase(customerRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(customerRegister.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(customerRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Đăng ký thất bại';
      })
      // Fetch profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Lấy hồ sơ thất bại';
      })
      // Update profile
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        state.error = null;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Cập nhật hồ sơ thất bại';
      })
      // Logout
      .addCase(customerLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError, resetAuth } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;