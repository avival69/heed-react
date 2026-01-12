import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  SafeAreaView as RNSafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Repeat, // Used for Tuck-in/Repost
  MoreHorizontal,
  Send,
  X
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

/* ---------- DUMMY DATA ---------- */
const RELATED_ITEMS = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  height: i % 2 === 0 ? 180 : 240,
  // Professional muted pastel tones
  color: i % 2 === 0 ? '#F3F4F6' : '#E5E7EB',
  image: `https://images.unsplash.com/photo-${i % 2 === 0 ? '1515886657613-9f3515b0c78f' : '1539008835657-9e8e9680c956'}?auto=format&fit=crop&w=300&q=80`
}));

const COMMENTS = [
  { id: 1, user: 'alex_design', text: 'Is the material breathable?', time: '2m' },
  { id: 2, user: 'sarah_styles', text: 'Love this fit! 😍', time: '1h' },
  { id: 3, user: 'mike_studio', text: 'Do you ship to Canada?', time: '3h' },
];

export default function ItemScreen() {
  const navigation = useNavigation<any>();
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        bounces={false}
      >
        {/* ---------- HERO IMAGE SECTION ---------- */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay for text visibility if needed, or just relying on buttons */}
          <View style={styles.imageOverlay} />

          {/* Header Actions (Floating) */}
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
        </View>

        {/* ---------- CONTENT CARD ---------- */}
        <View style={styles.card}>
          {/* Handle bar visual */}
          <View style={styles.handleBar} />

          {/* Seller & Meta */}
          <View style={styles.metaRow}>
            <View style={styles.sellerContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' }} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.sellerName}>Studio SDK</Text>
                <Text style={styles.sellerRating}>4.9 ★ Verified</Text>
              </View>
            </View>
            <Text style={styles.price}>₹2,000</Text>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>Polka Dot Halter Midi</Text>
          <Text style={styles.description}>
            A classic silhouette with a modern neckline. Designed for comfort
            and elegance using premium sustainable cotton. Perfect for summer evenings.
          </Text>

          {/* ---------- INTERACTION ROW ---------- */}
          <View style={styles.interactionRow}>
            <View style={styles.socialActions}>
              <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.iconBtn}>
                <Heart
                  size={24}
                  color={isLiked ? '#ef4444' : '#1f2937'}
                  fill={isLiked ? '#ef4444' : 'transparent'}
                />
                <Text style={styles.iconText}>1.2K</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setShowComments(true)} 
                style={styles.iconBtn}
              >
                <MessageCircle size={24} color="#1f2937" />
                <Text style={styles.iconText}>100</Text>
              </TouchableOpacity>
            </View>

            {/* TUCK IN BUTTON (Repost) */}
            <TouchableOpacity style={styles.tuckInButton}>
              <Repeat size={16} color="#fff" strokeWidth={3} />
              <Text style={styles.tuckInText}>Tuck-in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* ---------- MASONRY GRID ---------- */}
          <Text style={styles.sectionTitle}>More like this</Text>
          <View style={styles.masonryContainer}>
            <View style={styles.masonryColumn}>
              {RELATED_ITEMS.filter((_, i) => i % 2 === 0).map((item) => (
                <View key={item.id} style={[styles.masonryItem, { height: item.height }]}>
                   <Image source={{ uri: item.image }} style={styles.masonryImage} />
                </View>
              ))}
            </View>
            <View style={styles.masonryColumn}>
              {RELATED_ITEMS.filter((_, i) => i % 2 !== 0).map((item) => (
                <View key={item.id} style={[styles.masonryItem, { height: item.height }]}>
                  <Image source={{ uri: item.image }} style={styles.masonryImage} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ---------- BOTTOM CTA ---------- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatButton}>
          <Text style={styles.chatButtonText}>Chat with Seller</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- COMMENT BOTTOM SHEET ---------- */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComments(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowComments(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.modalContent} 
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments (100)</Text>
              <TouchableOpacity onPress={() => setShowComments(false)} style={styles.closeBtn}>
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* List */}
            <ScrollView style={styles.commentList}>
              {COMMENTS.map((c) => (
                <View key={c.id} style={styles.commentItem}>
                  <View style={styles.commentAvatar} />
                  <View style={{flex: 1}}>
                    <View style={styles.commentRow}>
                      <Text style={styles.commentUser}>{c.user}</Text>
                      <Text style={styles.commentTime}>{c.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Input */}
            <View style={styles.commentInputArea}>
              <TextInput 
                placeholder="Add a comment..." 
                placeholderTextColor="#9ca3af"
                style={styles.input} 
              />
              <TouchableOpacity>
                <Send size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            <RNSafeAreaView edges={['bottom']} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    height: 480, // Taller image
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)', // Subtle darken
  },
  headerActions: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 50, // Clear status bar
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)', // Glass morphism effect
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  sellerRating: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
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
    gap: 20,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  tuckInButton: {
    backgroundColor: '#111827', // Strong Dark Button
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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

  // MASONRY
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    borderRadius: 16,
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
    backgroundColor: '#3b82f6',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // COMMENT SHEET (MODAL)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    height: '60%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  commentList: {
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  commentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUser: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1f2937',
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  commentInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#1f2937',
  },
});