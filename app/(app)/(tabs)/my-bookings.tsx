import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/auth';
import { trackEvent } from '../../../lib/analytics';

type Booking = {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  cars: {
    name: string;
    model: string;
  } | null;
};

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    trackEvent('screen_view', { screen: 'my_bookings' });
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, cars(name, model)')
      .eq('user_id', user?.id)
      .order('start_date', { ascending: false });
    if (data) setBookings(data);
    setLoading(false);
  };

  const cancelBooking = (id: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('bookings')
              .update({ status: 'cancelled' })
              .eq('id', id);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              trackEvent('booking_cancelled', { booking_id: id });
              fetchBookings();
            }
          },
        },
      ]
    );
  };

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'confirmed': return '#4CAF50';
      case 'pending':   return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'completed': return '#D4AF37';
      default:          return '#888';
    }
  };

  const getDays = (start: string, end: string) =>
    Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000);

  const renderBooking = ({ item }: { item: Booking }) => {
    const days = getDays(item.start_date, item.end_date);
    const color = statusColor(item.status);

    return (
      <View style={styles.card} accessibilityLabel={`Booking for ${item.cars?.name ?? 'Car'}, status ${item.status}`}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text style={styles.carName}>{item.cars?.name ?? 'Car'}</Text>
            <Text style={styles.carModel}>{item.cars?.model ?? ''}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { borderColor: color + '44', backgroundColor: color + '18' },
            ]}
            accessibilityLabel={`Status: ${item.status}`}
          >
            <Text style={[styles.statusText, { color }]}>
              {item.status
                ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                : 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.datesRow}>
          <View>
            <Text style={styles.dateLabel}>Pick-up</Text>
            <Text style={styles.dateValue}>{item.start_date}</Text>
          </View>
          <View style={styles.durationChip}>
            <Text style={styles.durationText}>{days}d</Text>
          </View>
          <View style={styles.dateRight}>
            <Text style={[styles.dateLabel, styles.textRight]}>Return</Text>
            <Text style={[styles.dateValue, styles.textRight]}>
              {item.end_date}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total paid</Text>
          <Text style={styles.price}>
            PKR {item.total_price.toLocaleString()}
          </Text>
        </View>

        {(item.status === 'pending' || item.status === 'confirmed') && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => cancelBooking(item.id)}
            accessibilityRole="button"
            accessibilityLabel="Cancel this booking"
          >
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/feedback' as any)}
          style={styles.feedbackBtn}
          accessibilityRole="button"
          accessibilityLabel="Add feedback"
        >
          <Text style={styles.feedbackBtnText}>+ Feedback</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#D4AF37" size="large" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>
            Your booking history will appear here
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.replace('/(app)/(tabs)/home' as any)}
            accessibilityRole="button"
            accessibilityLabel="Browse available cars"
          >
            <Text style={styles.browseBtnText}>Browse Cars</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  feedbackBtn: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  feedbackBtnText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
  },
  browseBtn: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseBtnText: {
    color: '#D4AF37',
    fontWeight: '600',
    fontSize: 15,
  },
  list: {
    padding: 20,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  carModel: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginVertical: 14,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateLabel: {
    color: '#555',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateValue: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '600',
  },
  durationChip: {
    flex: 1,
    alignItems: 'center',
  },
  durationText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
  },
  dateRight: {
    alignItems: 'flex-end',
  },
  textRight: {
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingTop: 14,
  },
  priceLabel: {
    color: '#666',
    fontSize: 13,
  },
  price: {
    color: '#D4AF37',
    fontSize: 19,
    fontWeight: '800',
  },
  cancelBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F4433622',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F443360A',
  },
  cancelBtnText: { color: '#F44336', fontSize: 13, fontWeight: '700' },
});
