import React, { useRef, useState, useEffect, useContext } from 'react';
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

import { createImagePostApi } from 'src/api/imagePost';
import { AuthContext } from 'src/context/AuthContext';

/* ---------------- GALLERY HELPER ---------------- */
async function openGallery(max = 1): Promise<string[] | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to your photos');
    return null;
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    selectionLimit: max,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (res.canceled) return null;
  return res.assets.map((a) => a.uri);
}

/* ---------------- CONSTANTS ---------------- */
const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.75;
const SPACING = 10;
const EMPTY_ITEM_SIZE = (width - ITEM_WIDTH) / 2;

export default function CreateScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();

  const { token } = useContext(AuthContext);

  /* ---------------- IMAGE STATE ---------------- */
  const [images, setImages] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false);



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

  useEffect(() => {
  if (!isFocused) return;

  // 🔥 RESET EVERYTHING when opening CreateScreen
  setTitle('');
  setDescription('');
  setPrice('');
  setTags([]);
  setTagInput('');
  setAllowLikes(true);
  setAllowComments(true);

  const paramsImages = route.params?.images || [];
  const initial = [...paramsImages];
  while (initial.length < 4) initial.push(null);
  setImages(initial);
}, [isFocused]);
  /* ---------------- ANIMATIONS ---------------- */
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

  /* ---------------- IMAGE HANDLERS ---------------- */
  const handleAddImage = async (index: number) => {
    const newImgs = await openGallery(1);
    if (!newImgs) return;

    setImages((prev) => {
      const copy = [...prev];
      copy[index] = newImgs[0];
      return copy;
    });
  };

  const handleEditImage = (uri: string, index: number) => {
    nav.navigate('EditImage', { uri, index });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      filtered.push(null);

      if (filtered.every((i) => i === null)) nav.goBack();
      return filtered;
    });
  };

  /* ---------------- PUBLISH ---------------- */
  const canPublish =
    title.trim() &&
    description.trim() &&
    images.filter(Boolean).length > 0;

const handlePublish = async () => {
  if (!canPublish || loading) return; // ✅ prevent multiple taps
  setLoading(true); // start loading

  try {
    const form = new FormData();

    images.filter(Boolean).forEach((uri: any, index) => {
      form.append('images', {
        uri,
        name: `image-${index}.jpg`,
        type: 'image/jpeg',
      } as any);
    });

    form.append('title', title);
    form.append('description', description);
    if (price) form.append('price', price);
    form.append('allowComments', String(allowComments));
    form.append('allowLikes', String(allowLikes));

    await createImagePostApi(form, token);

    Alert.alert('Success', 'Post created successfully');
    nav.goBack();
  } catch (err: any) {
    let message = 'Failed to upload post';
    if (err.response?.data?.message) message = err.response.data.message;
    else if (err.message) message = err.message;

    console.log('Upload error:', err);
    Alert.alert('Error', message);
  } finally {
    setLoading(false); // reset loading after finish
  }
};


  /* ---------------- RENDER ---------------- */
  return (
    <View style={styles.container}>
      {/* HEADER */}
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* IMAGE CAROUSEL */}
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
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.cardContainer}>
                <TouchableOpacity
                  style={styles.cardInner}
                  onPress={() => !uri && handleAddImage(index)}
                  onLongPress={() => uri && handleEditImage(uri, index)}
                >
                  {uri ? (
                    <>
                      <Image source={{ uri }} style={styles.image} />
                      {index === 0 && (
                        <View style={styles.coverBadge}>
                          <Text style={styles.coverText}>Cover</Text>
                        </View>
                      )}
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
              </View>
            ))}
          </Animated.ScrollView>
        </Animated.View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} style={styles.input} />

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
  disabled={!canPublish || loading} // ✅ disable while API is running
  style={[styles.publish, (!canPublish || loading) && { opacity: 0.4 }]}
  onPress={handlePublish}
>
  <Text style={styles.publishText}>
    {loading ? 'Publishing...' : 'Publish'}  {/* optional: show loading */}
  </Text>
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
  cardContainer: { width: ITEM_WIDTH, height: '100%', alignItems: 'center' },
  cardInner: {
    width: ITEM_WIDTH - SPACING,
    height: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coverText: { color: '#fff', fontSize: 12, fontWeight: '700' },
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
  form: { paddingHorizontal: 20 },
  label: { marginTop: 20, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  textArea: { height: 80 },
  section: { marginTop: 30, marginBottom: 15, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  publish: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  publishText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
