import React, { useState, useRef, useEffect } from 'react';
const R2_BASE_URL = "https://pub-52a7337cc0c34226bcd23333580143ba.r2.dev";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { fetchAllPostsApi } from 'src/api/imagePost';
import { useIsFocused } from '@react-navigation/native';



// --- DIMENSIONS & SPACING ---
const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const SIDE_PADDING = 12;
const CARD_WIDTH = (width - SIDE_PADDING * 2 - COLUMN_GAP) / 2;

// --- TYPES ---
interface ImagePost {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  likes: number; // ✅ REQUIRED
  images: { high: string; low: string }[];
  user: {
    username: string;
  };
}

const getStableHeight = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 220 + (Math.abs(hash) % 120);
};

export default function HomeScreen({ scrollY }: { scrollY: Animated.Value }) {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [posts, setPosts] = useState<ImagePost[]>([]);

  /* ---------- FETCH POSTS ---------- */
useEffect(() => {
  if (!isFocused) return;

  fetchAllPostsApi()
    .then(res => setPosts(res.data))
    .catch(err => console.log(err.response?.data));
}, [isFocused]);

useEffect(() => {
}, [posts]);
  /* ---------- SMART HEADER ANIMATION ---------- */
  const scrollYClamped = Animated.diffClamp(scrollY, 0, 100);

  const headerTranslate = scrollYClamped.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollYClamped.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  /* ---------- MASONRY LAYOUT ---------- */
  const leftCol: any[] = [];
  const rightCol: any[] = [];

  let leftHeight = 0;
  let rightHeight = 0;

  posts.forEach(post => {
  console.log('IMAGE URL:', post.images?.[0]?.low);


    const height = getStableHeight(post._id);


    const item = { ...post, height };

    if (leftHeight <= rightHeight) {
      leftCol.push(item);
      leftHeight += height;
    } else {
      rightCol.push(item);
      rightHeight += height;
    }
  });

  return (
    <View style={styles.root}>
      <View style={styles.statusBarBg} />

      {/* HEADER */}
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

      {/* FEED */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
      <View style={styles.masonryContainer}>
  {/* LEFT COLUMN */}
  <View style={styles.column}>
    {leftCol.map(item => {
const coverImageUrl = (() => {
  if (!item.images || item.images.length === 0) return undefined;

  let url = "";

  if (Array.isArray(item.images[0])) {
    url = item.images[0][0]?.low || "";
  } else {
    url = item.images[0]?.low || "";
  }

  if (!url) return undefined;

  // ✅ Only use URLs that include Cloudflare (your public R2)
  if (url.includes("r2.cloudflarestorage.com")) {
    // Optionally, convert to your pub-52a7337cc0c34226bcd23333580143ba.r2.dev base
    const filename = url.split("/").pop(); // get just the file name
    return `${R2_BASE_URL}/${filename}`;
  }

  // Otherwise ignore (local host or unknown)
  return undefined;
})();
    console.log('coverImageUrl (left):', coverImageUrl);

      return (
        <TouchableOpacity
          key={item._id}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Item', { post: item })}
          style={[styles.card, { height: item.height }]}
        >
          <Image
            source={{ uri: coverImageUrl }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>
              {item.user?.username ?? 'Unknown'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </View>

  {/* RIGHT COLUMN */}
  <View style={styles.column}>
    {rightCol.map(item => {
const coverImageUrl = (() => {
  if (!item.images || item.images.length === 0) return undefined;

  let url = "";

  if (Array.isArray(item.images[0])) {
    url = item.images[0][0]?.low || "";
  } else {
    url = item.images[0]?.low || "";
  }

  if (!url) return undefined;

  // ✅ Only use URLs that include Cloudflare (your public R2)
  if (url.includes("r2.cloudflarestorage.com")) {
    // Optionally, convert to your pub-52a7337cc0c34226bcd23333580143ba.r2.dev base
    const filename = url.split("/").pop(); // get just the file name
    return `${R2_BASE_URL}/${filename}`;
  }

  // Otherwise ignore (local host or unknown)
  return undefined;
})();
    console.log('coverImageUrl (right ):', coverImageUrl);


      return (
        <TouchableOpacity
          key={item._id}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Item', { post: item })}
          style={[styles.card, { height: item.height }]}
        >
          <Image
            source={{ uri: coverImageUrl }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>
              {item.user?.username ?? 'Unknown'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
</View>

      </Animated.ScrollView>
    </View>
  );
}

/* ---------- STYLES (UNCHANGED) ---------- */
const HEADER_HEIGHT = 60;
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  statusBarBg: { height: STATUS_BAR_HEIGHT, backgroundColor: '#fff', zIndex: 20 },
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
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    elevation: 3,
  },
  logo: {
    fontFamily: 'DancingScript_700Bold',
    fontSize: 32,
    color: '#000',
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT + STATUS_BAR_HEIGHT + 10,
    paddingBottom: 100,
    paddingHorizontal: SIDE_PADDING,
  },
  masonryContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { width: CARD_WIDTH, gap: COLUMN_GAP },
  card: {
    width: '100%',
    borderRadius: 16,
    marginBottom: COLUMN_GAP,
    padding: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cardOverlay: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 10,
    borderRadius: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  cardSubtitle: { fontSize: 12, color: '#4b5563', fontWeight: '500' },
});
