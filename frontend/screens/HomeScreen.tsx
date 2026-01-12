import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// --- DIMENSIONS & SPACING ---
const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const SIDE_PADDING = 12;
const CARD_WIDTH = (width - (SIDE_PADDING * 2) - COLUMN_GAP) / 2;

// --- DUMMY DATA ---
const generateData = () =>
  Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    // Random height between 180 and 300 for variation
    height: Math.floor(Math.random() * 120) + 180, 
    color: `hsl(${Math.random() * 360}, 65%, 85%)`,
    title: `Post ${i + 1}`,
  }));

export default function HomeScreen({ scrollY }: { scrollY: Animated.Value }) {
  const navigation = useNavigation<any>();
  const [data] = useState(generateData());

  /* ---------- SMART HEADER ANIMATION (diffClamp) ---------- */
  // 1. diffClamp tracks the "velocity" of the scroll locally
  const scrollYClamped = Animated.diffClamp(scrollY, 0, 100);

  // 2. Interpolate that local value to translate the header
  const headerTranslate = scrollYClamped.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100], // Slide up 100px
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollYClamped.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0], // Fade out quickly
    extrapolate: 'clamp',
  });

  /* ---------- MASONRY LAYOUT LOGIC ---------- */
  // We split items into two columns based on current column height
  const leftCol: typeof data = [];
  const rightCol: typeof data = [];
  
  let leftHeight = 0;
  let rightHeight = 0;

  data.forEach((item) => {
    if (leftHeight <= rightHeight) {
      leftCol.push(item);
      leftHeight += item.height;
    } else {
      rightCol.push(item);
      rightHeight += item.height;
    }
  });

  return (
    <View style={styles.root}>
      {/* STATUS BAR BACKGROUND (For translucent header effect) */}
      <View style={styles.statusBarBg} />

      {/* ---------- HEADER ---------- */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: headerTranslate }],
            opacity: headerOpacity,
          },
        ]}
      >
        <Text style={styles.logo}>Heed</Text>
      </Animated.View>

      {/* ---------- SCROLL FEED ---------- */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true } // Use Native Driver for smoothness
        )}
      >
        <View style={styles.masonryContainer}>
          {/* LEFT COLUMN */}
          <View style={styles.column}>
            {leftCol.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Item', { item })}
                style={[
                  styles.card,
                  {
                    height: item.height,
                    backgroundColor: item.color,
                  },
                ]}
              >
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>User Name</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* RIGHT COLUMN */}
          <View style={styles.column}>
            {rightCol.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Item', { item })}
                style={[
                  styles.card,
                  {
                    height: item.height,
                    backgroundColor: item.color,
                  },
                ]}
              >
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>User Name</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------- STYLES ---------- */
const HEADER_HEIGHT = 60;
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarBg: {
    height: STATUS_BAR_HEIGHT,
    backgroundColor: '#fff',
    zIndex: 20,
  },

  /* HEADER */
  header: {
    position: 'absolute',
    top: STATUS_BAR_HEIGHT,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    // Subtle shadow for depth
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  logo: {
    fontFamily: 'DancingScript_700Bold', // Make sure this font is loaded in App.tsx
    fontSize: 32,
    color: '#000',
  },

  /* SCROLL CONTENT */
  scrollContent: {
    paddingTop: HEADER_HEIGHT + STATUS_BAR_HEIGHT + 10, // Push content down
    paddingBottom: 100, // Space for bottom tab bar
    paddingHorizontal: SIDE_PADDING,
  },

  /* MASONRY GRID */
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: CARD_WIDTH,
    gap: COLUMN_GAP, // Native Gap (React Native 0.71+)
  },

  /* CARD STYLE */
  card: {
    width: '100%',
    borderRadius: 16,
    marginBottom: COLUMN_GAP, // Fallback spacing
    padding: 12,
    justifyContent: 'flex-end',
    // Card Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardOverlay: {
    // Optional: Gradient overlay effect could go here
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
});