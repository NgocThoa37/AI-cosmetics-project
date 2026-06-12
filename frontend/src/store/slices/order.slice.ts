import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '@/services/api/order.service';
import { Order } from '@/types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      });
  },
});

export default orderSlice.reducer;