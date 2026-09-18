import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useFavorites } from '../../context/FavoritesContext';
import ProductCard from '../../components/ProductCard';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from '@/components/useColorScheme';
import { router } from 'expo-router';

export default function FavoritesScreen() {
  const { favorites, clearFavorites } = useFavorites();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {favorites.length > 0 && (
        <View style={styles.header}>
          <Text style={[styles.subtitle, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            Tienes {favorites.length} producto{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={clearFavorites} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Limpiar todos</Text>
          </TouchableOpacity>
        </View>
      )}

      {favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <SymbolView
            name={{ ios: 'heart.slash', android: 'heart_broken', web: 'heart_broken' }}
            tintColor={isDark ? '#555555' : '#cccccc'}
            size={50}
          />
          <Text style={[styles.emptyText, isDark ? styles.textDark : styles.textLight]}>
            Aún no tienes favoritos
          </Text>
          <Text style={[styles.emptySubtext, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            Explora la tienda y presiona el ícono de corazón para guardar tus artículos preferidos.
          </Text>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.exploreBtn}>
            <Text style={styles.exploreBtnText}>Ir a la tienda</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgLight: {
    backgroundColor: '#f8f9fa',
  },
  bgDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    color: '#e63946',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  exploreBtn: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#ffffff',
  },
  textGreyLight: {
    color: '#666666',
  },
  textGreyDark: {
    color: '#aaaaaa',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
