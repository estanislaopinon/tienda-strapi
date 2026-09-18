import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  discount: number; // e.g. 10 for 10%
  quantity: number;
  slug: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
}

/**
 * Contexto global para administrar el carrito de compras,
 * persistencia local con AsyncStorage y cálculo de importes y descuentos.
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carga el carrito desde AsyncStorage al iniciar el componente
  useEffect(() => {
    loadCart();
  }, []);

  // Guarda el carrito en AsyncStorage ante cualquier cambio en la lista de ítems
  useEffect(() => {
    if (isLoaded) {
      saveCart();
    }
  }, [items, isLoaded]);

  /**
   * Carga el carrito almacenado previamente en el dispositivo.
   */
  async function loadCart() {
    try {
      const stored = await AsyncStorage.getItem('shopping_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error al cargar el carrito de compras:', e);
    } finally {
      setIsLoaded(true);
    }
  }

  /**
   * Guarda el estado actual del carrito en almacenamiento persistente.
   */
  async function saveCart() {
    try {
      await AsyncStorage.setItem('shopping_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error al guardar el carrito de compras:', e);
    }
  }

  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe.
   * Valida la cantidad máxima contra el stock disponible.
   */
  function addToCart(product: any, quantity: number = 1) {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const newQty = existingItem.quantity + quantity;
        
        // Limita la cantidad al stock disponible del producto
        const finalQty = Math.min(newQty, product.stock);
        const updated = [...prevItems];
        updated[existingIndex] = { ...existingItem, quantity: finalQty };
        return updated;
      } else {
        const finalQty = Math.min(quantity, product.stock);
        if (finalQty <= 0) return prevItems; // Sin stock disponible
        
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            discount: product.discount || 0,
            quantity: finalQty,
            slug: product.slug,
            stock: product.stock,
          },
        ];
      }
    });
  }

  /**
   * Elimina un producto del carrito.
   */
  function removeFromCart(productId: number) {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }

  /**
   * Actualiza la cantidad de un producto específico en el carrito.
   */
  function updateQuantity(productId: number, quantity: number) {
    setItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === productId) {
            const finalQty = Math.min(Math.max(1, quantity), item.stock);
            return { ...item, quantity: finalQty };
          }
          return item;
        });
    });
  }

  /**
   * Vacía por completo el carrito de compras.
   */
  function clearCart() {
    setItems([]);
  }

  // Cálculos financieros en tiempo real
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalDiscount = items.reduce((sum, item) => {
    const discountAmount = (item.price * item.discount) / 100;
    return sum + discountAmount * item.quantity;
  }, 0);

  const total = subtotal - totalDiscount;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        totalDiscount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al contexto del Carrito de Compras.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
