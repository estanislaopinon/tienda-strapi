import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from '@/components/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      
      // Redirect to target screen or default to profile
      if (redirect === 'checkout') {
        router.replace('/checkout');
      } else {
        router.replace('/profile');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al registrar el usuario. El nombre de usuario o correo podría estar en uso.');
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
          Crear Cuenta
        </Text>
        <Text style={[styles.subtitle, isDark ? styles.textGreyDark : styles.textGreyLight]}>
          Regístrate para comenzar a comprar en la tienda de tecnología.
        </Text>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            Nombre de usuario
          </Text>
          <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="ejemplo123"
              placeholderTextColor={isDark ? '#666' : '#999'}
              autoCapitalize="none"
              style={[styles.input, isDark ? styles.textDark : styles.textLight]}
            />
          </View>
        </View>

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

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            Confirmar contraseña
          </Text>
          <View style={[styles.inputWrapper, isDark ? styles.inputDark : styles.inputLight]}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
          onPress={handleRegister}
          disabled={loading}
          style={[styles.submitBtn, loading && styles.btnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        {/* Switch to Login */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark ? styles.textGreyDark : styles.textGreyLight]}>
            ¿Ya tienes una cuenta?
          </Text>
          <TouchableOpacity onPress={() => router.replace(`/(auth)/login?redirect=${redirect || ''}`)}>
            <Text style={styles.footerLink}> Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
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
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
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
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
