import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadCart();
      loadFavorites();
    } else {
      setCart([]);
      setFavorites([]);
    }
  }, [currentUser]);

  const loadCart = async () => {
    const q = query(collection(db, 'cart'), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    setCart(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadFavorites = async () => {
    const q = query(collection(db, 'favorites'), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    setFavorites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addToCart = async (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    if (!currentUser) {
      toast.error('Please login first');
      return;
    }
    const existing = cart.find(item => 
      item.productId === product.id && 
      item.selectedSize === selectedSize && 
      item.selectedColor === selectedColor
    );
    if (existing) {
      await updateDoc(doc(db, 'cart', existing.id), { quantity: existing.quantity + quantity });
      toast.success('Cart updated');
    } else {
      await addDoc(collection(db, 'cart'), {
        userId: currentUser.uid,
        productId: product.id,
        product,
        quantity,
        selectedSize,
        selectedColor
      });
      toast.success('Added to cart');
    }
    loadCart();
  };

  const removeFromCart = async (cartId) => {
    await deleteDoc(doc(db, 'cart', cartId));
    toast.success('Removed from cart');
    loadCart();
  };

  const updateCartQuantity = async (cartId, quantity) => {
    if (quantity < 1) return;
    await updateDoc(doc(db, 'cart', cartId), { quantity });
    loadCart();
  };

  const clearCart = async () => {
    const q = query(collection(db, 'cart'), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    setCart([]);
  };

  const addToFavorites = async (product) => {
    if (!currentUser) {
      toast.error('Please login first');
      return;
    }
    const existing = favorites.find(item => item.productId === product.id);
    if (existing) {
      await deleteDoc(doc(db, 'favorites', existing.id));
      toast.success('Removed from favorites');
    } else {
      await addDoc(collection(db, 'favorites'), {
        userId: currentUser.uid,
        productId: product.id,
        product
      });
      toast.success('Added to favorites');
    }
    loadFavorites();
  };

  const isFavorite = (productId) => {
    return favorites.some(item => item.productId === productId);
  };

  const value = {
    cart,
    favorites,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToFavorites,
    isFavorite
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
