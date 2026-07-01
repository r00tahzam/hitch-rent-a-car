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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });

    if (error) {
      setLoading(false);
      Alert.alert('Registration Failed', error.message);
      return;
    }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        name: name.trim(),
        email: email.trim(),
      });
    }

    setLoading(false);
    trackEvent('register');
    Alert.alert('Account Created!', 'Welcome to Hitch. Please sign in.', [
      { text: 'Sign In', onPress: () => router.replace('/(auth)/login') },
    ]);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.logoArea}>
          <Text style={styles.logo}>HITCH</Text>
          <Text style={styles.logoSub}>Rent A Car</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us and start driving</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#444"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          accessibilityLabel="Full name"
          accessibilityHint="Enter your full name"
        />
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
          accessibilityHint="Enter your email address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min. 6 characters)"
          placeholderTextColor="#444"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Password"
          accessibilityHint="Enter a password with at least 6 characters"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Create account"
          accessibilityState={{ disabled: loading }}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
          <Text style={styles.link}>
            Already have an account?{' '}
            <Text style={styles.linkHighlight}>Sign in</Text>
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
    paddingHorizontal: 28,
    paddingVertical: 60,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 36,
  },
  backText: {
    color: '#D4AF37',
    fontSize: 16,
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
    letterSpacing: 2,
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
