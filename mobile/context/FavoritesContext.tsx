import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favorites: any[];
  toggleFavorite: (product: any) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}

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

  async function loadFavorites() {
    try {
      const stored = await AsyncStorage.getItem('user_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    } finally {
      setIsLoaded(true);
    }
  }

  async function saveFavorites() {
    try {
      await AsyncStorage.setItem('user_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }

  function toggleFavorite(product: any) {
    setFavorites((prevFavorites) => {
      const index = prevFavorites.findIndex((p) => p.id === product.id);
      if (index > -1) {
        // Remove from favorites
        return prevFavorites.filter((p) => p.id !== product.id);
      } else {
        // Add to favorites
        return [...prevFavorites, product];
      }
    });
  }

  function isFavorite(productId: number) {
    return favorites.some((p) => p.id === productId);
  }

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

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
