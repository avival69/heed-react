import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');

export default function EditImageScreen({ route, navigation }: any) {
  const { uri, onSave } = route.params;

  const [img, setImg] = useState(uri);
  const [busy, setBusy] = useState(false);

  /* ---------- CROP STATE ---------- */
  const cropX = useRef(new Animated.Value(40)).current;
  const cropY = useRef(new Animated.Value(120)).current;
  const cropW = useRef(new Animated.Value(220)).current;
  const cropH = useRef(new Animated.Value(220)).current;

  /* ---------- MOVE CROP ---------- */
  const moveResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        cropX.setValue(40 + g.dx);
        cropY.setValue(120 + g.dy);
      },
    })
  ).current;

  /* ---------- RESIZE HANDLE ---------- */
  const baseW = useRef(220);  
  const baseH = useRef(220);
  const resizeResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderMove: (_, g) => {
      const newW = Math.max(120, baseW.current + g.dx);
      const newH = Math.max(120, baseH.current + g.dy);

      cropW.setValue(newW);
      cropH.setValue(newH);
    },

    onPanResponderRelease: (_, g) => {
      baseW.current = Math.max(120, baseW.current + g.dx);
      baseH.current = Math.max(120, baseH.current + g.dy);
    },
  })
).current;


  /* ---------- ROTATE ---------- */
  const rotate = async () => {
    if (busy) return;
    setBusy(true);

    const res = await ImageManipulator.manipulateAsync(
      img,
      [{ rotate: 90 }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    setImg(res.uri);
    setBusy(false);
  };

  /* ---------- CROP ---------- */
  const crop = async () => {
    if (busy) return;
    setBusy(true);

    const x = Math.max(0, Math.floor((cropX as any)._value));
    const y = Math.max(0, Math.floor((cropY as any)._value));
    const w = Math.floor((cropW as any)._value);
    const h = Math.floor((cropH as any)._value);

    const res = await ImageManipulator.manipulateAsync(
      img,
      [
        {
          crop: {
            originX: x,
            originY: y,
            width: w,
            height: h,
          },
        },
      ],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    setImg(res.uri);
    setBusy(false);
  };

  /* ---------- SAVE ---------- */
  const save = () => {
    onSave?.(img);
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <Image source={{ uri: img }} style={styles.image} />

      {/* CROP BOX */}
      <Animated.View
        {...moveResponder.panHandlers}
        style={[
          styles.cropBox,
          {
            transform: [
              { translateX: cropX },
              { translateY: cropY },
            ],
            width: cropW,
            height: cropH,
          },
        ]}
      >
        {/* RESIZE HANDLE */}
        <Animated.View
          {...resizeResponder.panHandlers}
          style={styles.resizeHandle}
        />
      </Animated.View>

      {/* ACTION BAR */}
      <View style={styles.bar}>
        <TouchableOpacity onPress={rotate}>
          <Text style={styles.btn}>Rotate</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={crop}>
          <Text style={styles.btn}>Crop</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={save}>
          <Text style={styles.btnPrimary}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width,
    height: height - 80,
    resizeMode: 'contain',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  resizeHandle: {
    position: 'absolute',
    width: 24,
    height: 24,
    right: -12,
    bottom: -12,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    height: 70,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  btn: {
    color: '#fff',
    fontSize: 16,
  },
  btnPrimary: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '700',
  },
});
