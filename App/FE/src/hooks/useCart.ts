import { useCallback, useEffect, useState } from "react";
import { CartItem, MenuItem } from "@/components/resto";

const CART_KEY = "restaurant_cart";
const CART_EVENT = "cart_updated";

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadCart = () => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  // Load awal
  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  // Denger event custom
  useEffect(() => {
    const handleUpdate = () => {
      setCartItems(loadCart());
    };

    window.addEventListener(CART_EVENT, handleUpdate);
    return () => window.removeEventListener(CART_EVENT, handleUpdate);
  }, []);

  const updateCart = (items: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
  };

  const addToCart = useCallback((item: MenuItem, quantity: number) => {
    const current = loadCart();
    const existing = current.find(ci => ci.item.id === item.id);

    let updated;

    if (existing) {
      updated = current.map(ci =>
        ci.item.id === item.id
          ? { ...ci, quantity: ci.quantity + quantity }
          : ci
      );
    } else {
      updated = [...current, { item, quantity }];
    }

    updateCart(updated);
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    const current = loadCart();
    const updated = current.filter(ci => ci.item.id !== itemId);
    updateCart(updated);
  }, []);

  const clearCart = useCallback(() => {
    updateCart([]);
  }, []);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
  };
}
