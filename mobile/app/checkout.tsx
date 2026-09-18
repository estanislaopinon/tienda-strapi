import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../services/api';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from '@/components/useColorScheme';
import { router } from 'expo-router';

export default function CheckoutScreen() {
  const { items, total, clearCart } = useCart();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  // Shipping Form States
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<'simulated_card' | 'cash'>('simulated_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Status States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  const handlePlaceOrder = async () => {
    if (!address.trim() || !city.trim() || !zip.trim() || !phone.trim()) {
      setErrorMsg('Por favor completa todos los campos de envío.');
      return;
    }

    if (paymentMethod === 'simulated_card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setErrorMsg('Por favor completa los datos de tu tarjeta simulada.');
        return;
      }
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      // Build order items array for backend validation
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const fullAddress = `${address.trim()}, ${city.trim()} (CP ${zip.trim()})`;

      // Call the Strapi custom order controller
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        data: {
          data: {
            items: orderItems,
            shippingAddress: fullAddress,
            contactPhone: phone.trim(),
            paymentMethod,
          },
        },
      });

      // Clear the local shopping cart
      clearCart();

      // Show success screen with response order details
      setSuccessOrder(response.data);
    } catch (e: any) {
      setErrorMsg(e.message || 'Ocurrió un error al procesar tu pedido. Por favor, reintenta.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (successOrder) {
    const { orderId, total: orderTotal, shippingAddress } = successOrder.attributes || successOrder;
    return (
      <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight, styles.center]}>
        <View style={styles.successIconWrapper}>
          <SymbolView
            name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
            tintColor="#2a9d8f"
            size={80}
          />
        </View>

        <Text style={[styles.successTitle, isDark ? styles.textDark : styles.textLight]}>
          ¡Pedido Confirmado!
        </Text>
        
        <Text style={[styles.successSub, isDark ? styles.textGreyDark : styles.textGreyLight]}>
          Tu pedido ha sido recibido y está siendo procesado por nuestro depósito.
        </Text>

        <View style={[styles.summaryCard, isDark ? styles.summaryDark : styles.summaryLight]}>
          <View style={styles.summaryRow}>
            <Text style={isDark ? styles.textGreyDark : styles.textGreyLight}>Código de Pedido</Text>
            <Text style={[styles.summaryVal, isDark ? styles.textDark : styles.textLight]}>{orderId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={isDark ? styles.textGreyDark : styles.textGreyLight}>Monto Total</Text>
            <Text style={styles.totalValue}>${orderTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={isDark ? styles.textGreyDark : styles.textGreyLight}>Dirección</Text>
            <Text style={[styles.summaryVal, isDark ? styles.textDark : styles.textLight, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
              {shippingAddress}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.replace('/')} style={styles.homeBtn}>
          <Text style={styles.homeBtnText}>Volver a la Tienda</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/profile')} style={styles.profileBtn}>
          <Text style={[styles.profileBtnText, isDark ? styles.textDark : styles.textLight]}>
            Ver mis Pedidos
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // CHECKOUT FORM
  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4361ee" />
          <Text style={styles.loadingOverlayText}>Procesando pago simulado...</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>Finalizar Compra</Text>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* 1. SHIPPING INFO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>Datos de Envío</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>Dirección de calle</Text>
            <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Av. Santa Fe 1234, 4º B"
                placeholderTextColor={isDark ? '#666' : '#999'}
                style={[styles.input, isDark ? styles.textDark : styles.textLight]}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>Ciudad</Text>
              <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="CABA"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  style={[styles.input, isDark ? styles.textDark : styles.textLight]}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>C. Postal</Text>
              <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
                <TextInput
                  value={zip}
                  onChangeText={setZip}
                  placeholder="C1425"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  style={[styles.input, isDark ? styles.textDark : styles.textLight]}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>Teléfono de contacto</Text>
            <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="1198765432"
                placeholderTextColor={isDark ? '#666' : '#999'}
                keyboardType="phone-pad"
                style={[styles.input, isDark ? styles.textDark : styles.textLight]}
              />
            </View>
          </View>
        </View>

        {/* 2. PAYMENT METHODS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>Método de Pago</Text>
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              onPress={() => setPaymentMethod('simulated_card')}
              style={[
                styles.methodBtn,
                paymentMethod === 'simulated_card' ? styles.methodBtnActive : (isDark ? styles.inputDark : styles.inputLight),
              ]}
            >
              <SymbolView
                name={{ ios: 'creditcard', android: 'credit_card', web: 'credit_card' }}
                tintColor={paymentMethod === 'simulated_card' ? '#4361ee' : (isDark ? '#888' : '#666')}
                size={20}
              />
              <Text style={[styles.methodBtnText, paymentMethod === 'simulated_card' && styles.methodBtnTextActive, isDark ? styles.textDark : styles.textLight]}>
                Tarjeta Simulada
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentMethod('cash')}
              style={[
                styles.methodBtn,
                paymentMethod === 'cash' ? styles.methodBtnActive : (isDark ? styles.inputDark : styles.inputLight),
              ]}
            >
              <SymbolView
                name={{ ios: 'banknote', android: 'payments', web: 'payments' }}
                tintColor={paymentMethod === 'cash' ? '#4361ee' : (isDark ? '#888' : '#666')}
                size={20}
              />
              <Text style={[styles.methodBtnText, paymentMethod === 'cash' && styles.methodBtnTextActive, isDark ? styles.textDark : styles.textLight]}>
                Efectivo al recibir
              </Text>
            </TouchableOpacity>
          </View>

          {/* Credit Card inputs */}
          {paymentMethod === 'simulated_card' && (
            <View style={styles.cardForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>Número de tarjeta</Text>
                <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
                  <TextInput
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="4500 1234 5678 9012"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    keyboardType="numeric"
                    style={[styles.input, isDark ? styles.textDark : styles.textLight]}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>Vencimiento</Text>
                  <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
                    <TextInput
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      placeholder="MM/AA"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                      style={[styles.input, isDark ? styles.textDark : styles.textLight]}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>CVC</Text>
                  <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
                    <TextInput
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      placeholder="123"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                      secureTextEntry
                      keyboardType="numeric"
                      style={[styles.input, isDark ? styles.textDark : styles.textLight]}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Place Order Sticky Bar */}
      <View style={[styles.footer, isDark ? styles.footerDark : styles.footerLight]}>
        <View>
          <Text style={styles.footerLabel}>Total a pagar</Text>
          <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity onPress={handlePlaceOrder} style={styles.placeBtn}>
          <Text style={styles.placeBtnText}>Confirmar Pedido</Text>
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 70, 0.3)',
  },
  errorText: {
    color: '#e63946',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  inputWrapper: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputLight: {
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  inputDark: {
    borderColor: '#333333',
    backgroundColor: '#1e1e1e',
  },
  input: {
    fontSize: 14,
    height: '100%',
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
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  methodBtnActive: {
    borderColor: '#4361ee',
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  methodBtnTextActive: {
    color: '#4361ee',
  },
  cardForm: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 16,
    fontSize: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLight: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e5e5e5',
  },
  footerDark: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333333',
  },
  footerLabel: {
    fontSize: 12,
    color: '#8e9aaf',
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  placeBtn: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  placeBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  summaryCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginBottom: 24,
  },
  summaryLight: {
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  summaryDark: {
    borderColor: '#333333',
    backgroundColor: '#1e1e1e',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  homeBtn: {
    backgroundColor: '#4361ee',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  homeBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  profileBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  profileBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
