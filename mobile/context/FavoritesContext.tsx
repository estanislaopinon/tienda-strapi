import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favorites: any[];
  toggleFavorite: (product: any) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}

/**
 * Contexto global para administrar la lista de productos favoritos del usuario,
 * persistidos localmente en el dispositivo con AsyncStorage.
 */
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveFavorites();
    }
  }, [favorites, isLoaded]);

  /**
   * Carga los favoritos guardados en AsyncStorage.
   */
  async function loadFavorites() {
    try {
      const stored = await AsyncStorage.getItem('user_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error al cargar la lista de favoritos:', e);
    } finally {
      setIsLoaded(true);
    }
  }

  /**
   * Guarda la lista de favoritos en almacenamiento local.
   */
  async function saveFavorites() {
    try {
      await AsyncStorage.setItem('user_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error al guardar la lista de favoritos:', e);
    }
  }

  /**
   * Agrega o remueve un producto de la lista de favoritos.
   */
  function toggleFavorite(product: any) {
    setFavorites((prevFavorites) => {
      const index = prevFavorites.findIndex((p) => p.id === product.id);
      if (index > -1) {
        // Remover de favoritos
        return prevFavorites.filter((p) => p.id !== product.id);
      } else {
        // Agregar a favoritos
        return [...prevFavorites, product];
      }
    });
  }

  /**
   * Verifica si un producto está actualmente marcado como favorito.
   */
  function isFavorite(productId: number) {
    return favorites.some((p) => p.id === productId);
  }

  /**
   * Vacía la lista de favoritos.
   */
  function clearFavorites() {
    setFavorites([]);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al contexto de Favoritos.
 */
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites debe ser usado dentro de un FavoritesProvider');
  }
  return context;
}
