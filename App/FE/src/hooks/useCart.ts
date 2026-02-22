import { useCallback, useEffect, useState } from "react";

const CART_KEY = "restaurant_cart";
const CART_EVENT = "cart_updated";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedAttributes: {
    name: string;
    level: string;
  }[];
  key: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  menu_image: string;
  attributes?: any[];
  selectedAttributes?: Record<string, number>;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadCart = useCallback((): CartItem[] => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    setCartItems(loadCart());
  }, [loadCart]);

  useEffect(() => {
    const handleUpdate = () => setCartItems(loadCart());
    window.addEventListener(CART_EVENT, handleUpdate);
    return () => window.removeEventListener(CART_EVENT, handleUpdate);
  }, [loadCart]);

  const updateCart = useCallback((items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
  }, []);

  const generateKey = (item: MenuItem) => {
    // Pastikan atribut disortir agar urutan pilih tidak merusak key
    const attrEntries = item.selectedAttributes 
      ? Object.entries(item.selectedAttributes).sort(([a], [b]) => a.localeCompare(b))
      : [];
    
    const attrString = attrEntries.length > 0 ? JSON.stringify(attrEntries) : "no-attr";
    return `${item.id}-${btoa(attrString)}`;
  };

  const formatAttributes = (item: MenuItem) => {
    if (!item.selectedAttributes || !item.attributes) return [];
    
    return Object.entries(item.selectedAttributes).map(([attrId, lvlId]) => {
      const attribute = item.attributes?.find(a => String(a.id) === String(attrId));
      const level = attribute?.levels?.find((l: any) => String(l.id) === String(lvlId));

      return {
        name: attribute?.name || "Unknown",
        level: level?.name || "Standard",
      };
    });
  };

  const addToCart = useCallback((item: MenuItem, quantity: number) => {
    const current = loadCart();
    const key = generateKey(item);
    
    // Cari apakah sudah ada item dengan key (ID + Atribut) yang sama persis
    const existingIndex = current.findIndex(ci => ci.key === key);

    if (existingIndex > -1) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      };
      updateCart(updated);
    } else {
      const newItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.menu_image,
        quantity,
        selectedAttributes: formatAttributes(item),
        key,
      };
      updateCart([...current, newItem]);
    }
  }, [loadCart, updateCart]);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    const current = loadCart();
    if (quantity <= 0) {
      updateCart(current.filter(ci => ci.key !== key));
    } else {
      updateCart(current.map(ci => ci.key === key ? { ...ci, quantity } : ci));
    }
  }, [loadCart, updateCart]);

  const removeFromCart = useCallback((key: string) => {
    updateCart(loadCart().filter(ci => ci.key !== key));
  }, [loadCart, updateCart]);

  const clearCart = useCallback(() => updateCart([]), [updateCart]);

  return { cartItems, addToCart, updateQuantity, removeFromCart, clearCart };
}