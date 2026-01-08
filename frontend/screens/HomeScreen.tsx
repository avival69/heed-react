import React, { useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ---------- Dummy Data ---------- */
const generateData = () =>
  Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    height: Math.floor(Math.random() * 150) + 150,
    color: `hsl(${Math.random() * 360},70%,80%)`,
    title: `Post ${i + 1}`,
  }));

export default function HomeScreen({
  scrollY,
}: {
  scrollY: Animated.Value;
}) {
  const [data] = useState(generateData());

  /* Pinterest-style balancing */
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
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ---------- INSTAGRAM-LIKE HEADER ---------- */}
      <View style={styles.header}>
        <Text
          style={styles.logo}
        >
          Heed
        </Text>
      </View>

      {/* ---------- MASONRY ---------- */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.masonryRow}>
          {/* Left */}
          <View style={styles.column}>
            {left.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { height: item.height, backgroundColor: item.color },
                ]}
              >
                <Text style={styles.cardText}>{item.title}</Text>
              </View>
            ))}
          </View>

          {/* Right */}
          <View style={styles.column}>
            {right.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { height: item.height, backgroundColor: item.color },
                ]}
              >
                <Text style={styles.cardText}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  logo: {
    fontFamily: 'DancingScript_700Bold',
    fontSize: 42,        // 🔥 BIG
    color: '#000',
  },

  scrollContent: {
    paddingBottom: 140,
  },

  masonryRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    alignItems: 'flex-start',
  },

  column: {
    flex: 1,
    paddingHorizontal: 4,
  },

  card: {
    width: '100%',
    borderRadius: 26,
    marginBottom: 12,
    padding: 12,
    justifyContent: 'flex-end',
  },

  cardText: {
    fontWeight: '700',
    color: '#374151',
  },
});
