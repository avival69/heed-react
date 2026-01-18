import React, { useState, useRef, useEffect, useContext } from 'react';
import {  fetchMyPostsApi  } from 'src/api/imagePost';

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
import { AuthContext } from 'src/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { MapPin } from 'lucide-react-native'; // Optional: for location icon

/* --------- DUMMY POSTS --------- */


export default function ProfileScreen({ navigation }: any) {
  const getCloudflareImageUrl = (imgObj: { low?: string; high?: string }) => {
  if (!imgObj) return undefined;

  // Use low first, fallback to high
  let url = imgObj.low || imgObj.high;
  if (!url) return undefined;

  // If URL already points to your public R2, just return it
  if (url.includes('pub-52a7337cc0c34226bcd23333580143ba.r2.dev')) return url;

  // If URL includes Cloudflare's storage URL, convert to your public R2 URL
  if (url.includes('r2.cloudflarestorage.com')) {
    const filename = url.split('/').pop(); // get just the file name
    return `https://pub-52a7337cc0c34226bcd23333580143ba.r2.dev/${filename}`;
  }

  // Otherwise return original URL
  return url;
};


const { user, token, logout } = useContext(AuthContext);
    console.log('User:', user);
console.log('Token:', token);


  const [activeTab, setActiveTab] = useState('Posts');
    const [myPosts, setMyPosts] = useState<any[]>([]);
const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const slideAnim = useRef(new Animated.Value(260)).current;



  /* ---------- AUTO REDIRECT IF LOGGED OUT ---------- */
  useFocusEffect(
    React.useCallback(() => {
      if (!user) {
        navigation.replace('SignIn');
      }
    }, [user])
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? 0 : 260,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [menuOpen]);


useFocusEffect(
  React.useCallback(() => {
    if (!user || !token) return; // Make sure both exist

    const fetchMyPosts = async () => {
      try {
        setLoadingPosts(true);
        console.log('⏳ Fetching posts for user:', user.username, user._id);

        const posts = await fetchMyPostsApi(token); // use token here


        const flattened = posts.flat(1);
        console.log('Flattened posts:', flattened);

        setMyPosts(flattened);
            if (flattened.length > 0) {
      console.log('First post images:', JSON.stringify(flattened[0]?.images, null, 2));
    }
      } catch (err) {
        console.log('❌ Failed to fetch my posts', err);
      } finally {
        setLoadingPosts(false);
        console.log('✅ Finished fetching posts');
      }
    };

    fetchMyPosts();
  }, [user, token])
);



  const theme = darkMode ? dark : light;

  // Use optional chaining for safe access
  const bannerSource = user?.bannerImg 
    ? { uri: user.bannerImg } 
    : { uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee' };

  return (
    <SafeAreaView style={[{ flex: 1 }, theme.bg]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ---------- HEADER ---------- */}
        <View>
          <Image
            source={bannerSource}
            style={styles.cover}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setMenuOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.avatarWrap}>
            {user?.profilePic ? (
               <Image 
                 source={{ uri: user.profilePic }} 
                 style={[styles.avatar, theme.avatar, { borderWidth: 4, borderColor: theme.bg.backgroundColor }]} 
               />
            ) : (
               <View style={[styles.avatar, theme.avatar, { borderWidth: 4, borderColor: theme.bg.backgroundColor }]} />
            )}
          </View>
        </View>

        {/* ---------- USER INFO ---------- */}
        <View style={styles.info}>
          <Text style={[styles.name, theme.text]}>
            {user?.name || user?.username}
          </Text>
          
          {/* Handle @username */}
          <Text style={[styles.username, theme.subText]}>
            @{user?.username}
          </Text>

          {/* Location if available */}
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
          <Stat label="Posts" value={myPosts.length} theme={theme} />
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
          {['Posts', 'Tuck-in', 'Saved', 'Group1'].map((tab) => (
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

        {/* ---------- MASONRY ---------- */}
{/* ---------- MASONRY ---------- */}
{/* ---------- MASONRY GRID ---------- */}
{activeTab === 'Posts' && (
  <View style={{ flexDirection: 'row', padding: 12, gap: 12 }}>
    {/* LEFT COLUMN */}
    <View style={{ flex: 1, gap: 12 }}>
      {myPosts
        .filter((_, i) => i % 2 === 0) // even index → left column
        .map((post) => (
          <TouchableOpacity
            key={post._id}
            onPress={() =>
              navigation.navigate('Item', {post
              })
            }
            style={{ marginBottom: 12, alignItems: 'center' }}
          >
            <Image
              source={{ uri: getCloudflareImageUrl(post.images?.[0]) }}
              style={{ width: '100%', borderRadius: 12, aspectRatio: 1 }}
            />
            <Text style={{ marginTop: 4, fontWeight: '600' }}>
              {post.title || post._id}
            </Text>
          </TouchableOpacity>
        ))}
    </View>

    {/* RIGHT COLUMN */}
    <View style={{ flex: 1, gap: 12 }}>
      {myPosts
        .filter((_, i) => i % 2 !== 0) // odd index → right column
        .map((post) => (
          <TouchableOpacity
            key={post._id}
onPress={() => navigation.navigate('Item', { post})}
            style={{ marginBottom: 12, alignItems: 'center' }}
          >
            <Image
              source={{ uri: getCloudflareImageUrl(post.images?.[0]) }}
              style={{ width: '100%', borderRadius: 12, aspectRatio: 1 }}
            />
            <Text style={{ marginTop: 4, fontWeight: '600' }}>
              {post.title || post._id}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  </View>
)}





      </ScrollView>

      {/* ---------- SIDEBAR ---------- */}
      <Modal transparent visible={menuOpen}>
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)} />

        <Animated.View
          style={[
            styles.sidebar,
            theme.sidebar,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Text style={[styles.sidebarTitle, theme.text]}>Settings</Text>

          <SidebarItem label="Accounts" />
          <SidebarItem label="Terms & Conditions" />

          <View style={styles.darkRow}>
            <Text style={[styles.sidebarText, theme.text]}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <View style={styles.divider} />

          {/* ---------- LOGOUT ---------- */}
          <SidebarItem
            label="Log out"
            danger
            onPress={async () => {
              setMenuOpen(false);
              await logout(); // 🔥 this alone is enough
            }}
          />
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

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

function SidebarItem({ label, danger, onPress }: any) {
  return (
    <TouchableOpacity style={styles.sidebarItem} onPress={onPress}>
      <Text style={[styles.sidebarText, danger && { color: '#dc2626' }]}>
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
  masonry: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 16 },
  card: { borderRadius: 16, marginBottom: 12 },
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
  postImage: {
  width: '100%',
  height: 220,
  borderRadius: 16,
  resizeMode: 'cover',
},
});