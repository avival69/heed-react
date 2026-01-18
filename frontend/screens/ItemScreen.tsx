import React, { useState, useContext, useEffect, useRef } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Repeat,
  Star,
  Bookmark
} from 'lucide-react-native';

// API & Context
import { toggleLikePostApi, fetchAllPostsApi } from 'src/api/imagePost';
import { AuthContext } from 'src/context/AuthContext';

// Components
import CommentsSheet from '../screens/components/CommentsSheet';

const { width } = Dimensions.get('window');
const R2_BASE_URL = "https://pub-52a7337cc0c34226bcd23333580143ba.r2.dev";

// --- HELPER: Clean URL ---
const getCleanImageUrl = (rawUrl?: string) => {
  if (!rawUrl) return undefined;
  if (rawUrl.includes("pub-52a7337cc0c34226bcd23333580143ba.r2.dev")) return rawUrl;
  if (rawUrl.includes("r2.cloudflarestorage.com")) {
    const filename = rawUrl.split("/").pop();
    return `${R2_BASE_URL}/${filename}`;
  }
  return rawUrl;
};

export default function ItemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const post = route.params?.post;

  // Context
  const { token, user } = useContext(AuthContext);
  
  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likedBy?.length || 0);
  const [isLiked, setIsLiked] = useState(
    post?.likedBy?.some((id: string) => id === user?._id) || false
  );
  const [isTucked, setIsTucked] = useState(false); // Local state for "Tuck-in"
  
  // Related Posts State
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const likesEnabled = post?.allowLikes !== false;
  const commentsEnabled = post?.allowComments !== false;
  const isOwner = user?._id === post?.user?._id; // Check if current user is seller

  // --- FETCH RELATED POSTS ---
  useEffect(() => {
    const loadRelated = async () => {
      try {
        const res = await fetchAllPostsApi(token);
        // Filter out current post and take top 6
        const others = res.data.filter((p: any) => p._id !== post._id).slice(0, 6);
        setRelatedPosts(others);
      } catch (err) {
        console.log("Failed to load related posts");
      } finally {
        setLoadingRelated(false);
      }
    };
    loadRelated();
  }, [post._id]);

  // --- HANDLERS ---
  const handleToggleLike = async () => {
    if (!post?._id || !token) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => prev + (newLiked ? 1 : -1));

    try {
      await toggleLikePostApi(post._id, token);
    } catch (err) {
      setIsLiked(!newLiked);
      setLikeCount(prev => prev + (newLiked ? -1 : 1));
    }
  };

  const handleTuckIn = () => {
    setIsTucked(!isTucked);
    Alert.alert(
      isTucked ? "Removed from Tuck-in" : "Tucked In!",
      isTucked ? "Item removed from your profile." : "This item has been saved to your Tuck-in tab."
    );
  };

  const handleChat = () => {
    navigation.navigate('Chat', { 
      seller: post.user, 
      product: {
        id: post._id,
        title: post.title,
        image: getCleanImageUrl(post.images?.[0]?.low),
        price: post.price
      }
    });
  };

  if (!post) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
      >
        {/* ================= HERO SECTION ================= */}
        <View style={styles.heroContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
            style={styles.heroScroll}
          >
            {post.images?.map((img: any, idx: number) => {
              const high = getCleanImageUrl(img.high);
              const low = getCleanImageUrl(img.low);

              return (
                <View key={idx} style={styles.imageWrapper}>
                  {/* Thumbnail First Loading */}
                  <Image
                    source={{ uri: low }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                    blurRadius={10} 
                  />
                  <Image
                    source={{ uri: high }}
                    style={styles.heroImage}
                    resizeMode="cover"
                  />
                </View>
              );
            })}
          </ScrollView>

          {/* Dots */}
          {post.images?.length > 1 && (
            <View style={styles.dotsContainer}>
              {post.images.map((_: any, i: number) => (
                <View key={i} style={[styles.dot, activeIndex === i && styles.activeDot]} />
              ))}
            </View>
          )}

          {/* Header Actions */}
          <SafeAreaView style={styles.headerSafe} edges={['top']}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.glassBtn} onPress={() => navigation.goBack()}>
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.glassBtn}>
                <Share2 size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* ================= CONTENT CARD ================= */}
        <View style={styles.contentCard}>
          <View style={styles.handleBar} />

          {/* Meta Info */}
          <View style={styles.metaHeader}>
            <View style={styles.userInfo}>
              <Image 
                source={{ uri: getCleanImageUrl(post.user?.profilePic) || 'https://via.placeholder.com/100' }} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.username}>@{post.user?.username || 'user'}</Text>
                <View style={styles.badgeRow}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>Verified Seller</Text>
                </View>
              </View>
            </View>
            {post.price && (
              <Text style={styles.priceTag}>₹{post.price.toLocaleString()}</Text>
            )}
          </View>

          {/* Title & Description */}
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postDesc}>
            {post.description || "No description provided for this item."}
          </Text>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <View style={styles.socialGroup}>
              <TouchableOpacity 
                style={styles.iconBtn} 
                onPress={likesEnabled ? handleToggleLike : undefined}
                disabled={!likesEnabled}
              >
                <Heart 
                  size={28} 
                  color={likesEnabled && isLiked ? "#ef4444" : "#1f2937"} 
                  fill={likesEnabled && isLiked ? "#ef4444" : "transparent"} 
                />
                <Text style={styles.iconText}>{likeCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconBtn}
                onPress={commentsEnabled ? () => setShowComments(true) : undefined}
                disabled={!commentsEnabled}
              >
                <MessageCircle size={28} color={commentsEnabled ? "#1f2937" : "#ccc"} />
              </TouchableOpacity>
            </View>

            {/* Tuck-In Button */}
            <TouchableOpacity 
              style={[styles.tuckBtn, isTucked && styles.tuckBtnActive]} 
              onPress={handleTuckIn}
            >
              <Repeat size={18} color={isTucked ? "#000" : "#fff"} />
              <Text style={[styles.tuckText, isTucked && {color: '#000'}]}>
                {isTucked ? "Tucked" : "Tuck-in"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* ================= REAL RELATED POSTS ================= */}
          <Text style={styles.sectionTitle}>More like this</Text>
          {loadingRelated ? (
            <ActivityIndicator size="small" color="#000" style={{marginTop: 20}} />
          ) : (
            <View style={styles.grid}>
              {relatedPosts.map((item) => (
                <TouchableOpacity 
                  key={item._id} 
                  style={styles.gridItem} 
                  activeOpacity={0.9}
                  onPress={() => navigation.push('Item', { post: item })}
                >
                  <Image 
                    source={{ uri: getCleanImageUrl(item.images?.[0]?.low) }} 
                    style={styles.gridImg} 
                    resizeMode="cover"
                  />
                  {item.price && (
                    <View style={styles.gridOverlay}>
                      <Text style={styles.gridPrice}>₹{item.price}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {relatedPosts.length === 0 && (
                <Text style={{color: '#9ca3af', fontStyle: 'italic'}}>No similar items found.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ================= BOTTOM BAR (CHAT ONLY) ================= */}
      {!isOwner && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.chatBtn} activeOpacity={0.9} onPress={handleChat}>
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.chatBtnText}>Chat with Seller</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Comments Sheet */}
      <CommentsSheet 
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={post._id}
      />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heroContainer: { width, height: 500, backgroundColor: '#f3f4f6' },
  heroScroll: { width, height: 500 },
  imageWrapper: { width, height: 500 },
  heroImage: { width: '100%', height: '100%' },
  
  headerSafe: { position: 'absolute', top: 0, width: '100%', zIndex: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  glassBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },

  dotsContainer: { position: 'absolute', bottom: 50, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  activeDot: { backgroundColor: '#fff', width: 8, height: 8, borderRadius: 4 },

  contentCard: {
    marginTop: -32, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 12, minHeight: 600,
  },
  handleBar: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

  metaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  userInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#f3f4f6' },
  username: { fontSize: 16, fontWeight: '700', color: '#111827' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  priceTag: { fontSize: 22, fontWeight: '800', color: '#111827' },

  postTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8, lineHeight: 30 },
  postDesc: { fontSize: 15, color: '#4B5563', lineHeight: 24, marginBottom: 24 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  socialGroup: { flexDirection: 'row', gap: 24, alignItems: 'center' },
  iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  
  tuckBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 100, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: {width:0, height:4}
  },
  tuckBtnActive: { backgroundColor: '#e5e7eb' },
  tuckText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, color: '#111827' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { 
    width: (width - 48 - 12) / 2, height: 220, borderRadius: 16, 
    backgroundColor: '#f3f4f6', overflow: 'hidden', position: 'relative'
  },
  gridImg: { width: '100%', height: '100%' },
  gridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)' },
  gridPrice: { color: '#fff', fontWeight: '700', fontSize: 12 },

  bottomBar: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6',
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16
  },
  chatBtn: {
    height: 54, borderRadius: 16,
    backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#2563eb', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  chatBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});