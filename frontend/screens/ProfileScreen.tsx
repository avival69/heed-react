import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/* --------- DUMMY POSTS --------- */
const posts = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  height: i % 2 === 0 ? 180 : 260,
  color: `hsl(${i * 35}, 70%, 85%)`,
}));

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Posts');

  const left = posts.filter((_, i) => i % 2 === 0);
  const right = posts.filter((_, i) => i % 2 !== 0);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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

          <View style={styles.avatarWrap}>
            <View style={styles.avatar} />
          </View>
        </View>

        {/* ---------- USER INFO ---------- */}
        <View style={styles.info}>
          <Text style={styles.username}>@aswin</Text>
          <Text style={styles.bio}>
            Building Heed ✨ | Tech • Design • Startups
          </Text>
        </View>

        {/* ---------- STATS ---------- */}
        <View style={styles.stats}>
          <Stat label="Posts" value="35" />
          <Stat label="Followers" value="1500" />
          <Stat label="Following" value="250" />
        </View>

        {/* ---------- ACTION BUTTONS ---------- */}
        <View style={styles.actions}>
          <ActionButton title="Edit profile" />
          <ActionButton title="Share profile" />
        </View>

        {/* ---------- TABS ---------- */}
        <View style={styles.tabs}>
          {['Posts', 'Tuck-in', 'Saved', 'Group1'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabBtn}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabActive,
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ---------- MASONRY GRID ---------- */}
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
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Stat({ label, value }: any) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  cover: {
    width: '100%',
    height: 160,
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
    borderWidth: 4,
    borderColor: '#fff',
  },
  info: {
    alignItems: 'center',
    marginTop: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
  },
  bio: {
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statValue: {
    fontWeight: '700',
    fontSize: 16,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e5efff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  tabBtn: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  tabActive: {
    color: '#111827',
  },
  tabUnderline: {
    height: 2,
    width: 24,
    backgroundColor: '#111827',
    marginTop: 6,
    borderRadius: 2,
  },
  masonry: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
  },
});
