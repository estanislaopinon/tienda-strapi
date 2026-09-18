import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useCart, CartItem } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from '@/components/useColorScheme';
import { getProductImage } from '../../components/ProductCard';
import { router } from 'expo-router';

export default function CartScreen() {
  const { items, updateQuantity, removeFromCart, subtotal, totalDiscount, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Direct user to login first
      router.push('/(auth)/login?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const imageUrl = getProductImage(item.slug);
    const itemPrice = item.price;
    const finalPrice = itemPrice - (itemPrice * item.discount) / 100;
    
    return (
      <View style={[styles.itemCard, isDark ? styles.cardDark : styles.cardLight]}>
        <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, isDark ? styles.textDark : styles.textLight]} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={styles.priceRow}>
            {item.discount > 0 ? (
              <View style={styles.priceColumn}>
                <Text style={styles.originalPrice}>${(itemPrice * item.quantity).toFixed(2)}</Text>
                <Text style={styles.finalPrice}>${(finalPrice * item.quantity).toFixed(2)}</Text>
              </View>
            ) : (
              <Text style={[styles.price, isDark ? styles.textDark : styles.textLight]}>
                ${(itemPrice * item.quantity).toFixed(2)}
              </Text>
            )}
          </View>
          
          {/* Controls */}
          <View style={styles.controlsRow}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                style={[styles.qtyBtn, isDark ? styles.qtyBtnDark : styles.qtyBtnLight]}
              >
                <Text style={[styles.qtyBtnText, isDark ? styles.textDark : styles.textLight]}>-</Text>
              </TouchableOpacity>
              
              <Text style={[styles.qtyText, isDark ? styles.textDark : styles.textLight]}>
                {item.quantity}
              </Text>
              
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                style={[
                  styles.qtyBtn,
                  isDark ? styles.qtyBtnDark : styles.qtyBtnLight,
                  item.quantity >= item.stock && styles.qtyBtnDisabled,
                ]}
              >
                <Text style={[styles.qtyBtnText, isDark ? styles.textDark : styles.textLight]}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
              <SymbolView
                name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                tintColor="#e63946"
                size={18}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {items.length === 0 ? (
        <View style={styles.centerContainer}>
          <SymbolView
            name={{ ios: 'cart.badge.minus', android: 'remove_shopping_cart', web: 'remove_shopping_cart' }}
            tintColor={isDark ? '#555555' : '#cccccc'}
            size={50}
          />
          <Text style={[styles.emptyText, isDark ? styles.textDark : styles.textLight]}>
            Tu carrito está vacío
          </Text>
          <Text style={[styles.emptySubtext, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            Parece que no has añadido ningún producto a tu carrito todavía.
          </Text>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.shopBtn}>
            <Text style={styles.shopBtnText}>Explorar tienda</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Items List */}
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Invoice Summary */}
          <View style={[styles.summaryCard, isDark ? styles.summaryDark : styles.summaryLight]}>
            <Text style={[styles.summaryTitle, isDark ? styles.textDark : styles.textLight]}>
              Resumen de compra
            </Text>

            <View style={styles.summaryRow}>
              <Text style={isDark ? styles.textGreyDark : styles.textGreyLight}>Subtotal</Text>
              <Text style={isDark ? styles.textDark : styles.textLight}>${subtotal.toFixed(2)}</Text>
            </View>

            {totalDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ color: '#2a9d8f' }}>Descuentos</Text>
                <Text style={{ color: '#2a9d8f', fontWeight: 'bold' }}>
                  -${totalDiscount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={isDark ? styles.textGreyDark : styles.textGreyLight}>Envío</Text>
              <Text style={{ color: '#2a9d8f', fontWeight: 'bold' }}>Gratis</Text>
            </View>

            <View style={[styles.divider, isDark ? styles.dividerDark : styles.dividerLight]} />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, isDark ? styles.textDark : styles.textLight]}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity onPress={handleCheckout} style={styles.checkoutBtn}>
              <Text style={styles.checkoutBtnText}>
                {isAuthenticated ? 'Proceder al pago' : 'Iniciar sesión para pagar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Vaciar carrito</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333333',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
    marginBottom: 4,
  },
  priceRow: {
    marginBottom: 6,
  },
  priceColumn: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
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
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 32,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnLight: {
    backgroundColor: '#f1f3f5',
  },
  qtyBtnDark: {
    backgroundColor: '#2e2e2e',
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyText: {
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: 'bold',
  },
  removeBtn: {
    padding: 6,
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
  shopBtn: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  shopBtnText: {
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
  summaryCard: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryLight: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e5e5e5',
  },
  summaryDark: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333333',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  dividerLight: {
    backgroundColor: '#e5e5e5',
  },
  dividerDark: {
    backgroundColor: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  checkoutBtn: {
    backgroundColor: '#4361ee',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  clearBtnText: {
    color: '#e63946',
    fontWeight: '500',
    fontSize: 13,
  },
});
