import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MapPin } from 'lucide-react-native';

// ✅ FIXED IMPORTS (Using relative paths)
import { AuthContext } from '../src/context/AuthContext'; 
import { fetchMyPostsApi } from '../src/api/imagePost';
import { getImageUrl } from '../src/api/config'; 

export default function ProfileScreen({ navigation }: any) {
  const { user, token, logout } = useContext(AuthContext);

  // --- State ---
  const [activeTab, setActiveTab] = useState('Posts');
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // --- Animation ---
  const slideAnim = useRef(new Animated.Value(260)).current;

  // --- Theme ---
  const theme = darkMode ? dark : light;

  // --- Side Menu Animation ---
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? 0 : 260,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [menuOpen]);

  // --- Auth Check ---
  useFocusEffect(
    React.useCallback(() => {
      if (!user) {
        navigation.replace('SignIn');
      }
    }, [user])
  );

  // --- Fetch Posts ---
  useFocusEffect(
    React.useCallback(() => {
      if (!user || !token) return;

      const fetchMyPosts = async () => {
        try {
          setLoadingPosts(true);
          const posts = await fetchMyPostsApi(token);
          // Ensure we have a flat array (handles potential API response variations)
          const flattened = Array.isArray(posts) ? posts.flat() : [];
          setMyPosts(flattened);
        } catch (err) {
          console.log('❌ Failed to fetch my posts', err);
        } finally {
          setLoadingPosts(false);
        }
      };

      fetchMyPosts();
    }, [user, token])
  );

  // --- Image Helpers ---
  const bannerUri = user?.bannerImg 
    ? getImageUrl(user.bannerImg) 
    : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee';

  const avatarUri = user?.profilePic
    ? getImageUrl(user.profilePic)
    : 'https://via.placeholder.com/150'; // Fallback if no pic

  return (
    <SafeAreaView style={[{ flex: 1 }, theme.bg]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ---------- HEADER ---------- */}
        <View>
          {/* Banner */}
          <Image
            source={{ uri: bannerUri || undefined }}
            style={styles.cover}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setMenuOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <Image 
              source={{ uri: avatarUri || undefined }} 
              style={[
                styles.avatar, 
                theme.avatar, 
                { borderWidth: 4, borderColor: theme.bg.backgroundColor }
              ]} 
            />
          </View>
        </View>

        {/* ---------- USER INFO ---------- */}
        <View style={styles.info}>
          <Text style={[styles.name, theme.text]}>
            {user?.name || user?.username}
          </Text>
          
          <Text style={[styles.username, theme.subText]}>
            @{user?.username}
          </Text>

          {user?.location && (
             <View style={{flexDirection: 'row', alignItems:'center', gap: 4, marginTop: 4}}>
                <MapPin size={14} color="#6b7280" />
                <Text style={[styles.location, theme.subText]}>{user.location}</Text>
             </View>
          )}

          <Text style={[styles.bio, theme.subText]}>
            {user?.bio || 'Building Heed ✨ | Tech • Design • Startups'}
          </Text>
        </View>

        {/* ---------- STATS ---------- */}
        <View style={styles.stats}>
          <Stat label="Posts" value={myPosts.length.toString()} theme={theme} />
          <Stat label="Followers" value="1500" theme={theme} />
          <Stat label="Following" value="250" theme={theme} />
        </View>

        {/* ---------- ACTION BUTTONS ---------- */}
        <View style={styles.actions}>
          <ActionButton title="Edit profile" />
          <ActionButton title="Share profile" />
        </View>

        {/* ---------- TABS ---------- */}
        <View style={[styles.tabs, theme.border]}>
          {['Posts', 'Tuck-in', 'Saved', 'Groups'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabBtn}
            >
              <Text
                style={[
                  styles.tabText,
                  theme.subText,
                  activeTab === tab && theme.text,
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ---------- MASONRY GRID (POSTS) ---------- */}
        {activeTab === 'Posts' && (
          <View style={styles.masonry}>
            {/* LEFT COLUMN */}
            <View style={{ flex: 1, gap: 12 }}>
              {myPosts
                .filter((_, i) => i % 2 === 0)
                .map((post) => {
                  const imgUrl = getImageUrl(post.images?.[0]?.low || post.images?.[0]?.high);
                  return (
                    <TouchableOpacity
                      key={post._id}
                      onPress={() => navigation.navigate('Item', { post })}
                      style={styles.postCard}
                    >
                      <Image
                        source={{ uri: imgUrl || undefined }}
                        style={styles.postImage}
                      />
                      <Text style={[styles.postTitle, theme.text]} numberOfLines={1}>
                        {post.title || 'Untitled'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>

            {/* RIGHT COLUMN */}
            <View style={{ flex: 1, gap: 12 }}>
              {myPosts
                .filter((_, i) => i % 2 !== 0)
                .map((post) => {
                  const imgUrl = getImageUrl(post.images?.[0]?.low || post.images?.[0]?.high);
                  return (
                    <TouchableOpacity
                      key={post._id}
                      onPress={() => navigation.navigate('Item', { post })}
                      style={styles.postCard}
                    >
                      <Image
                        source={{ uri: imgUrl || undefined }}
                        style={styles.postImage}
                      />
                      <Text style={[styles.postTitle, theme.text]} numberOfLines={1}>
                        {post.title || 'Untitled'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ---------- SIDEBAR SETTINGS ---------- */}
      <Modal transparent visible={menuOpen} animationType="none">
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)} />

        <Animated.View
          style={[
            styles.sidebar,
            theme.sidebar,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Text style={[styles.sidebarTitle, theme.text]}>Settings</Text>

          <SidebarItem label="Accounts" theme={theme} />
          <SidebarItem label="Terms & Conditions" theme={theme} />

          <View style={styles.darkRow}>
            <Text style={[styles.sidebarText, theme.text]}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <View style={styles.divider} />

          {/* Log out */}
          <SidebarItem
            label="Log out"
            danger
            onPress={async () => {
              setMenuOpen(false);
              await logout();
            }}
            theme={theme}
          />
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- COMPONENTS ---------- */

function Stat({ label, value, theme }: any) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[styles.statValue, theme.text]}>{value}</Text>
      <Text style={[styles.statLabel, theme.subText]}>{label}</Text>
    </View>
  );
}

function ActionButton({ title }: any) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );
}

function SidebarItem({ label, danger, onPress, theme }: any) {
  return (
    <TouchableOpacity style={styles.sidebarItem} onPress={onPress}>
      <Text 
        style={[
          styles.sidebarText, 
          theme?.text, 
          danger && { color: '#dc2626' }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- THEMES ---------- */

const light = {
  bg: { backgroundColor: '#fff' },
  text: { color: '#111827' },
  subText: { color: '#6b7280' },
  border: { borderColor: '#e5e7eb' },
  sidebar: { backgroundColor: '#fff' },
  avatar: { backgroundColor: '#e5e7eb' },
};

const dark = {
  bg: { backgroundColor: '#0f172a' },
  text: { color: '#f8fafc' },
  subText: { color: '#94a3b8' },
  border: { borderColor: '#1e293b' },
  sidebar: { backgroundColor: '#020617' },
  avatar: { backgroundColor: '#1e293b' },
};

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  cover: { width: '100%', height: 160, backgroundColor: '#e5e7eb' },
  menuBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 12,
  },
  menuIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  avatarWrap: { alignItems: 'center', marginTop: -50 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  info: { alignItems: 'center', marginTop: 8, paddingHorizontal: 20 },
  name: { fontSize: 20, fontWeight: '700' },
  username: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  location: { fontSize: 13, marginBottom: 4 },
  bio: { marginTop: 4, textAlign: 'center', lineHeight: 20 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statValue: { fontWeight: '700', fontSize: 16 },
  statLabel: { fontSize: 12 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e5efff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { color: '#2563eb', fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    borderBottomWidth: 1,
  },
  tabBtn: { alignItems: 'center', paddingBottom: 10 },
  tabText: { fontWeight: '600' },
  tabUnderline: {
    height: 2,
    width: 24,
    backgroundColor: '#6366f1',
    marginTop: 6,
    borderRadius: 2,
  },
  masonry: { flexDirection: 'row', padding: 12, gap: 12 },
  postCard: { marginBottom: 12, alignItems: 'center', width: '100%' },
  postImage: {
    width: '100%',
    borderRadius: 12,
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    resizeMode: 'cover',
  },
  postTitle: { marginTop: 4, fontWeight: '600', fontSize: 12 },
  
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 260,
    paddingTop: 60,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  sidebarItem: { paddingVertical: 14 },
  sidebarText: { fontSize: 16, fontWeight: '500' },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 16,
  },
  darkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
});