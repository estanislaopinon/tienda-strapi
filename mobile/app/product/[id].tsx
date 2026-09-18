import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { apiFetch } from '../../services/api';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../components/ProductCard';
import { useColorScheme } from '@/components/useColorScheme';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const isFav = product ? isFavorite(product.id) : false;

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  async function fetchProductDetails() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/products/${id}?populate=*`);
      if (response && response.data) {
        setProduct(response.data);
      } else {
        setError('Producto no encontrado');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error al cargar detalles del producto');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, isDark ? styles.bgDark : styles.bgLight]}>
        <ActivityIndicator size="large" color="#4361ee" />
        <Text style={[styles.loadingText, isDark ? styles.textDark : styles.textLight]}>
          Cargando detalles...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.centerContainer, isDark ? styles.bgDark : styles.bgLight]}>
        <SymbolView
          name={{ ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }}
          tintColor="#e63946"
          size={48}
        />
        <Text style={styles.errorText}>{error || 'Producto no encontrado'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { name, slug, description, price, discount, stock, specs } = product.attributes;
  const brandName = product.attributes.brand?.data?.attributes?.name || 'Tech Store';
  const categoryName = product.attributes.category?.data?.attributes?.name || 'Tecnología';
  const imageUrl = getProductImage(slug);

  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price - (price * discount) / 100 : price;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleToggleFav = () => {
    toggleFavorite({
      id: product.id,
      name,
      price,
      discount,
      stock,
      slug,
      brandName,
    });
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name,
        price,
        discount,
        stock,
        slug,
      },
      quantity
    );
    router.push('/cart');
  };

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Product Image Panel */}
        <View style={styles.imagePanel}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>OFERTA -{discount}%</Text>
            </View>
          )}

          {/* Favorite heart button */}
          <TouchableOpacity
            onPress={handleToggleFav}
            style={[styles.favBtn, isDark ? styles.favBtnDark : styles.favBtnLight]}
          >
            <SymbolView
              name={{
                ios: isFav ? 'heart.fill' : 'heart',
                android: isFav ? 'favorite' : 'favorite_border',
                web: isFav ? 'favorite' : 'favorite_border',
              }}
              tintColor={isFav ? '#e63946' : (isDark ? '#fff' : '#000')}
              size={22}
            />
          </TouchableOpacity>
        </View>

        {/* Content Info */}
        <View style={styles.infoWrapper}>
          <View style={styles.tagRow}>
            <Text style={styles.brand}>{brandName.toUpperCase()}</Text>
            <Text style={[styles.bullet, isDark ? styles.textGreyDark : styles.textGreyLight]}>•</Text>
            <Text style={[styles.category, isDark ? styles.textGreyDark : styles.textGreyLight]}>
              {categoryName}
            </Text>
          </View>

          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>{name}</Text>

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            {hasDiscount ? (
              <View style={styles.priceColumn}>
                <View style={styles.discountRow}>
                  <Text style={styles.originalPrice}>${price.toFixed(2)}</Text>
                  <Text style={styles.savingText}>
                    Ahorras ${(price - finalPrice).toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.finalPrice}>${finalPrice.toFixed(2)}</Text>
              </View>
            ) : (
              <Text style={[styles.price, isDark ? styles.textDark : styles.textLight]}>
                ${price.toFixed(2)}
              </Text>
            )}

            {/* Stock Badge */}
            <View style={styles.stockBadgeContainer}>
              {isOutOfStock ? (
                <View style={[styles.stockBadge, styles.stockBadgeRed]}>
                  <Text style={styles.stockText}>Sin Stock</Text>
                </View>
              ) : isLowStock ? (
                <View style={[styles.stockBadge, styles.stockBadgeOrange]}>
                  <Text style={styles.stockText}>¡Últimas {stock} unidades!</Text>
                </View>
              ) : (
                <View style={[styles.stockBadge, styles.stockBadgeGreen]}>
                  <Text style={styles.stockText}>Disponible ({stock} u.)</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {description && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
                Descripción
              </Text>
              <Text style={[styles.descriptionBody, isDark ? styles.textGreyDark : styles.textGreyLight]}>
                {description}
              </Text>
            </View>
          )}

          {/* Technical Specs */}
          {specs && Object.keys(specs).length > 0 && (
            <View style={styles.specsSection}>
              <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
                Especificaciones Técnicas
              </Text>
              <View style={[styles.specsTable, isDark ? styles.tableDark : styles.tableLight]}>
                {Object.entries(specs).map(([key, val]: any, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.specsRow,
                      idx !== Object.keys(specs).length - 1 && (isDark ? styles.rowBorderDark : styles.rowBorderLight),
                    ]}
                  >
                    <Text style={[styles.specKey, isDark ? styles.textGreyDark : styles.textGreyLight]}>
                      {key}
                    </Text>
                    <Text style={[styles.specVal, isDark ? styles.textDark : styles.textLight]}>
                      {val}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Add to Cart Bar */}
      <View style={[styles.actionFooter, isDark ? styles.footerDark : styles.footerLight]}>
        {!isOutOfStock && (
          <View style={styles.qtyContainer}>
            <TouchableOpacity onPress={handleDecrement} style={[styles.qtyBtn, isDark ? styles.qtyBtnDark : styles.qtyBtnLight]}>
              <Text style={[styles.qtyBtnText, isDark ? styles.textDark : styles.textLight]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.qtyText, isDark ? styles.textDark : styles.textLight]}>{quantity}</Text>
            <TouchableOpacity onPress={handleIncrement} style={[styles.qtyBtn, isDark ? styles.qtyBtnDark : styles.qtyBtnLight]}>
              <Text style={[styles.qtyBtnText, isDark ? styles.textDark : styles.textLight]}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          style={[
            styles.addBtn,
            isOutOfStock ? styles.addBtnDisabled : (isDark ? styles.addBtnDark : styles.addBtnLight),
            isOutOfStock && { flex: 1 },
          ]}
        >
          <SymbolView
            name={{ ios: 'cart.fill.badge.plus', android: 'shopping_cart', web: 'shopping_cart' }}
            tintColor="#ffffff"
            size={18}
          />
          <Text style={styles.addBtnText}>
            {isOutOfStock ? 'Producto Agotado' : `Agregar ${quantity} al Carrito`}
          </Text>
        </TouchableOpacity>
      </View>
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
  scrollContainer: {
    paddingBottom: 100, // Safe distance for action sheet
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#e63946',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  backBtn: {
    backgroundColor: '#4361ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  imagePanel: {
    width: '100%',
    height: width * 0.8,
    maxHeight: 340,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#2a9d8f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  favBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  favBtnLight: {
    backgroundColor: '#ffffff',
  },
  favBtnDark: {
    backgroundColor: '#222222',
  },
  infoWrapper: {
    padding: 20,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    color: '#4361ee',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  bullet: {
    marginHorizontal: 8,
    fontSize: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 30,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceColumn: {
    flex: 1,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 13,
    color: '#a0a0a0',
    textDecorationLine: 'line-through',
  },
  savingText: {
    fontSize: 10,
    color: '#2a9d8f',
    fontWeight: 'bold',
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e63946',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stockBadgeContainer: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  stockBadgeGreen: {
    backgroundColor: 'rgba(42, 157, 143, 0.15)',
  },
  stockBadgeOrange: {
    backgroundColor: 'rgba(244, 162, 97, 0.15)',
  },
  stockBadgeRed: {
    backgroundColor: 'rgba(230, 57, 70, 0.15)',
  },
  stockText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#555',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  specsSection: {
    marginBottom: 20,
  },
  specsTable: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableLight: {
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  tableDark: {
    borderColor: '#333333',
    backgroundColor: '#1e1e1e',
  },
  specsRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowBorderLight: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  rowBorderDark: {
    borderBottomWidth: 1,
    borderBottomColor: '#2b2b2b',
  },
  specKey: {
    fontSize: 13,
    fontWeight: '600',
    width: 130,
  },
  specVal: {
    fontSize: 13,
    flex: 1,
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
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  footerLight: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e5e5e5',
  },
  footerDark: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333333',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnLight: {
    backgroundColor: '#f8f9fa',
  },
  qtyBtnDark: {
    backgroundColor: '#2e2e2e',
  },
  qtyText: {
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: 'bold',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addBtn: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  addBtnLight: {
    backgroundColor: '#4361ee',
  },
  addBtnDark: {
    backgroundColor: '#3f37c9',
  },
  addBtnDisabled: {
    backgroundColor: '#cccccc',
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
