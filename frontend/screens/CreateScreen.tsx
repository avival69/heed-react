import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus } from 'lucide-react-native';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CreateScreen() {
  const nav = useNavigation<any>();

  /* ---------------- ANIMATION ---------------- */
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header hides on scroll down
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  // Image container shrinks from 40% to 30% of screen height
  const imageHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [
      SCREEN_HEIGHT * 0.4, // Expanded (40%)
      SCREEN_HEIGHT * 0.3, // Collapsed (30%)
    ],
    extrapolate: 'clamp',
  });

  /* ---------------- STATE ---------------- */
  // Fixed 4 slots for images
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [allowLikes, setAllowLikes] = useState(true);
  const [allowComments, setAllowComments] = useState(true);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  /* ---------------- HANDLERS ---------------- */
  const pickImage = async (index: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false, // Pick one for the specific box
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled && res.assets[0]) {
      setImages((prev) => {
        const copy = [...prev];
        copy[index] = res.assets[0].uri;
        return copy;
      });
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setTags((prev) => [...prev, t]);
    setTagInput('');
  };

  // Check if at least one image exists and fields are filled
  const canPublish =
    title.trim() && description.trim() && images.some((img) => img !== null);

  return (
    <View style={styles.container}>
      {/* ---------------- NAV BAR ---------------- */}
      <Animated.View
        style={[
          styles.nav,
          { transform: [{ translateY: headerTranslate }] },
        ]}
      >
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>item product</Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------- IMAGE CAROUSEL (4 BOXES) ---------------- */}
        <Animated.View style={[styles.carouselContainer, { height: imageHeight }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            snapToInterval={width * 0.75 + 16} // Width + margin
            decelerationRate="fast"
          >
            {images.map((uri, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => {
                  if (!uri) {
                    pickImage(index);
                  } else {
                    // Navigate to edit if image exists
                    nav.navigate('EditImage', {
                      uri,
                      index,
                      onSave: (newUri: string) => {
                        setImages((prev) => {
                          const copy = [...prev];
                          copy[index] = newUri;
                          return copy;
                        });
                      },
                    });
                  }
                }}
                style={styles.imageCard}
              >
                {uri ? (
                  <Image source={{ uri }} style={styles.imageDisplay} />
                ) : (
                  <View style={styles.placeholderBox}>
                    <Plus size={40} color="#9ca3af" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Simple Dots indicator */}
          <View style={styles.dotsContainer}>
             {images.map((_, i) => (
                <View key={i} style={[styles.dot, _ ? styles.dotFilled : null]} />
             ))}
          </View>
        </Animated.View>

        {/* ---------------- FORM ---------------- */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            style={[styles.input, styles.textArea]}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Prices</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="optional"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />

          {/* ---------------- TAGS ---------------- */}
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagContainer}>
             {/* Tag Input Field styled like a chip */}
            <View style={[styles.input, styles.tagInputWrapper]}>
                {tags.map((t, i) => (
                <View key={i} style={styles.tagChip}>
                    <Text style={styles.tagText}>{t}</Text>
                    <Text
                    style={styles.tagRemove}
                    onPress={() => setTags(tags.filter((_, x) => x !== i))}
                    >
                    ×
                    </Text>
                </View>
                ))}
                <TextInput
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                    placeholder={tags.length === 0 ? "Cars     Blue" : ""}
                    style={styles.tagInput}
                />
            </View>
          </View>

          {/* ---------------- ENGAGEMENT ---------------- */}
          <Text style={styles.sectionHeader}>Engagement settings</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Allow comments</Text>
            <Switch 
                value={allowComments} 
                onValueChange={setAllowComments}
                trackColor={{ false: "#e5e7eb", true: "#3b82f6" }} 
            />
          </View>

           <View style={styles.row}>
            <Text style={styles.rowLabel}>Show Likes</Text>
            <Switch 
                value={allowLikes} 
                onValueChange={setAllowLikes}
                trackColor={{ false: "#e5e7eb", true: "#3b82f6" }} 
            />
          </View>

          <TouchableOpacity
            disabled={!canPublish}
            style={[styles.publishBtn, !canPublish && { opacity: 0.5 }]}
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
  container: {
    flex: 1,
    backgroundColor: '#fff', // Changed to normal white bg
  },
  /* Navbar */
  nav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 15,
    paddingHorizontal: 20,
    zIndex: 100,
    // No shadow initially, simple look
  },
  backBtn: {
    marginRight: 15,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af', // Light gray like "item product" in image
    marginBottom: 2,
  },

  /* Carousel */
  carouselContainer: {
    // Height is animated
    width: '100%',
    marginBottom: 10,
  },
  carouselContent: {
    paddingHorizontal: width * 0.125, // Center the first item roughly
    alignItems: 'center',
  },
  imageCard: {
    width: width * 0.75, // Approx 75% screen width
    height: '90%', // Leave room for dots
    marginHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb', // Light gray placeholder bg
  },
  imageDisplay: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#d1d5db', // Darker gray for empty box
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 20,
    alignItems: 'center',
  },
  dot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db', marginHorizontal: 4
  },
  dotFilled: {
      backgroundColor: '#4b5563'
  },

  /* Form */
  formSection: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#e5e7eb', // Light gray fill
    borderWidth: 1, // Black border requested
    borderColor: '#000', // Visible border
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  /* Tags */
  tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
  },
  tagInputWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      paddingVertical: 8,
      width: '100%',
  },
  tagChip: {
      backgroundColor: '#d1d5db',
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 8,
      marginBottom: 4,
      flexDirection: 'row',
      alignItems: 'center',
  },
  tagText: {
      fontSize: 14,
      fontWeight: '500',
  },
  tagRemove: {
      marginLeft: 6,
      fontSize: 16,
      fontWeight: 'bold',
  },
  tagInput: {
      flex: 1,
      minWidth: 80,
      paddingVertical: 0,
      fontSize: 15,
  },

  /* Engagement */
  sectionHeader: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 25,
      marginBottom: 15,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  rowLabel: {
      fontSize: 16,
      fontWeight: '500',
  },

  /* Publish Button */
  publishBtn: {
      marginTop: 20,
      backgroundColor: '#000', // Black button usually looks cleaner with this design
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 50,
  },
  publishText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
  }
});