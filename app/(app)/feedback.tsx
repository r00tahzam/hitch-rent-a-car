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
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/auth';

type CarOption = {
  id: string;
  name: string;
  model: string;
};

export default function FeedbackScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [selectedCar, setSelectedCar] = useState<CarOption | null>(null);
  const [cars, setCars] = useState<CarOption[]>([]);
  const [showCarPicker, setShowCarPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);

  const userName =
    (user?.user_metadata?.name as string) ||
    user?.email?.split('@')[0] ||
    'User';

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('car_id, cars(id, name, model)')
      .eq('user_id', user?.id);

    if (bookings && bookings.length > 0) {
      const seen = new Set<string>();
      const unique: CarOption[] = [];
      bookings.forEach((b: any) => {
        if (b.cars && !seen.has(b.car_id)) {
          seen.add(b.car_id);
          unique.push(b.cars);
        }
      });
      setCars(unique);
    } else {
      const { data: allCars } = await supabase
        .from('cars')
        .select('id, name, model')
        .order('name');
      if (allCars) setCars(allCars);
    }
    setCarsLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedCar) {
      Alert.alert('Select a Car', 'Please select which car your feedback is about.');
      return;
    }
    if (message.trim().length < 10) {
      Alert.alert('Too Short', 'Please write at least a sentence of feedback.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id,
      user_name: userName,
      car_id: selectedCar.id,
      car_name: `${selectedCar.name} ${selectedCar.model}`,
      message: message.trim(),
    });
    setSubmitting(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Thank You!', 'Your feedback has been submitted successfully.', [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerEmoji}>⭐</Text>
          <Text style={styles.headerTitle}>Share Your Experience</Text>
          <Text style={styles.headerSub}>Your feedback helps us serve you better</Text>
        </View>

        {/* Name — read only */}
        <Text style={styles.label}>Your Name</Text>
        <View style={styles.readonlyBox}>
          <Text style={styles.readonlyText}>{userName}</Text>
        </View>

        {/* Car selector */}
        <Text style={styles.label}>Car You Rented</Text>
        <TouchableOpacity
          style={[styles.selector, selectedCar && styles.selectorFilled]}
          onPress={() => setShowCarPicker(true)}
          activeOpacity={0.8}
        >
          {carsLoading ? (
            <ActivityIndicator color="#555" size="small" />
          ) : selectedCar ? (
            <View>
              <Text style={styles.selectorCarName}>{selectedCar.name}</Text>
              <Text style={styles.selectorCarModel}>{selectedCar.model}</Text>
            </View>
          ) : (
            <Text style={styles.selectorPlaceholder}>Tap to select a car</Text>
          )}
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Message */}
        <Text style={styles.label}>Your Feedback</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your experience — car condition, pickup process, overall service..."
          placeholderTextColor="#2e2e2e"
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{message.length} characters</Text>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <Text style={styles.submitText}>SUBMIT FEEDBACK</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Car Picker Modal */}
      <Modal visible={showCarPicker} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select a Car</Text>
            <FlatList
              data={cars}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.carItem}
                  onPress={() => {
                    setSelectedCar(item);
                    setShowCarPicker(false);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.carItemInfo}>
                    <Text style={styles.carItemName}>{item.name}</Text>
                    <Text style={styles.carItemModel}>{item.model}</Text>
                  </View>
                  {selectedCar?.id === item.id && (
                    <Text style={styles.tick}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { padding: 24, paddingBottom: 52 },

  // Header card
  headerCard: {
    backgroundColor: '#111',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#D4AF3726',
  },
  headerEmoji: { fontSize: 38, marginBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  headerSub: { color: '#555', fontSize: 13, textAlign: 'center' },

  // Form
  label: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  readonlyBox: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1e1e1e',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 20,
  },
  readonlyText: { color: '#444', fontSize: 15 },

  selector: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorFilled: { borderColor: '#D4AF3755' },
  selectorCarName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  selectorCarModel: { color: '#666', fontSize: 12, marginTop: 2 },
  selectorPlaceholder: { color: '#333', fontSize: 15 },
  chevron: { color: '#555', fontSize: 22 },

  textArea: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    color: '#fff',
    fontSize: 15,
    lineHeight: 24,
    minHeight: 160,
    marginBottom: 8,
  },
  charCount: {
    color: '#2e2e2e',
    fontSize: 11,
    textAlign: 'right',
    marginBottom: 28,
  },

  submitBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.45 },
  submitText: {
    color: '#0a0a0a',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 3,
  },

  // Car picker modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f0f0f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 44,
    maxHeight: '65%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  carItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  carItemInfo: { flex: 1 },
  carItemName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  carItemModel: { color: '#666', fontSize: 12, marginTop: 2 },
  tick: { color: '#D4AF37', fontSize: 18, fontWeight: '800' },
  separator: { height: 1, backgroundColor: '#181818' },
});
