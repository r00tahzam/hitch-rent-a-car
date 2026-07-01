import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/auth';
import { trackEvent } from '../../../lib/analytics';

type Car = {
  id: string;
  name: string;
  model: string;
  price_per_day: number;
  image_url: string;
  available: boolean;
  category: string;
};

const CATEGORIES = [
  {
    key: 'budget',
    label: 'Budget',
    emoji: '🚗',
    color: '#4CAF50',
    range: 'Under PKR 7,500 / day',
    desc: 'Economical cars for everyday use',
  },
  {
    key: 'standard',
    label: 'Standard',
    emoji: '🚙',
    color: '#60A5FA',
    range: 'PKR 7,500 – 12,500 / day',
    desc: 'Comfortable & reliable rides',
  },
  {
    key: 'luxury',
    label: 'Luxury',
    emoji: '🏎️',
    color: '#D4AF37',
    range: 'PKR 13,000+ / day',
    desc: 'Premium driving experience',
  },
] as const;

export default function HomeScreen() {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    trackEvent('screen_view', { screen: 'home' });
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data } = await supabase.from('cars').select('*').order('price_per_day');
    if (data) setAllCars(data);
    setLoading(false);
  };

  const displayName =
    (user?.user_metadata?.name as string) ||
    user?.email?.split('@')[0] ||
    'Driver';

  const filteredCars = selectedCategory
    ? allCars.filter((c) => c.category === selectedCategory)
    : allCars;

  const activeCat = CATEGORIES.find((c) => c.key === selectedCategory);

  const handleCategoryPick = (key: string | null) => {
    setSelectedCategory(key);
    setShowModal(false);
  };

  const renderCar = ({ item }: { item: Car }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(app)/car/${item.id}` as any)}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name} ${item.model}, PKR ${item.price_per_day.toLocaleString()} per day, ${item.available ? 'Available' : 'Engaged'}`}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.carImage}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`${item.name} photo`}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.carEmoji}>🚗</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.carName}>{item.name}</Text>
        <Text style={styles.carModel}>{item.model}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>
            PKR {item.price_per_day.toLocaleString()}
            <Text style={styles.priceUnit}>/day</Text>
          </Text>
          <View
            style={[styles.badge, !item.available && styles.engagedBadge]}
            accessibilityLabel={`Status: ${item.available ? 'Available' : 'Engaged'}`}
          >
            <Text style={[styles.badgeText, !item.available && styles.engagedBadgeText]}>
              {item.available ? 'Available' : 'Engaged'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Category Picker Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>What are you looking for?</Text>
            <Text style={styles.sheetSub}>Choose a category to browse cars</Text>

            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.catCard, { borderColor: cat.color + '33' }]}
                onPress={() => handleCategoryPick(cat.key)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${cat.label} cars, ${cat.range}`}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + '1A' }]}>
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                </View>
                <View style={styles.catMeta}>
                  <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
                  <Text style={styles.catRange}>{cat.range}</Text>
                  <Text style={styles.catDesc}>{cat.desc}</Text>
                </View>
                <Text style={[styles.catArrow, { color: cat.color }]}>›</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.allBtn}
              onPress={() => handleCategoryPick(null)}
              accessibilityRole="button"
              accessibilityLabel="Browse all cars"
            >
              <Text style={styles.allBtnText}>Browse All Cars</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLogo}>HITCH</Text>
          <Text style={styles.welcome}>Welcome, {displayName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setShowModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Open category filter"
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <TouchableOpacity
          style={[styles.chip, selectedCategory === null && styles.chipActive]}
          onPress={() => setSelectedCategory(null)}
          accessibilityRole="button"
          accessibilityLabel="Show all cars"
          accessibilityState={{ selected: selectedCategory === null }}
        >
          <Text style={[styles.chipText, selectedCategory === null && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.chip, selectedCategory === cat.key && styles.chipActive]}
            onPress={() => setSelectedCategory(cat.key)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${cat.label}`}
            accessibilityState={{ selected: selectedCategory === cat.key }}
          >
            <Text
              style={[styles.chipText, selectedCategory === cat.key && styles.chipTextActive]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>
        {activeCat ? activeCat.label + ' Cars' : 'Our Fleet'}
        {'  '}
        <Text style={styles.sectionCount}>{filteredCars.length} cars</Text>
      </Text>

      {loading ? (
        <ActivityIndicator color="#D4AF37" size="large" style={{ marginTop: 60 }} />
      ) : filteredCars.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No cars in this category</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item.id}
          renderItem={renderCar}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f0f0f',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    paddingBottom: 44,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 22,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  sheetSub: {
    color: '#555',
    fontSize: 14,
    marginBottom: 22,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 14,
  },
  catIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catEmoji: { fontSize: 26 },
  catMeta: { flex: 1 },
  catLabel: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  catRange: { color: '#888', fontSize: 12, marginBottom: 2 },
  catDesc: { color: '#555', fontSize: 12 },
  catArrow: { fontSize: 30, lineHeight: 34 },
  allBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 2 },
  allBtnText: { color: '#555', fontSize: 14, textDecorationLine: 'underline' },

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
  headerLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 5,
  },
  welcome: { color: '#666', fontSize: 12, marginTop: 3 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  menuBtn: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  menuIcon: { color: '#D4AF37', fontSize: 16 },

  chipsRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  chipActive: { backgroundColor: '#D4AF3722', borderColor: '#D4AF37' },
  chipText: { color: '#bbb', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#D4AF37', fontWeight: '700' },

  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  sectionCount: { color: '#444', fontSize: 14, fontWeight: '400' },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  carImage: { width: '100%', height: 185 },
  imagePlaceholder: {
    width: '100%',
    height: 185,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carEmoji: { fontSize: 52 },
  cardBody: { padding: 16 },
  carName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  carModel: { fontSize: 13, color: '#666', marginTop: 3, marginBottom: 14 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 19, fontWeight: '700', color: '#D4AF37' },
  priceUnit: { fontSize: 13, fontWeight: '400', color: '#666' },
  badge: {
    backgroundColor: '#0d1f0d',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#1a3a1a',
  },
  badgeText: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
  engagedBadge: { backgroundColor: '#1f0d0d', borderColor: '#3a1a1a' },
  engagedBadgeText: { color: '#F44336' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: '#444', fontSize: 16 },
});
