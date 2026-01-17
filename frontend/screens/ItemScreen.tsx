import React, { useState ,useContext } from 'react';
import { useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { toggleLikePostApi } from 'src/api/imagePost';
import { AuthContext } from 'src/context/AuthContext';

// Get the logged-in user's token
const R2_BASE_URL = "https://pub-52a7337cc0c34226bcd23333580143ba.r2.dev";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Repeat, // Used for Tuck-in/Repost icon
  Star,
} from 'lucide-react-native';

// Import the detached component
import CommentsSheet from '../screens/components/CommentsSheet'; 

const { width } = Dimensions.get('window');
type PostImage = {
  high: string;
  low: string;
};
/* ---------- DUMMY DATA ---------- */
const RELATED_ITEMS = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  height: i % 2 === 0 ? 180 : 260,
  image: `https://images.unsplash.com/photo-${
    i % 2 === 0 ? '1515886657613-9f3515b0c78f' : '1539008835657-9e8e9680c956'
  }?auto=format&fit=crop&w=400&q=80`,
}));

export default function ItemScreen() {
  const navigation = useNavigation<any>();
  const [activeIndex, setActiveIndex] = useState(0);
const [enableVerticalScroll, setEnableVerticalScroll] = useState(true);
  const route = useRoute<any>();
const post = route.params?.post; // <-- 
const likesEnabled = post?.allowLikes !== false;
const commentsEnabled = post?.allowComments !== false;
useEffect(() => {
  if (!post?.images || post.images.length === 0) return;

  post.images.forEach(async (img:PostImage, idx:number) => {
    try {
      const res = await fetch(img.high);
      console.log(`Image ${idx} fetch status:`, res.status);
      if (!res.ok) console.log(`Image ${idx} failed to load`, res.statusText);
    } catch (err: any) {
      console.log(`Image ${idx} fetch error:`, err.message);
    }
  });
}, [post]);

  // State

   const { token, user } = useContext(AuthContext);
const [likeCount, setLikeCount] = useState(post?.likedBy?.length || 0);
const [isLiked, setIsLiked] = useState(
  post?.likedBy?.some((id: string) => id === user?._id) || false
);
  const [showComments, setShowComments] = useState(false);
  console.log('token:', token, 'user:', user);

const handleToggleLike = async (): Promise<void> => {
  console.log('💡 handleToggleLike triggered');
  console.log('🧪 post:', post);

  if (!post?._id) {
    console.log('❌ No post._id');
    return;
  }

  if (!token) {
    console.log('❌ No token');
    return;
  }

  const newLiked: boolean = !isLiked;

  console.log('🔹 current isLiked:', isLiked);
  console.log('🔹 new isLiked:', newLiked);
  console.log('🔹 post._id:', post._id);

  // ✅ Optimistic UI update
  setIsLiked(newLiked);
  setLikeCount((prev: number): number => prev + (newLiked ? 1 : -1));

  try {
    await toggleLikePostApi(post._id, token);
    console.log('✅ Like API success');
  } catch (err: unknown) {
    const error =
      err instanceof Error ? err.message : 'Unknown error';

    console.log('❌ Like API failed:', error);

    // rollback
    setIsLiked(!newLiked);
    setLikeCount((prev: number): number => prev + (newLiked ? -1 : 1));

    Alert.alert('Error', 'Could not update like');
  }
};




  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 100 }}
  bounces={false}
  nestedScrollEnabled={true}
  scrollEnabled={enableVerticalScroll}   
      >
        {/* ---------- HERO IMAGE SECTION ---------- */}
{/* ---------- HERO IMAGE SECTION ---------- */}
{/* ---------- HERO IMAGE SECTION ---------- */}
<View style={{ width: width, height: 500 }}>
  {post?.images?.length > 0 && (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
      }}
      style={{ width: width, height: 500 }}
    >
{post.images.map((img: PostImage, idx: number) => {
  // ✅ Convert raw R2 URL to public base URL
  const coverImageUrl = (() => {
    if (!img?.high) return undefined;
    const filename = img.high.split("/").pop(); // extract just filename
    if (!filename) return undefined;
    return `${R2_BASE_URL}/${filename}`;
  })();

  return (
    <Image
      key={idx}
      source={{ uri: coverImageUrl }}
      style={{ width: width, height: 500 }}
      resizeMode="cover"
    />
  );
})}

    </ScrollView>
  )}

  {/* Dots */}
  {post?.images?.length > 1 && (
    <View style={styles.dotsContainer}>
      {post.images.map((_: PostImage, i: number) => (
        <View
          key={i}
          style={[styles.dot, activeIndex === i && styles.activeDot]}
        />
      ))}
    </View>
  )}

  <View style={styles.imageOverlay} pointerEvents="none" />

  {/* Floating Header */}
  <SafeAreaView style={styles.headerSafe} edges={['top']}>
    <View style={styles.headerActions}>
      <TouchableOpacity
        style={styles.glassButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.glassButton}>
        <Share2 size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
  </View>
          {/* ---------- MAIN CONTENT CARD ---------- */}
        <View style={styles.card}>
          {/* Handle Bar Visual */}
          <View style={styles.handleBar} />

          {/* Seller & Meta Info */}
         {/* Seller & Meta Info */}
