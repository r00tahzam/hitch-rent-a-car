import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { trackEvent } from '../../../lib/analytics';

type Car = {
  id: string;
  name: string;
  model: string;
  price_per_day: number;
  image_url: string;
  available: boolean;
};

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const heroHeight = Math.round(width * 0.55);

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    const { data } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();
    if (data) {
      setCar(data);
      trackEvent('car_viewed', { car_id: id, car_name: data.name });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#D4AF37" size="large" />
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Car not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {car.image_url ? (
          <Image
            source={{ uri: car.image_url }}
            style={[styles.heroImage, { height: heroHeight }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroPlaceholder, { height: heroHeight }]}>
            <Text style={styles.heroEmoji}>🚗</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.carName}>{car.name}</Text>
              <Text style={styles.carModel}>{car.model}</Text>
            </View>
            <View
              style={[
                styles.availBadge,
                !car.available && styles.unavailBadge,
              ]}
            >
              <Text
                style={[
                  styles.availText,
                  !car.available && styles.unavailText,
                ]}
              >
                {car.available ? 'Available' : 'Engaged'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price per day</Text>
            <Text style={styles.price}>
              PKR {car.price_per_day.toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Make</Text>
              <Text style={styles.infoValue}>{car.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Model</Text>
              <Text style={styles.infoValue}>{car.model}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Daily Rate</Text>
              <Text style={styles.infoValue}>
                PKR {car.price_per_day.toLocaleString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: car.available ? '#4CAF50' : '#F44336' },
                ]}
              >
                {car.available ? 'Ready to rent' : 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {car.available && (
        <View style={styles.footer}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerPriceLabel}>per day</Text>
            <Text style={styles.footerPriceValue}>
              PKR {car.price_per_day.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => router.push(`/(app)/booking/${car.id}` as any)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Book ${car.name} now`}
          >
            <Text style={styles.bookBtnText}>BOOK NOW</Text>
          </TouchableOpacity>
        </View>
      )}
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
  errorText: {
    color: '#666',
    fontSize: 16,
  },
  heroImage: {
    width: '100%',
    height: 270,
  },
  heroPlaceholder: {
    width: '100%',
    height: 270,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 88,
  },
  body: {
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleLeft: {
    flex: 1,
  },
  carName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  carModel: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  availBadge: {
    backgroundColor: '#0d1f0d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1a3a1a',
    marginLeft: 12,
    marginTop: 4,
  },
  unavailBadge: {
    backgroundColor: '#1f0d0d',
    borderColor: '#3a1a1a',
  },
  availText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '700',
  },
  unavailText: {
    color: '#F44336',
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginVertical: 22,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#666',
    fontSize: 15,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D4AF37',
  },
  infoGrid: {
    gap: 14,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#555',
    fontSize: 14,
  },
  infoValue: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 36,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#181818',
    gap: 16,
  },
  footerPrice: {
    flex: 1,
  },
  footerPriceLabel: {
    color: '#555',
    fontSize: 12,
  },
  footerPriceValue: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '800',
  },
  bookBtn: {
    flex: 2,
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#0a0a0a',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
