import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import cartReducer from './slices/cart.slice';
import productReducer from './slices/product.slice';
import orderReducer from './slices/order.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;