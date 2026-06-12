import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartService } from '@/services/api/cart.service';
import { Cart, CartItem } from '@/types';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
}

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
      const cart = await cartService.getCart();
      return cart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy giỏ hàng thất bại');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productDetailId, quantity }: { productDetailId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const cart = await cartService.addToCart(productDetailId, quantity);
      return cart;
    } catch (error: any) {
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
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.itemCount = action.payload?.details?.reduce((acc, item) => acc + item.quantity, 0) || 0;
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