import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from '@/components/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';

export default function LoginScreen() {
  const { login } = useAuth();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      
      // Redirect to target screen or default to profile
      if (redirect === 'checkout') {
        router.replace('/checkout');
      } else {
        router.replace('/profile');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          tintColor={isDark ? '#ffffff' : '#000000'}
          size={24}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
          Iniciar Sesión
        </Text>
        <Text style={[styles.subtitle, isDark ? styles.textGreyDark : styles.textGreyLight]}>
          ¡Qué bueno verte de nuevo! Ingresa tus datos para continuar.
        </Text>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            Correo electrónico
          </Text>
          <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={isDark ? '#666' : '#999'}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, isDark ? styles.textDark : styles.textLight]}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            Contraseña
          </Text>
          <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={isDark ? '#666' : '#999'}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, isDark ? styles.textDark : styles.textLight]}
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[styles.submitBtn, loading && styles.btnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        {/* Switch to Register */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            ¿No tienes una cuenta?
          </Text>
          <TouchableOpacity onPress={() => router.push(`/(auth)/register?redirect=${redirect || ''}`)}>
            <Text style={styles.footerLink}> Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  bgLight: {
    backgroundColor: '#ffffff',
  },
  bgDark: {
    backgroundColor: '#121212',
  },
  backBtn: {
    padding: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  inputWrapper: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputLight: {
    borderColor: '#e5e5e5',
    backgroundColor: '#f8f9fa',
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
  submitBtn: {
    backgroundColor: '#4361ee',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDisabled: {
    backgroundColor: '#a0a0a0',
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
  },
  footerLink: {
    color: '#4361ee',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
