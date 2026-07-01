import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PRIVACY_KEY = 'hitch_privacy_accepted';

export default function PrivacyScreen() {
  const router = useRouter();

  const handleAgree = async () => {
    await AsyncStorage.setItem(PRIVACY_KEY, 'true');
    router.replace('/(app)/(tabs)/home' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>HITCH</Text>
        <Text style={styles.headerSub}>Privacy Policy</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: May 2026</Text>

        <Text style={styles.sectionTitle}>1. Data We Collect</Text>
        <Text style={styles.body}>
          We collect the following information when you use Hitch Rent A Car:{'\n\n'}
          • Your name and email address (provided during registration){'\n'}
          • Booking details: car, dates, and total price{'\n'}
          • App usage analytics stored locally on your device{'\n'}
          • Feedback you voluntarily submit
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
        <Text style={styles.body}>
          Your data is used exclusively to:{'\n\n'}
          • Manage your account and bookings{'\n'}
          • Send booking confirmation and reminder notifications{'\n'}
          • Improve the app experience{'\n\n'}
          We do not sell, share, or trade your personal data with third parties.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Storage</Text>
        <Text style={styles.body}>
          Your account data is stored securely on Supabase servers. Usage analytics are stored locally on your device and are never transmitted to external servers.
        </Text>

        <Text style={styles.sectionTitle}>4. Notifications</Text>
        <Text style={styles.body}>
          With your permission, we send local notifications for booking confirmations and rental reminders. You can disable notifications at any time from your device settings.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.body}>
          You may request deletion of your account and associated data at any time by contacting us. Signing out removes your session from this device immediately.
        </Text>

        <Text style={styles.sectionTitle}>6. Contact</Text>
        <Text style={styles.body}>
          For privacy-related questions or data requests:{'\n'}
          ✉️  support@hitch.pk{'\n'}
          📞  +92-300-1234567
        </Text>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          By tapping "I Agree", you consent to this privacy policy.
        </Text>
        <TouchableOpacity
          style={styles.agreeBtn}
          onPress={handleAgree}
          accessibilityRole="button"
          accessibilityLabel="Agree to privacy policy and continue"
        >
          <Text style={styles.agreeBtnText}>I Agree & Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#181818',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 8,
  },
  headerSub: {
    color: '#555',
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 1,
  },
  scroll: { flex: 1 },
  content: { padding: 24 },
  updated: { color: '#444', fontSize: 12, marginBottom: 24 },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 20,
    letterSpacing: 0.3,
  },
  body: {
    color: '#888',
    fontSize: 13,
    lineHeight: 22,
  },
  spacer: { height: 24 },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#181818',
    gap: 12,
  },
  footerNote: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
  },
  agreeBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  agreeBtnText: {
    color: '#0a0a0a',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
