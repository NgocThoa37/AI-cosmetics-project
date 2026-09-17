// frontend/src/store/slices/auth.slice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/api/auth.service';
import toast from 'react-hot-toast';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Login
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('📤 [AUTH SLICE] Login attempt:', { username, password });
      
      // ✅ FIX: Truyền object { username, password }
      const res = await authService.login({ username, password });
      console.log('✅ [AUTH SLICE] Login response:', res);
      
      const { accessToken, refreshToken, user } = res;
      console.log('👤 [AUTH SLICE] User:', user);
      console.log('📊 [AUTH SLICE] Role:', user?.role);
      
      // ✅ FIX: Cho phép cả admin và employee
      if (user?.role === 'admin' || user?.role === 'employee') {
        // Lưu token vào localStorage
        localStorage.setItem('admin_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_info', JSON.stringify(user));
        
        return { accessToken, refreshToken, user };
      } else {
        console.log('❌ [AUTH SLICE] Not admin/employee role:', user?.role);
        return rejectWithValue('Tài khoản không có quyền truy cập trang admin');
      }
    } catch (error: any) {
      console.error('❌ [AUTH SLICE] Login error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Đăng nhập thất bại'
      );
    }
  }
);

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (data: any, { rejectWithValue }) => {
    try {
      console.log('📤 [AUTH SLICE] Register:', data);
      
      // ✅ FIX: Truyền object
      const res = await authService.register(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Đăng ký thất bại'
      );
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Xóa token
      localStorage.removeItem('admin_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_info');
      
      return true;
    } catch (error: any) {
      return rejectWithValue('Logout failed');
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
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string || 'Đăng nhập thất bại';
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Đăng ký thất bại';
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;