<View style={styles.metaRow}>
  <View style={styles.sellerContainer}>
    <Image 
      source={{ uri: post?.user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' }} 
      style={styles.avatar} 
    />
    <View>
      <Text style={styles.sellerName}>
        {post?.user?.username || 'Unknown'}
      </Text>
      <View style={styles.ratingRow}>
        <Star size={12} color="#F59E0B" fill="#F59E0B" />
        <Text style={styles.sellerRating}>4.9 • Verified</Text> {/* dummy */}
      </View>
    </View>
  </View>
  <Text style={styles.price}>
    {post?.price ? `₹${post.price.toString()}` : ''}
  </Text>
</View>

{/* Product Details */}
<Text style={styles.title}>
  {post?.title || 'No Title'}
</Text>
<Text style={styles.description}>
  {post?.description || 'No description available.'}
</Text>

          {/* ---------- INTERACTION BAR ---------- */}
          <View style={styles.interactionRow}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
  {/* LIKE BUTTON */}
  <TouchableOpacity
    onPress={likesEnabled ? handleToggleLike : undefined}
    activeOpacity={likesEnabled ? 0.7 : 1}
    disabled={!likesEnabled}
    style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
  >
    <Heart
      size={26}
      color={likesEnabled
        ? isLiked
          ? '#ef4444'
          : '#1f2937'
        : '#9CA3AF'}
      fill={likesEnabled && isLiked ? '#ef4444' : 'transparent'}
    />
    {likesEnabled && (
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>
        {likeCount}
      </Text>
    )}
  </TouchableOpacity>

  {/* COMMENT BUTTON */}
  <TouchableOpacity
    onPress={commentsEnabled ? () => setShowComments(true) : undefined}
    activeOpacity={commentsEnabled ? 0.7 : 1}
    disabled={!commentsEnabled}
    style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
  >
    <MessageCircle
      size={26}
      color={commentsEnabled ? '#1f2937' : '#9CA3AF'}
    />
    {commentsEnabled && (
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>
        100
      </Text>
    )}
  </TouchableOpacity>
</View>


            {/* Repost / Tuck-in Button */}
            <TouchableOpacity style={styles.tuckInButton} activeOpacity={0.8}>
              <Repeat size={16} color="#fff" strokeWidth={3} />
              <Text style={styles.tuckInText}>Tuck-in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* ---------- MASONRY GRID ---------- */}
          <Text style={styles.sectionTitle}>More like this</Text>
          <View style={styles.masonryContainer}>
            {/* Left Column */}
            <View style={styles.masonryColumn}>
              {RELATED_ITEMS.filter((_, i) => i % 2 === 0).map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  activeOpacity={0.9}
                  style={[styles.masonryItem, { height: item.height }]}
                >
                   <Image source={{ uri: item.image }} style={styles.masonryImage} />
                </TouchableOpacity>
              ))}
            </View>
            {/* Right Column */}
            <View style={styles.masonryColumn}>
              {RELATED_ITEMS.filter((_, i) => i % 2 !== 0).map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  activeOpacity={0.9}
                  style={[styles.masonryItem, { height: item.height }]}
                >
                  <Image source={{ uri: item.image }} style={styles.masonryImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ---------- BOTTOM CTA ---------- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatButton} activeOpacity={0.9}>
          <Text style={styles.chatButtonText}>Chat with Seller</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- CONNECTED COMMENT SYSTEM ---------- */}
      <CommentsSheet 
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId="item_123" // Pass real ID here for DB queries
      />
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // HERO IMAGE
  imageContainer: {
    width: '100%',
    height: 500,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.25)', // Semi-transparent black
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    // Works on some versions/web, falls back gracefully
  },

  // CARD CONTENT
  card: {
    marginTop: -40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    minHeight: 500,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sellerRating: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 24,
  },

  // INTERACTIONS
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialActions: {
    flexDirection: 'row',
    gap: 24,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  tuckInButton: {
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tuckInText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 24,
  },

  // MASONRY GRID
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  masonryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  masonryColumn: {
    flex: 1,
    gap: 12,
  },
  masonryItem: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  masonryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // BOTTOM CTA
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  chatButton: {
    backgroundColor: '#3b82f6', // Bright primary blue
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  dotsContainer: {
  position: 'absolute',
  bottom: 20,
  alignSelf: 'center',
  flexDirection: 'row',
  gap: 6,
  zIndex: 5,
},

dot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: 'rgba(255,255,255,0.4)',
},
actionBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  padding: 6,
},

actionText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#374151',
},

activeDot: {
  backgroundColor: '#fff',
  width: 8,
  height: 8,
  borderRadius: 4,
},
});