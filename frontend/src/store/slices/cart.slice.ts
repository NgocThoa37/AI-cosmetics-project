import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartService } from '@/services/api/cart.service';
import { Cart, CartItem } from '@/types';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
}

// ✅ Tạo cart rỗng với đầy đủ field (bỏ createdAt, updatedAt)
const EMPTY_CART: Cart = {
  id: 0,
  customerId: 0,
  totalItems: 0,
  totalPrice: 0,
  details: [],
};

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  itemCount: 0,
};

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('customer_token');
      console.log('🔍 [fetchCart] Token:', token ? 'CÓ' : 'KHÔNG');
      
      // ✅ Nếu không có token, trả về cart rỗng
      if (!token) {
        console.log('⚠️ [fetchCart] No token, returning empty cart');
        return EMPTY_CART;
      }
      
      const cart = await cartService.getCart();
      console.log('✅ [fetchCart] Success:', cart);
      return cart;
    } catch (error: any) {
      console.error('❌ [fetchCart] Error:', error.response?.status);
      
      // ✅ Nếu 401, trả về cart rỗng thay vì reject
      if (error.response?.status === 401) {
        console.log('⚠️ [fetchCart] 401, returning empty cart');
        return EMPTY_CART;
      }
      
      return rejectWithValue(error.response?.data?.message || 'Lấy giỏ hàng thất bại');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productDetailId, quantity }: { productDetailId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('customer_token');
      console.log('🔍 [addToCart] Token:', token ? 'CÓ' : 'KHÔNG');
      
      if (!token) {
        return rejectWithValue('Vui lòng đăng nhập để thêm vào giỏ hàng');
      }
      
      const cart = await cartService.addToCart(productDetailId, quantity);
      return cart;
    } catch (error: any) {
      console.error('❌ [addToCart] Error:', error.response?.status);
      return rejectWithValue(error.response?.data?.message || 'Thêm vào giỏ hàng thất bại');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ productDetailId, quantity }: { productDetailId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const cart = await cartService.updateCartItem(productDetailId, quantity);
      return cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật giỏ hàng thất bại');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/remove',
  async (productDetailId: string, { rejectWithValue }) => {
    try {
      const cart = await cartService.removeCartItem(productDetailId);
      return cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xóa sản phẩm thất bại');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Xóa giỏ hàng thất bại');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    updateItemCount: (state) => {
      state.itemCount = state.cart?.details?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.itemCount = action.payload?.details?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.itemCount = action.payload?.details?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.itemCount = action.payload?.details?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.itemCount = action.payload?.details?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null;
        state.itemCount = 0;
      });
  },
});

export const { updateItemCount } = cartSlice.actions;
export default cartSlice.reducer;