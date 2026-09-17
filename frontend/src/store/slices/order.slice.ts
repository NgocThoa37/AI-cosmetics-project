import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '@/services/api/order.service';
import { Order } from '@/types';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
};

export const fetchMyOrders = createAsyncThunk('order/fetchMyOrders', async () => {
  return await orderService.getMyOrders();
});

export const fetchOrderById = createAsyncThunk('order/fetchOrderById', async (id: number) => {
  return await orderService.getOrderById(id);
});

export const createOrder = createAsyncThunk(
  'order/create',
  async (data: {
    shippingAddress: string;
    shippingPhone: string;
    note?: string;
    paymentMethod: string;
    items: { productDetailId: string; quantity: number }[];
  }) => {
    return await orderService.createOrder(data);
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancel',
  async ({ orderId, reason }: { orderId: number; reason?: string }) => {
    return await orderService.cancelOrder(orderId, reason);
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state) => {
        state.loading = false;
      })
      // ✅ THÊM 3 CASE CHO cancelOrder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
        // Cập nhật lại danh sách orders
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;