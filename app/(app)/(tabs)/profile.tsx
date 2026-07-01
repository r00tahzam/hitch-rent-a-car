import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/auth';
import { getEventSummary } from '../../../lib/analytics';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [bookingCount, setBookingCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [eventSummary, setEventSummary] = useState<Record<string, number>>({});

  useEffect(() => {
    setName((user?.user_metadata?.name as string) || user?.email?.split('@')[0] || '');
    fetchStats();
    getEventSummary().then(setEventSummary);
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('user_id', user?.id);
    if (data) {
      setBookingCount(data.length);
      setTotalSpent(data.reduce((sum, b) => sum + (b.total_price || 0), 0));
    }
    setLoadingStats(false);
  };

  const saveName = async () => {
    if (!name.trim()) return;
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
    setSavingName(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setEditingName(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const totalEvents = Object.values(eventSummary).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar} accessibilityLabel={`Avatar: ${name || 'User'}`}>
            <Text style={styles.avatarLetter}>
              {name ? name[0].toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        {/* Name */}
        <Text style={styles.label}>Display Name</Text>
        {editingName ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              autoFocus
              placeholderTextColor="#555"
              accessibilityLabel="Display name input"
              accessibilityHint="Enter your display name"
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={saveName}
              disabled={savingName}
              accessibilityRole="button"
              accessibilityLabel="Save name"
            >
              {savingName ? (
                <ActivityIndicator color="#0a0a0a" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.nameRow}
            onPress={() => setEditingName(true)}
            accessibilityRole="button"
            accessibilityLabel={`Edit display name: ${name || 'not set'}`}
          >
            <Text style={styles.nameText}>{name || '—'}</Text>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <Text style={styles.label}>Your Activity</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            {loadingStats ? (
              <ActivityIndicator color="#D4AF37" />
            ) : (
              <Text style={styles.statNumber}>{bookingCount}</Text>
            )}
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={styles.statCard}>
            {loadingStats ? (
              <ActivityIndicator color="#D4AF37" />
            ) : (
              <Text style={styles.statNumber}>
                PKR {totalSpent.toLocaleString()}
              </Text>
            )}
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Analytics */}
        <Text style={styles.label}>App Stats</Text>
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsRow}>
            <Text style={styles.analyticsKey}>Total Actions</Text>
            <Text style={styles.analyticsVal}>{totalEvents}</Text>
          </View>
          {Object.entries(eventSummary).map(([event, count]) => (
            <View key={event} style={styles.analyticsRow}>
              <Text style={styles.analyticsKey}>
                {event.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
              <Text style={styles.analyticsVal}>{count}</Text>
            </View>
          ))}
        </View>

        {/* Quick links */}
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/(app)/feedback' as any)}
          accessibilityRole="button"
          accessibilityLabel="Give feedback"
        >
          <Text style={styles.linkText}>Give Feedback</Text>
          <Text style={styles.linkChevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/(app)/privacy' as any)}
          accessibilityRole="button"
          accessibilityLabel="View privacy policy"
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Text style={styles.linkChevron}>›</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out of your account"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#181818',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  inner: { padding: 24, paddingBottom: 52 },

  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#D4AF3722',
    borderWidth: 2,
    borderColor: '#D4AF3755',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: { color: '#D4AF37', fontSize: 36, fontWeight: '800' },
  emailText: { color: '#555', fontSize: 14 },

  label: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 10,
  },

  nameRow: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  nameText: { color: '#fff', fontSize: 16 },
  editIcon: { color: '#555', fontSize: 18 },

  editRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#D4AF3755',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { color: '#0a0a0a', fontWeight: '800', fontSize: 14 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    gap: 6,
  },
  statNumber: { color: '#D4AF37', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#555', fontSize: 12, textAlign: 'center' },

  analyticsCard: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    marginBottom: 28,
    gap: 10,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsKey: { color: '#888', fontSize: 13 },
  analyticsVal: { color: '#D4AF37', fontSize: 14, fontWeight: '700' },

  linkRow: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: { color: '#fff', fontSize: 15 },
  linkChevron: { color: '#555', fontSize: 22 },

  signOutBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F4433622',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F443360A',
  },
  signOutText: { color: '#F44336', fontSize: 15, fontWeight: '700' },
});
