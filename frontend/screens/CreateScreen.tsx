import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

// --- HELPER: Gallery Logic ---
async function openGallery(max = 1): Promise<string[] | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to your photos');
    return null;
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    selectionLimit: max,
    mediaTypes: 'images',
    quality: 1,
  });

  if (res.canceled) return null;
  return res.assets.map((a) => a.uri);
}

// --- CONSTANTS ---
const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.75; 
const SPACING = 10; 
const EMPTY_ITEM_SIZE = (width - ITEM_WIDTH) / 2; 

export default function CreateScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();

  // 1. Initialize Images (Fill up to 4 slots)
  const [images, setImages] = useState<(string | null)[]>([]);

  // Initial Load
  useEffect(() => {
    // Prevent overwriting if we already have images in state
    if (images.length > 0) return;

    const paramsImages = route.params?.images || [];
    
    // Guard: Page should not load unless there is at least one image
    if (paramsImages.length === 0) {
      nav.goBack();
      return;
    }

    // Fill remaining slots with null to total 4
    const initial = [...paramsImages];
    while (initial.length < 4) {
      initial.push(null);
    }
    setImages(initial);
  }, [route.params?.images]);

  // Handle Edit Return
  useEffect(() => {
    if (isFocused && route.params?.updatedImage) {
      const { index, uri } = route.params.updatedImage;
      setImages((prev) => {
        const copy = [...prev];
        copy[index] = uri;
        return copy;
      });
      nav.setParams({ updatedImage: null });
    }
  }, [isFocused, route.params?.updatedImage]);

  /* ---------------- ANIMATION STATE ---------------- */
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const carouselHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [SCREEN_HEIGHT * 0.45, SCREEN_HEIGHT * 0.35],
    extrapolate: 'clamp',
  });

  /* ---------------- FORM STATE ---------------- */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [allowLikes, setAllowLikes] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (!tagInput.trim()) return;
    setTags((p) => [...p, tagInput.trim()]);
    setTagInput('');
  };

  const handleAddImage = async (index: number) => {
    const newImgs = await openGallery(1);
    if (newImgs && newImgs.length > 0) {
      setImages((prev) => {
        const copy = [...prev];
        copy[index] = newImgs[0];
        return copy;
      });
    }
  };

  const handleEditImage = (uri: string, index: number) => {
    nav.navigate('EditImage', { uri, index });
  };

  // --- NEW: Remove Image Logic ---
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => {
      // 1. Remove the item at index
      const filtered = prev.filter((_, i) => i !== indexToRemove);
      
      // 2. Add a null at the end to ensure we still have 4 slots
      filtered.push(null);
      
      // 3. If all images are gone, go back (optional safety)
      if (filtered.every(img => img === null)) {
        nav.goBack();
      }
      
      return filtered;
    });
  };

  const canPublish =
    title.trim() && description.trim() && images.filter(Boolean).length > 0;

  /* ---------------- RENDER ---------------- */
  return (
    <View style={styles.container}>
      {/* NAV HEADER */}
      <Animated.View
        style={[styles.nav, { transform: [{ translateY: headerTranslate }] }]}
      >
        <TouchableOpacity onPress={() => nav.goBack()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Create</Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* CAROUSEL SECTION */}
        <Animated.View style={{ height: carouselHeight }}>
          <Animated.ScrollView
            horizontal
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: EMPTY_ITEM_SIZE,
              alignItems: 'center', 
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {images.map((uri, index) => {
              const inputRange = [
                (index - 1) * ITEM_WIDTH,
                index * ITEM_WIDTH,
                (index + 1) * ITEM_WIDTH,
              ];

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.9, 1, 0.9],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.6, 1, 0.6],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.cardContainer,
                    { transform: [{ scale }], opacity },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    delayLongPress={200}
                    onPress={() => !uri && handleAddImage(index)}
                    onLongPress={() => uri && handleEditImage(uri, index)}
                    style={styles.cardInner}
                  >
                    {uri ? (
                      <>
                        <Image source={{ uri }} style={styles.image} />
                        
                        {/* 1. COVER BADGE (Index 0) */}
                        {index === 0 && (
                          <View style={styles.coverBadge}>
                            <Text style={styles.coverText}>Cover</Text>
                          </View>
                        )}

                        {/* 2. DELETE BUTTON (X) */}
                        <TouchableOpacity 
                          style={styles.deleteBtn}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <X size={14} color="#fff" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.placeholder}>
                        <Plus size={32} color="#9ca3af" />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
        </Animated.View>

        {/* INPUT FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, styles.textArea]}
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="optional"
            style={styles.input}
          />

          <Text style={styles.label}>Tags</Text>
          <View style={[styles.input, styles.tagWrap]}>
            {tags.map((t, i) => (
              <View key={i} style={styles.tag}>
                <Text>{t}</Text>
                <Text onPress={() => setTags(tags.filter((_, x) => x !== i))}>
                  ×
                </Text>
              </View>
            ))}
            <TextInput
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              style={{ flex: 1, minWidth: 60 }}
              placeholder="Cars..."
            />
          </View>

          <Text style={styles.section}>Engagement</Text>

          <View style={styles.row}>
            <Text>Allow comments</Text>
            <Switch value={allowComments} onValueChange={setAllowComments} />
          </View>

          <View style={styles.row}>
            <Text>Show likes</Text>
            <Switch value={allowLikes} onValueChange={setAllowLikes} />
          </View>

          <TouchableOpacity
            disabled={!canPublish}
            style={[styles.publish, !canPublish && { opacity: 0.4 }]}
          >
            <Text style={styles.publishText}>Publish</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  nav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    gap: 15,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  navTitle: { fontSize: 16, color: '#9ca3af', fontWeight: '600' },

  // Carousel Styles
  cardContainer: {
    width: ITEM_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInner: {
    width: ITEM_WIDTH - SPACING,
    height: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },

  // NEW UX BADGES
  coverBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coverText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form Styles
  form: { paddingHorizontal: 20 },
  label: { marginTop: 20, marginBottom: 6, fontWeight: '600', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f9fafb',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  section: { marginTop: 30, marginBottom: 15, fontWeight: '700', fontSize: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  publish: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
  publishText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});