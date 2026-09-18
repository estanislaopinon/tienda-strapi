import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useCart } from '../../context/CartContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { cartCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#222222' : '#e5e5e5',
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tienda',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'house',
                android: 'home',
                web: 'home',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'heart',
                android: 'favorite',
                web: 'favorite',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'cart',
                android: 'shopping_cart',
                web: 'shopping_cart',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mi Cuenta',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'person',
                android: 'person',
                web: 'person',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
