import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from '@/components/useColorScheme';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserOrders();
    }
  }, [isAuthenticated, user]);

  async function fetchUserOrders() {
    setIsLoadingOrders(true);
    setError(null);
    try {
      // Fetch orders for the logged-in user, sorted newest first
      const res = await apiFetch('/api/orders?sort=createdAt:desc');
      setOrders(res?.data || []);
    } catch (e: any) {
      console.error('Error fetching orders:', e);
      setError('No se pudieron cargar tus pedidos');
    } finally {
      setIsLoadingOrders(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    setOrders([]);
    router.replace('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#2a9d8f';
      case 'processing': return '#e9c46a';
      case 'pending': return '#f4a261';
      case 'cancelled': return '#e63946';
      default: return '#8e9aaf';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'processing': return 'Procesando';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const { orderId, total, status, items, createdAt } = item.attributes;
    const formattedDate = new Date(createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const statusColor = getStatusColor(status);
    const itemList = items || [];

    return (
      <View style={[styles.orderCard, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.orderHeader}>
          <Text style={[styles.orderId, isDark ? styles.textDark : styles.textLight]}>{orderId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {translateStatus(status)}
            </Text>
          </View>
        </View>

        <Text style={[styles.orderDate, isDark ? styles.textGreyDark : styles.textGreyLight]}>
          Fecha: {formattedDate}
        </Text>

        <View style={[styles.itemDivider, isDark ? styles.dividerDark : styles.dividerLight]} />

        {/* Item List Summary */}
        <View style={styles.itemsSummary}>
          {itemList.map((itm: any, idx: number) => (
            <View key={idx} style={styles.itemSummaryRow}>
              <Text style={[styles.itemSummaryQty, isDark ? styles.textGreyDark : styles.textGreyLight]}>
                {itm.quantity}x
              </Text>
              <Text style={[styles.itemSummaryName, isDark ? styles.textDark : styles.textLight]} numberOfLines={1}>
                {itm.name}
              </Text>
              <Text style={[styles.itemSummaryPrice, isDark ? styles.textDark : styles.textLight]}>
                ${(itm.finalPrice * itm.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.itemDivider, isDark ? styles.dividerDark : styles.dividerLight]} />

        <View style={styles.orderFooter}>
          <Text style={[styles.totalLabel, isDark ? styles.textDark : styles.textLight]}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  // 1. Unauthenticated State Screen
  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight, styles.center]}>
        <SymbolView
          name={{ ios: 'person.crop.circle.badge.exclamationmark', android: 'account_circle', web: 'account_circle' }}
          tintColor={isDark ? '#444' : '#ccc'}
          size={80}
        />
        
        <Text style={[styles.welcomeTitle, isDark ? styles.textDark : styles.textLight]}>
          Bienvenido a Tech Store
        </Text>
        
        <Text style={[styles.welcomeSub, isDark ? styles.textGreyDark : styles.textGreyLight]}>
          Inicia sesión para poder realizar compras, ver tus pedidos anteriores y gestionar tus favoritos.
        </Text>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerBtn}>
          <Text style={[styles.registerBtnText, isDark ? styles.textDark : styles.textLight]}>
            Crear una Cuenta
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Authenticated Profile Screen
  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* User Info Header */}
      <View style={[styles.profileHeader, isDark ? styles.headerBgDark : styles.headerBgLight]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.username.substring(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.profileDetails}>
          <Text style={[styles.username, isDark ? styles.textDark : styles.textLight]}>
            {user.username}
          </Text>
          <Text style={[styles.email, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            {user.email}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <SymbolView
            name={{ ios: 'power', android: 'logout', web: 'logout' }}
            tintColor="#e63946"
            size={22}
          />
        </TouchableOpacity>
      </View>

      {/* Order History */}
      <View style={styles.historySection}>
        <View style={styles.historyTitleRow}>
          <Text style={[styles.historyTitle, isDark ? styles.textDark : styles.textLight]}>
            Historial de Pedidos
          </Text>
          <TouchableOpacity onPress={fetchUserOrders} style={styles.refreshBtn}>
            <SymbolView
              name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
              tintColor="#4361ee"
              size={18}
            />
          </TouchableOpacity>
        </View>

        {isLoadingOrders ? (
          <View style={styles.centerHistory}>
            <ActivityIndicator size="small" color="#4361ee" />
            <Text style={[styles.loadingText, isDark ? styles.textGreyDark : styles.textGreyLight]}>
              Cargando historial...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerHistory}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.centerHistory}>
            <SymbolView
              name={{ ios: 'shippingbox', android: 'archive', web: 'archive' }}
              tintColor={isDark ? '#444' : '#ccc'}
              size={36}
            />
            <Text style={[styles.noOrdersText, isDark ? styles.textGreyDark : styles.textGreyLight]}>
              Aún no has realizado ningún pedido
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  welcomeSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  loginBtn: {
    backgroundColor: '#4361ee',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  registerBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  registerBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerBgLight: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e5e5',
  },
  headerBgDark: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333333',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 14,
  },
  username: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
  },
  logoutBtn: {
    padding: 10,
  },
  historySection: {
    flex: 1,
    padding: 16,
  },
  historyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshBtn: {
    padding: 6,
  },
  centerHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
  },
  noOrdersText: {
    fontSize: 13,
    marginTop: 10,
  },
  errorText: {
    color: '#e63946',
    fontSize: 13,
  },
  ordersList: {
    paddingBottom: 20,
  },
  orderCard: {
    borderRadius: 16,
    padding: 14,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 11,
    marginBottom: 8,
  },
  itemDivider: {
    height: 1,
    marginVertical: 10,
  },
  dividerLight: {
    backgroundColor: '#e5e5e5',
  },
  dividerDark: {
    backgroundColor: '#333333',
  },
  itemsSummary: {
    gap: 6,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemSummaryQty: {
    fontSize: 12,
    width: 24,
    fontWeight: '600',
  },
  itemSummaryName: {
    fontSize: 12,
    flex: 1,
    paddingRight: 10,
  },
  itemSummaryPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4361ee',
  },
});
