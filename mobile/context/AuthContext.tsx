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

/**
 * Contexto global para administrar la autenticación de usuarios,
 * sesión JWT y almacenamiento persistente local en el dispositivo.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Carga la sesión guardada en AsyncStorage al abrir la app
   * y valida si el token JWT sigue vigente consultando al backend.
   */
  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verificación asíncrona de vigencia del token
        try {
          const freshUser = await apiFetch('/api/users/me');
          if (freshUser) {
            setUser(freshUser);
            await AsyncStorage.setItem('auth_user', JSON.stringify(freshUser));
          }
        } catch (e) {
          // Token expirado o inválido -> cerrar sesión automáticamente
          console.log('Error de verificación de token almacenado:', e);
          await logout();
        }
      }
    } catch (e) {
      console.error('Error al cargar autenticación almacenada:', e);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Inicia sesión con usuario/email y contraseña.
   */
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

  /**
   * Registra un nuevo usuario en la plataforma.
   */
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

  /**
   * Cierra la sesión activa y elimina las credenciales del almacenamiento local.
   */
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

/**
 * Hook personalizado para acceder fácilmente al contexto de Autenticación.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
