import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/auth';
import { trackEvent } from '../../../lib/analytics';
import { sendBookingConfirmation, scheduleBookingReminder } from '../../../lib/notifications';

type Car = {
  id: string;
  name: string;
  model: string;
  price_per_day: number;
};

export default function BookingScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [carLoading, setCarLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCar();
  }, [carId]);

  const fetchCar = async () => {
    const { data } = await supabase
      .from('cars')
      .select('id, name, model, price_per_day')
      .eq('id', carId)
      .single();
    if (data) setCar(data);
    setCarLoading(false);
  };

  const isValidDate = (d: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
    return !isNaN(new Date(d).getTime());
  };

  const getDays = () => {
    if (!isValidDate(startDate) || !isValidDate(endDate)) return 0;
    const diff = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        86400000
    );
    return diff > 0 ? diff : 0;
  };

  const totalDays = getDays();
  const totalPrice = car ? totalDays * car.price_per_day : 0;

  const handleConfirm = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please enter both start and end dates');
      return;
    }
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      Alert.alert('Error', 'Use format YYYY-MM-DD (e.g. 2026-06-15)');
      return;
    }
    if (totalDays <= 0) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(startDate) < today) {
      Alert.alert('Error', 'Start date cannot be in the past');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('bookings').insert({
      user_id: user?.id,
      car_id: carId,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      status: 'confirmed',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Booking Failed', error.message);
      return;
    }

    trackEvent('booking_created', { car_id: carId, days: totalDays, total: totalPrice });
    sendBookingConfirmation(car?.name ?? 'Car', totalDays, totalPrice);
    scheduleBookingReminder(car?.name ?? 'Car', startDate);

    Alert.alert(
      'Booking Confirmed!',
      `${car?.name} booked for ${totalDays} day${totalDays !== 1 ? 's' : ''}.\nTotal: PKR ${totalPrice.toLocaleString()}`,
      [
        {
          text: 'View Bookings',
          onPress: () => router.replace('/(app)/(tabs)/my-bookings' as any),
        },
      ]
    );
  };

  if (carLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#D4AF37" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {car && (
          <View style={styles.carCard}>
            <Text style={styles.carCardLabel}>Booking for</Text>
            <Text style={styles.carCardName}>{car.name}</Text>
            <Text style={styles.carCardModel}>{car.model}</Text>
            <Text style={styles.carCardRate}>
              PKR {car.price_per_day.toLocaleString()} / day
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.formTitle}>Select Dates</Text>
          <Text style={styles.hint}>Enter dates in YYYY-MM-DD format</Text>

          <Text style={styles.label}>Pick-up Date</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-06-15"
            placeholderTextColor="#333"
            value={startDate}
            onChangeText={setStartDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            accessibilityLabel="Pick-up date"
            accessibilityHint="Enter date in YYYY-MM-DD format"
          />

          <Text style={styles.label}>Return Date</Text>
          <TextInput
            style={styles.input}
            placeholder="2026-06-20"
            placeholderTextColor="#333"
            value={endDate}
            onChangeText={setEndDate}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            accessibilityLabel="Return date"
            accessibilityHint="Enter date in YYYY-MM-DD format"
          />
        </View>

        {totalDays > 0 && car && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Duration</Text>
              <Text style={styles.summaryVal}>
                {totalDays} day{totalDays !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Daily rate</Text>
              <Text style={styles.summaryVal}>
                PKR {car.price_per_day.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalKey}>Total</Text>
              <Text style={styles.totalVal}>
                PKR {totalPrice.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (loading || totalDays === 0) && styles.btnDisabled,
          ]}
          onPress={handleConfirm}
          disabled={loading || totalDays === 0}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Confirm booking"
          accessibilityState={{ disabled: loading || totalDays === 0 }}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={styles.confirmBtnText}>CONFIRM BOOKING</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    padding: 24,
    paddingBottom: 52,
  },
  carCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4AF3726',
  },
  carCardLabel: {
    color: '#555',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  carCardName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  carCardModel: {
    color: '#666',
    fontSize: 14,
    marginTop: 3,
    marginBottom: 10,
  },
  carCardRate: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
  },
  form: {
    marginBottom: 24,
  },
  formTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  hint: {
    color: '#444',
    fontSize: 12,
    marginBottom: 20,
  },
  label: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 18,
  },
  summary: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    gap: 12,
  },
  summaryTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryKey: {
    color: '#666',
    fontSize: 14,
  },
  summaryVal: {
    color: '#ccc',
    fontSize: 14,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    paddingTop: 14,
    marginTop: 2,
  },
  totalKey: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  totalVal: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  confirmBtnText: {
    color: '#0a0a0a',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
