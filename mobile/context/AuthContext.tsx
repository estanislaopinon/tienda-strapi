import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, passport: string) => Promise<void>;
  register: (username: string, email: string, passport: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Asynchronously check if token is still valid
        try {
          const freshUser = await apiFetch('/api/users/me');
          if (freshUser) {
            setUser(freshUser);
            await AsyncStorage.setItem('auth_user', JSON.stringify(freshUser));
          }
        } catch (e) {
          // Token expired or invalid
          console.log('Stored token verification failed:', e);
          await logout();
        }
      }
    } catch (e) {
      console.error('Error loading stored auth:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(identifier: string, passport: string) {
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/auth/local', {
        method: 'POST',
        data: { identifier, password: passport },
      });

      const { jwt, user: loggedUser } = response;
      
      setToken(jwt);
      setUser(loggedUser);
      
      await AsyncStorage.setItem('auth_token', jwt);
      await AsyncStorage.setItem('auth_user', JSON.stringify(loggedUser));
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(username: string, email: string, passport: string) {
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/auth/local/register', {
        method: 'POST',
        data: { username, email, password: passport },
      });

      const { jwt, user: registeredUser } = response;

      setToken(jwt);
      setUser(registeredUser);

      await AsyncStorage.setItem('auth_token', jwt);
      await AsyncStorage.setItem('auth_user', JSON.stringify(registeredUser));
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
