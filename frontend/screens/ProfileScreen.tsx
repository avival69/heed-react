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
import { AuthContext } from 'src/context/AuthContext'; // adjust path
import { useFocusEffect } from '@react-navigation/native';

/* --------- DUMMY POSTS --------- */
const posts = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  height: i % 2 === 0 ? 180 : 260,
  color: `hsl(${i * 35}, 70%, 85%)`,
}));

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('Posts');
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const slideAnim = useRef(new Animated.Value(260)).current;

  const left = posts.filter((_, i) => i % 2 === 0);
  const right = posts.filter((_, i) => i % 2 !== 0);

  // ----------------- AUTO REDIRECT IF NOT LOGGED IN -----------------
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

  const theme = darkMode ? dark : light;

  return (
    <SafeAreaView style={[{ flex: 1 }, theme.bg]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ---------- HEADER ---------- */}
        <View>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
            }}
            style={styles.cover}
          />

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setMenuOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, theme.avatar]} />
          </View>
        </View>

        {/* ---------- USER INFO ---------- */}
        <View style={styles.info}>
          <Text style={[styles.username, theme.text]}>
            {user?.username || '@aswin'}
          </Text>
          <Text style={[styles.bio, theme.subText]}>
            {user?.bio || 'Building Heed ✨ | Tech • Design • Startups'}
          </Text>
        </View>

        {/* ---------- STATS ---------- */}
        <View style={styles.stats}>
          <Stat label="Posts" value="35" theme={theme} />
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
        {activeTab === 'Posts' && (
          <View style={styles.masonry}>
            <View style={{ flex: 1, marginRight: 6 }}>
              {left.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    { height: item.height, backgroundColor: item.color },
                  ]}
                />
              ))}
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              {right.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    { height: item.height, backgroundColor: item.color },
                  ]}
                />
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

          {/* DARK MODE */}
          <View style={styles.darkRow}>
            <Text style={[styles.sidebarText, theme.text]}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <View style={styles.divider} />

          {/* LOGOUT BUTTON */}
          <SidebarItem
            label="Log out"
            danger
            onPress={async () => {
              setMenuOpen(false);
              await logout();
              navigation.replace('SignIn');
            }}
          />
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Stat({ label, value, theme }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[styles.statValue, theme.text]}>{value}</Text>
      <Text style={[styles.statLabel, theme.subText]}>{label}</Text>
    </View>
  );
}

function ActionButton({ title }) {
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
  cover: { width: '100%', height: 160 },

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
    borderWidth: 4,
    borderColor: '#fff',
  },

  info: { alignItems: 'center', marginTop: 8 },
  username: { fontSize: 18, fontWeight: '700' },
  bio: { marginTop: 4, textAlign: 'center' },

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
});
