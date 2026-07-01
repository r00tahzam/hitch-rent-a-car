import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#D4AF37',
        headerTitleStyle: { fontWeight: '700', color: '#D4AF37' },
        contentStyle: { backgroundColor: '#0a0a0a' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="car/[id]" options={{ title: 'Car Details' }} />
      <Stack.Screen name="booking/[carId]" options={{ title: 'Book Car' }} />
      <Stack.Screen name="feedback" options={{ title: 'Feedback' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy', headerShown: true }} />
    </Stack>
  );
}
