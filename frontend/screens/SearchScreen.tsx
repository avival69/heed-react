import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

/* ---------- Dummy Data ---------- */
const banners = ['#c7d2fe', '#bae6fd', '#bbf7d0'];

const generateMasonryData = () =>
  Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    height: Math.floor(Math.random() * 150) + 150,
    color: `hsl(${Math.random() * 360},70%,85%)`,
    title: `Item ${i + 1}`,
    isAd: i === 5 || i === 13,
  }));

export default function SearchScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [data] = useState(generateMasonryData());

  /* Masonry balance */
  const left: typeof data = [];
  const right: typeof data = [];
  let lh = 0;
  let rh = 0;

  data.forEach((item) => {
    if (lh <= rh) {
      left.push(item);
      lh += item.height;
    } else {
      right.push(item);
      rh += item.height;
    }
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ---------- SEARCH BAR ---------- */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search professionals, services..."
          placeholderTextColor="#6b7280"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ---------- BANNER CAROUSEL ---------- */}
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {banners.map((color, index) => (
            <View
              key={index}
              style={[styles.banner, { backgroundColor: color }]}
            />
          ))}
        </Animated.ScrollView>

        {/* ---------- DOTS ---------- */}
        <View style={styles.dotsContainer}>
          {banners.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[styles.dot, { opacity }]}
              />
            );
          })}
        </View>

        {/* ---------- TRENDING ---------- */}
        <Text style={styles.sectionTitle}>Trending</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {['Design', 'Doctor', 'Legal', 'Fitness'].map((item, i) => (
            <View key={i} style={styles.trendingCard}>
              <Text style={styles.trendingText}>{item}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ---------- FOR YOU ---------- */}
        <Text style={styles.sectionTitle}>For You</Text>

        <View style={styles.masonryRow}>
          <View style={styles.column}>
            {left.map((item) =>
              item.isAd ? (
                <View key={item.id} style={styles.adCard}>
                  <Text style={styles.adText}>Sponsored</Text>
                </View>
              ) : (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    { height: item.height, backgroundColor: item.color },
                  ]}
                >
                  <Text style={styles.cardText}>{item.title}</Text>
                </View>
              )
            )}
          </View>

          <View style={styles.column}>
            {right.map((item) =>
              item.isAd ? (
                <View key={item.id} style={styles.adCard}>
                  <Text style={styles.adText}>Ad</Text>
                </View>
              ) : (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    { height: item.height, backgroundColor: item.color },
                  ]}
                >
                  <Text style={styles.cardText}>{item.title}</Text>
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  searchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },

  searchInput: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    fontSize: 16,
  },

  banner: {
    width: width - 24,
    height: 160,
    marginHorizontal: 12,
    borderRadius: 20,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111827',
    marginHorizontal: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 12,
    marginTop: 20,
    marginBottom: 12,
    color: '#111827',
  },

  trendingCard: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
  },

  trendingText: {
    fontWeight: '600',
    color: '#111827',
  },

  masonryRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },

  column: {
    flex: 1,
    paddingHorizontal: 4,
  },

  card: {
    width: '100%',
    borderRadius: 20,
    marginBottom: 12,
    padding: 12,
    justifyContent: 'flex-end',
  },

  cardText: {
    fontWeight: '700',
    color: '#374151',
  },

  adCard: {
    height: 120,
    backgroundColor: '#fde68a',
    borderRadius: 20,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  adText: {
    fontWeight: '800',
    color: '#92400e',
  },
});
