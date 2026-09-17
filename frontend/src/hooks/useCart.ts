'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/store/slices/cart.slice';
import { useCustomerAuth } from './useCustomerAuth'; // ✅ SỬA: dùng customer auth

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useCustomerAuth(); // ✅ SỬA: dùng customer auth
  const { cart, itemCount, loading } = useAppSelector((state) => state.cart);

  // ✅ CHỈ gọi fetchCart khi đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔍 [useCart] Fetching cart...');
      dispatch(fetchCart());
    } else {
      console.log('🔍 [useCart] Not authenticated, skip fetch');
    }
  }, [dispatch, isAuthenticated]);

  const handleAddToCart = (productDetailId: string, quantity: number) => {
    console.log('🔍 [useCart] addToCart:', { productDetailId, quantity });
    return dispatch(addToCart({ productDetailId, quantity }));
  };

  const handleUpdateQuantity = (productDetailId: string, quantity: number) => {
    console.log('🔍 [useCart] updateQuantity:', { productDetailId, quantity });
    return dispatch(updateCartItem({ productDetailId, quantity }));
  };

  const handleRemoveItem = (productDetailId: string) => {
    console.log('🔍 [useCart] removeItem:', productDetailId);
    return dispatch(removeCartItem(productDetailId));
  };

  const handleClearCart = () => {
    console.log('🔍 [useCart] clearCart');
    return dispatch(clearCart());
  };

  return {
    cart,
    itemCount,
    loading,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    clearCart: handleClearCart,
  };
};