import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(0.72)).current;
  const lineScale      = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY       = useRef(new Animated.Value(14)).current;
  const creditsOpacity = useRef(new Animated.Value(0)).current;
  const progress       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(lineScale, {
          toValue: 1,
          duration: 550,
          delay: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(creditsOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/(auth)/login' as any);
      } else {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const accepted = await AsyncStorage.getItem('hitch_privacy_accepted');
        router.replace(accepted ? '/(app)/(tabs)/home' as any : '/(app)/privacy' as any);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Animated.View style={[styles.line, { transform: [{ scaleX: lineScale }] }]} />

        <Animated.Text
          style={[
            styles.logo,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          HITCH
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
          ]}
        >
          RENT  ·  A  ·  CAR
        </Animated.Text>

        <Animated.View style={[styles.line, { transform: [{ scaleX: lineScale }] }]} />
      </View>

      <Animated.View style={[styles.creditsBox, { opacity: creditsOpacity }]}>
        <Text style={styles.madeByLabel}>MADE BY</Text>
        <Text style={styles.names}>Ahzam</Text>
      </Animated.View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    gap: 18,
  },
  line: {
    width: 220,
    height: 1,
    backgroundColor: '#D4AF37',
    opacity: 0.5,
  },
  logo: {
    fontSize: 72,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 18,
    textShadowColor: '#D4AF3755',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888',
    letterSpacing: 5,
  },
  creditsBox: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
    gap: 8,
  },
  madeByLabel: {
    color: '#2e2e2e',
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: '700',
  },
  names: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1.5,
    opacity: 0.75,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#181818',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#D4AF37',
  },
});
