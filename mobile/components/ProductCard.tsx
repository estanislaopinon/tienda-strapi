import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export const getProductImage = (slug: string) => {
  const images: Record<string, string> = {
    'iphone-15-pro-max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600',
    'samsung-galaxy-s24-ultra': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600',
    'asus-rog-zephyrus-g14': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600',
    'macbook-air-m3': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600',
    'airpods-pro-2': 'https://images.unsplash.com/photo-1588449668338-d13417f16fd7?q=80&w=600',
    'samsung-galaxy-watch-6': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600',
  };
  return images[slug] || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600';
};

export default function ProductCard({ product }: { product: any }) {
  const colorScheme = useColorScheme() || 'light';
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();

  const isFav = isFavorite(product.id);
  const imageUrl = getProductImage(product.attributes?.slug || product.slug);
  const brandName = product.attributes?.brand?.data?.attributes?.name || product.brandName || 'Tech Store';

  const price = product.attributes?.price || product.price;
  const discount = product.attributes?.discount || product.discount || 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price - (price * discount) / 100 : price;
  const isOutOfStock = (product.attributes?.stock ?? product.stock ?? 0) <= 0;

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.attributes?.name || product.name,
      price: price,
      discount: discount,
      stock: product.attributes?.stock ?? product.stock ?? 0,
      slug: product.attributes?.slug || product.slug,
    });
  };

  const handleToggleFav = (e: any) => {
    e.stopPropagation();
    toggleFavorite({
      id: product.id,
      name: product.attributes?.name || product.name,
      price: price,
      discount: discount,
      stock: product.attributes?.stock ?? product.stock ?? 0,
      slug: product.attributes?.slug || product.slug,
      brandName,
    });
  };

  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={StyleSheet.flatten([styles.card, isDark ? styles.cardDark : styles.cardLight])}
    >
      {/* Product Image Container (1:1 aspect ratio) */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        
        {/* Favorite Button overlay */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggleFav}
          style={[styles.favoriteBtn, isDark ? styles.btnBgDark : styles.btnBgLight]}
        >
          <SymbolView
            name={{
              ios: isFav ? 'heart.fill' : 'heart',
              android: isFav ? 'favorite' : 'favorite_border',
              web: isFav ? 'favorite' : 'favorite_border',
            }}
            tintColor={isFav ? '#e63946' : (isDark ? '#aaaaaa' : '#555555')}
            size={14}
          />
        </TouchableOpacity>

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Sin Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {brandName.toUpperCase()}
        </Text>
        <Text style={[styles.name, isDark ? styles.textDark : styles.textLight]} numberOfLines={1}>
          {product.attributes?.name || product.name}
        </Text>

        {/* Pricing Centered */}
        <View style={styles.priceContainerCentered}>
          {hasDiscount ? (
            <View style={styles.priceRowCentered}>
              <Text style={styles.originalPrice}>${price.toFixed(0)}</Text>
              <Text style={styles.finalPrice}>${finalPrice.toFixed(0)}</Text>
            </View>
          ) : (
            <Text style={[styles.price, isDark ? styles.textDark : styles.textLight]}>
              ${price.toFixed(0)}
            </Text>
          )}
        </View>

        {/* Add to Cart Centered Button */}
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          style={[
            styles.cartButtonCentered,
            isOutOfStock ? styles.cartBtnDisabled : (isDark ? styles.cartBtnDark : styles.cartBtnLight),
          ]}
        >
          <Text style={styles.cartBtnTextCentered}>
            {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
          </Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
    margin: 4,
    maxWidth: '31.3%', // Fits 3 columns nicely
    minWidth: 90,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
    shadowColor: '#000000',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333333',
    shadowColor: '#000000',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
    padding: 5,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  btnBgLight: {
    backgroundColor: '#ffffff',
  },
  btnBgDark: {
    backgroundColor: '#2e2e2e',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.4, // Shorter rectangular aspect ratio to make the photo smaller
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#2a9d8f',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 5,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    marginTop: 2,
  },
  brand: {
    fontSize: 9.5,
    color: '#8e9aaf',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 1,
    textAlign: 'center',
  },
  name: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 2,
    textAlign: 'center',
  },
  textLight: {
    color: '#1a1a1a',
  },
  textDark: {
    color: '#f5f5f5',
  },
  priceContainerCentered: {
    alignItems: 'center',
    marginVertical: 2,
  },
  priceRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 10,
    color: '#a0a0a0',
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e63946',
  },
  cartButtonCentered: {
    paddingVertical: 8, // Thicker padding for a larger button footprint
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    width: '100%',
  },
  cartBtnTextCentered: {
    color: '#ffffff',
    fontSize: 10, // Larger cart text
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cartBtnLight: {
    backgroundColor: '#4361ee',
  },
  cartBtnDark: {
    backgroundColor: '#3f37c9',
  },
  cartBtnDisabled: {
    backgroundColor: '#cccccc',
  },
});
