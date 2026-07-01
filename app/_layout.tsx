import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../context/auth';
import { requestPermissions } from '../lib/notifications';
import { PRIVACY_KEY } from './(app)/privacy';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const atRoot = segments.length === 0;

    if (!session && inAppGroup) {
      router.replace('/(auth)/login');
    } else if (session && (inAuthGroup || atRoot)) {
      AsyncStorage.getItem(PRIVACY_KEY).then((accepted) => {
        if (accepted) {
          router.replace('/(app)/(tabs)/home' as any);
        } else {
          router.replace('/(app)/privacy' as any);
        }
      });
    }
  }, [session, loading, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
