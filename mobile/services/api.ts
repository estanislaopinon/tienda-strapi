import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:1337';
  }

  // Extract host IP dynamically from Expo hostUri when running on Expo Go or dev builds
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoGo?.developer?.tool;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:1337`;
    }
  }

  // Fallback for Android emulator vs iOS simulator / localhost
  return Platform.OS === 'android' ? 'http://10.0.2.2:1337' : 'http://localhost:1337';
};

export const API_URL = getBaseUrl();

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const token = await AsyncStorage.getItem('auth_token');

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  if (options.data) {
    fetchOptions.body = JSON.stringify(options.data);
  }

  const response = await fetch(path.startsWith('http') ? path : `${API_URL}${path}`, fetchOptions);

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData?.error?.message || errorData?.message || errorMessage;
    } catch (e) {
      // response is not json
    }
    throw new Error(errorMessage);
  }

  // Handle responses that are blank/no content (like 204)
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
