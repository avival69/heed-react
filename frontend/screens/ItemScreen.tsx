import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react-native';

/* ---------- DUMMY RELATED DATA ---------- */
const related = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  height: i % 2 === 0 ? 160 : 220,
  color: `hsl(${i * 40}, 70%, 85%)`,
}));

export default function ItemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ---------- IMAGE HEADER ---------- */}
        <View>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1520975916090-3105956dac38',
            }}
            style={styles.image}
          />

          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color="#000" />
          </TouchableOpacity>
        </View>

        {/* ---------- INFO CARD ---------- */}
        <View style={styles.card}>
          {/* ACTIONS */}
          <View style={styles.actions}>
            <Action icon={<Heart size={20} />} label="1.2K" />
            <Action icon={<MessageCircle size={20} />} label="100" />
            <Action icon={<Share2 size={20} />} />
            <Text style={styles.tuckin}>Tuck-in</Text>
          </View>

          {/* PRICE */}
          <Text style={styles.price}>₹2,000</Text>

          {/* SELLER */}
          <View style={styles.seller}>
            <View style={styles.avatar} />
            <Text style={styles.sellerName}>Studio SDK</Text>
          </View>

          {/* TITLE */}
          <Text style={styles.title}>POLKA DOT HALTER MIDI</Text>

          {/* DESCRIPTION */}
          <Text style={styles.desc}>
            A classic silhouette with a modern neckline. Designed for comfort
            and elegance.
          </Text>

          {/* CTA */}
          <TouchableOpacity style={styles.cta}>
            <Text style={styles.ctaText}>Chat Seller</Text>
          </TouchableOpacity>
        </View>

        {/* ---------- MORE LIKE THIS ---------- */}
        <Text style={styles.section}>More like this</Text>

        <View style={styles.masonry}>
          <View style={{ flex: 1, marginRight: 6 }}>
            {related
              .filter((_, i) => i % 2 === 0)
              .map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.relatedCard,
                    { height: item.height, backgroundColor: item.color },
                  ]}
                />
              ))}
          </View>

          <View style={{ flex: 1, marginLeft: 6 }}>
            {related
              .filter((_, i) => i % 2 !== 0)
              .map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.relatedCard,
                    { height: item.height, backgroundColor: item.color },
                  ]}
                />
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- SMALL ACTION COMPONENT ---------- */
function Action({ icon, label }: any) {
  return (
    <View style={styles.actionItem}>
      {icon}
      {label && <Text style={styles.actionText}>{label}</Text>}
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 420,
  },

  back: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  card: {
    backgroundColor: '#eaf2ff',
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  actionText: {
    fontWeight: '600',
  },

  tuckin: {
    marginLeft: 'auto',
    fontWeight: '800',
    fontSize: 16,
  },

  price: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 14,
  },

  seller: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
  },

  sellerName: {
    fontWeight: '600',
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },

  desc: {
    color: '#374151',
    marginTop: 6,
    lineHeight: 20,
  },

  cta: {
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  ctaText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
  },

  section: {
    fontSize: 18,
    fontWeight: '800',
    margin: 20,
  },

  masonry: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },

  relatedCard: {
    borderRadius: 16,
    marginBottom: 12,
  },
});
