'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/store/slices/cart.slice';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cart, itemCount, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleAddToCart = (productDetailId: string, quantity: number) => {
    return dispatch(addToCart({ productDetailId, quantity }));
  };

  const handleUpdateQuantity = (productDetailId: string, quantity: number) => {
    return dispatch(updateCartItem({ productDetailId, quantity }));
  };

  const handleRemoveItem = (productDetailId: string) => {
    return dispatch(removeCartItem(productDetailId));
  };

  const handleClearCart = () => {
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