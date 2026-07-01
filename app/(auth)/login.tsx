import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { trackEvent } from '../../lib/analytics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      trackEvent('login');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoArea}>
          <Text style={styles.logo}>HITCH</Text>
          <Text style={styles.logoSub}>Rent A Car</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#444"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Email address"
          accessibilityHint="Enter your registered email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#444"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Password"
          accessibilityHint="Enter your password"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          accessibilityState={{ disabled: loading }}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={styles.buttonText}>SIGN IN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          style={styles.linkRow}
        >
          <Text style={styles.link}>
            {"Don't have an account? "}
            <Text style={styles.linkHighlight}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  inner: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 60,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 52,
  },
  logo: {
    fontSize: 56,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 14,
  },
  logoSub: {
    color: '#555',
    letterSpacing: 5,
    fontSize: 13,
    marginTop: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    alignSelf: 'flex-start',
  },
  subtitle: {
    color: '#555',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 28,
    marginTop: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 15,
    marginBottom: 14,
  },
  button: {
    width: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 3,
  },
  linkRow: {
    paddingVertical: 8,
  },
  link: {
    color: '#555',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#D4AF37',
    fontWeight: '600',
  },
});
