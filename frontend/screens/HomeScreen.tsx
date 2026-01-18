import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FlatList,
  ActivityIndicator,
  RefreshControl, // ✅ Added for pull-to-refresh
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { fetchAllPostsApi } from 'src/api/imagePost';

// CONFIG
const R2_BASE_URL = "https://pub-52a7337cc0c34226bcd23333580143ba.r2.dev";
const { width } = Dimensions.get('window');
const COLUMN_GAP = 10;
const SIDE_PADDING = 10;
const CARD_WIDTH = (width - SIDE_PADDING * 2 - COLUMN_GAP) / 2;

// --- TYPES ---
interface ImagePost {
  _id: string;
  title: string;
  images: { high: string; low: string }[];
  height?: number;
  user?: { username: string };
}

// Helper to clean URLs
const getCleanImageUrl = (rawUrl?: string) => {
  if (!rawUrl) return undefined;
  if (rawUrl.includes("pub-52a7337cc0c34226bcd23333580143ba.r2.dev")) return rawUrl;
  if (rawUrl.includes("r2.cloudflarestorage.com")) {
    const filename = rawUrl.split("/").pop();
    return `${R2_BASE_URL}/${filename}`;
  }
  return rawUrl;
};

// Stable height generator
const getStableHeight = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 200 + (Math.abs(hash) % 150);
};

/* =========================================
   COMPONENT: SKELETON CARD (Loading State)
========================================= */
const SkeletonCard = ({ height }: { height: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.skeleton, { height, opacity }]} />;
};

/* =========================================
   COMPONENT: SWIPEABLE CARD (Manual Swipe)
   ✅ Replaced Auto-Timer with Horizontal FlatList
========================================= */
const SwipeableCard = React.memo(({ item, onPress }: { item: ImagePost, onPress: () => void }) => {
  const images = item.images || [];
  const hasMultiple = images.length > 1;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle Scroll to update dots
  const onScroll = useCallback((e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / CARD_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  }, [currentIndex]);

  // Render a single image item for the horizontal list
  const renderImageItem = ({ item: imgObj }: { item: any }) => {
    const url = getCleanImageUrl(Array.isArray(imgObj) ? imgObj[0]?.low : imgObj?.low);
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <Image
          source={url ? { uri: url } : undefined}
          style={{ width: CARD_WIDTH, height: item.height, backgroundColor: '#e5e7eb' }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.card, { height: item.height }]}>
      {hasMultiple ? (
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => `${item._id}_img_${i}`}
          renderItem={renderImageItem}
          onScroll={onScroll}
          scrollEventThrottle={16} // smooth updates
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH}
        />
      ) : (
        // Single Image Optimization
        renderImageItem({ item: images[0] })
      )}

      {/* Dots Indicator */}
      {hasMultiple && (
        <View style={styles.dotsContainer}>
          {images.map((_, i) => (
            <View 
              key={i} 
              style={[styles.dot, i === currentIndex && styles.activeDot]} 
            />
          ))}
        </View>
      )}
    </View>
  );
}, (prev, next) => prev.item._id === next.item._id);

/* =========================================
   MAIN SCREEN
========================================= */
export default function HomeScreen({ scrollY }: { scrollY: Animated.Value }) {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  // STATE
  const [posts, setPosts] = useState<ImagePost[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ✅ Refresh state
  const [hasMore, setHasMore] = useState(true);

  // FETCH DATA
  const loadPosts = useCallback(async (pageNum: number, isRefresh = false) => {
    if (pageNum === 1 && !isRefresh) setLoading(true);
    else if (!isRefresh) setLoadingMore(true);

    try {
      const res = await fetchAllPostsApi(pageNum, 10);
      
      const newPosts = res.data.map((p: any) => ({
        ...p,
        height: getStableHeight(p._id),
      }));

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => {
          if (isRefresh) return newPosts;
          
          // De-duplicate
          const existingIds = new Set(prev.map(p => p._id));
          const uniqueNewPosts = newPosts.filter((p: any) => !existingIds.has(p._id));
          return [...prev, ...uniqueNewPosts];
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    if (isFocused && posts.length === 0) {
      loadPosts(1, true);
    }
  }, [isFocused]);

  // HANDLERS
  const handleLoadMore = () => {
    if (!hasMore || loading || loadingMore || refreshing) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadPosts(1, true); // isRefresh = true
  };

  // MASONRY COLUMNS
  const leftCol: ImagePost[] = [];
  const rightCol: ImagePost[] = [];
  let leftHeight = 0;
  let rightHeight = 0;

  posts.forEach(item => {
    const h = item.height || 200;
    if (leftHeight <= rightHeight) {
      leftCol.push(item);
      leftHeight += h;
    } else {
      rightCol.push(item);
      rightHeight += h;
    }
  });

  // ANIMATIONS
  const scrollYClamped = Animated.diffClamp(scrollY, 0, 100);
  const headerTranslate = scrollYClamped.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.root}>
      <View style={styles.statusBarBg} />

      {/* HEADER */}
      <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslate }] }]}>
        <Text style={styles.logo}>Heed</Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        // ✅ Attach Refresh Control here
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={['#000']} // Android
            tintColor="#000"   // iOS
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { 
            useNativeDriver: true,
            listener: (event: any) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              const contentHeight = event.nativeEvent.contentSize.height;
              const height = event.nativeEvent.layoutMeasurement.height;
              // Load more when near bottom
              if (offsetY + height >= contentHeight - 400) { 
                handleLoadMore();
              }
            }
          }
        )}
      >
        {/* LOADING SKELETON (Only on first load, not refresh) */}
        {loading && !refreshing && posts.length === 0 ? (
          <View style={styles.masonryContainer}>
            <View style={styles.column}>
              <SkeletonCard height={240} />
              <SkeletonCard height={180} />
            </View>
            <View style={styles.column}>
              <SkeletonCard height={200} />
              <SkeletonCard height={300} />
            </View>
          </View>
        ) : (
          /* MASONRY GRID */
          <View style={styles.masonryContainer}>
            <View style={styles.column}>
              {leftCol.map(item => (
                <SwipeableCard
                  key={item._id}
                  item={item}
                  onPress={() => navigation.navigate('Item', { post: item })}
                />
              ))}
            </View>
            <View style={styles.column}>
              {rightCol.map(item => (
                <SwipeableCard
                  key={item._id}
                  item={item}
                  onPress={() => navigation.navigate('Item', { post: item })}
                />
              ))}
            </View>
          </View>
        )}

        {loadingMore && (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="small" color="#000" />
          </View>
        )}

        {!hasMore && posts.length > 0 && (
          <View style={{ padding: 20 }}>
            <Text style={styles.endText}>You're all caught up!</Text>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

/* =========================================
   STYLES
========================================= */
const HEADER_HEIGHT = 56;
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

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
  },
  logo: { fontFamily: 'DancingScript_700Bold', fontSize: 28, color: '#000' },
  scrollContent: {
    paddingTop: HEADER_HEIGHT + STATUS_BAR_HEIGHT, 
    paddingBottom: 100,
    paddingHorizontal: SIDE_PADDING,
  },
  masonryContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop: 10, 
  },
  column: { width: CARD_WIDTH, gap: COLUMN_GAP },
  card: {
    width: '100%',
    borderRadius: 12, 
    marginBottom: COLUMN_GAP,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    position: 'relative',
  },
  skeleton: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: COLUMN_GAP,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    backgroundColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
  endText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
  },
});