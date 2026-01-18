import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { ArrowLeft, Check, X, RefreshCcw, Scissors } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_HEIGHT - 140; // More space for header/footer

export default function EditImageScreen({ route, navigation }: any) {
  const { uri, onSave } = route.params || {};

  const [currentUri, setCurrentUri] = useState(uri);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // UX STATE: 'view' | 'crop'
  const [mode, setMode] = useState<'view' | 'crop'>('view');

  // Layout Refs
  const layoutRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const imageSizeRef = useRef({ w: 1, h: 1 });
  
  // Animation Refs
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const widthVal = useRef(new Animated.Value(200)).current;
  const heightVal = useRef(new Animated.Value(200)).current;

  // Logic Refs
  const box = useRef({ x: 0, y: 0, w: 200, h: 200 });
  const startBox = useRef({ x: 0, y: 0, w: 0, h: 0 }); 

  /* ---------- INITIALIZE ---------- */
  useEffect(() => {
    if (!currentUri) return;
    // Don't hide ready state on rotate updates to avoid flashing,
    // only on initial load if needed, but here we keep it smooth.
    
    Image.getSize(currentUri, (w, h) => {
      imageSizeRef.current = { w, h };
      
      const scale = Math.min(SCREEN_WIDTH / w, CANVAS_HEIGHT / h);
      const displayW = w * scale;
      const displayH = h * scale;
      const offsetX = (SCREEN_WIDTH - displayW) / 2;
      const offsetY = (CANVAS_HEIGHT - displayH) / 2;

      layoutRef.current = { x: offsetX, y: offsetY, w: displayW, h: displayH };

      // Reset Box to Center
      const initW = Math.min(200, displayW * 0.8);
      const initH = Math.min(200, displayH * 0.8);
      const initX = offsetX + (displayW - initW) / 2;
      const initY = offsetY + (displayH - initH) / 2;

      box.current = { x: initX, y: initY, w: initW, h: initH };

      panX.setValue(initX);
      panY.setValue(initY);
      widthVal.setValue(initW);
      heightVal.setValue(initH);

      setIsReady(true);
    });
  }, [currentUri]);

  /* ---------- GESTURES ---------- */
  const moveResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { startBox.current = { ...box.current }; },
      onPanResponderMove: (_, g) => {
        const layout = layoutRef.current;
        let newX = startBox.current.x + g.dx;
        let newY = startBox.current.y + g.dy;

        if (newX < layout.x) newX = layout.x;
        if (newX + box.current.w > layout.x + layout.w) newX = (layout.x + layout.w) - box.current.w;
        if (newY < layout.y) newY = layout.y;
        if (newY + box.current.h > layout.y + layout.h) newY = (layout.y + layout.h) - box.current.h;

        panX.setValue(newX);
        panY.setValue(newY);
        box.current.x = newX;
        box.current.y = newY;
      },
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { startBox.current = { ...box.current }; },
      onPanResponderMove: (_, g) => {
        const layout = layoutRef.current;
        let newW = startBox.current.w + g.dx;
        let newH = startBox.current.h + g.dy;

        if (newW < 50) newW = 50;
        if (newH < 50) newH = 50;
        if (box.current.x + newW > layout.x + layout.w) newW = (layout.x + layout.w) - box.current.x;
        if (box.current.y + newH > layout.y + layout.h) newH = (layout.y + layout.h) - box.current.y;

        widthVal.setValue(newW);
        heightVal.setValue(newH);
        box.current.w = newW;
        box.current.h = newH;
      },
    })
  ).current;

  /* ---------- ACTIONS ---------- */
  const handleRotate = async () => {
    if (loading) return;
    setLoading(true);
    // Rotating exits crop mode automatically to prevent math errors
    setMode('view'); 
    
    try {
      const res = await ImageManipulator.manipulateAsync(
        currentUri, 
        [{ rotate: 90 }], 
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCurrentUri(res.uri);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const applyCrop = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const layout = layoutRef.current;
      const imgW = imageSizeRef.current.w;
      const imgH = imageSizeRef.current.h;

      const scaleX = imgW / layout.w;
      const scaleY = imgH / layout.h;

      const relativeX = box.current.x - layout.x;
      const relativeY = box.current.y - layout.y;

      const originX = Math.max(0, relativeX * scaleX);
      const originY = Math.max(0, relativeY * scaleY);
      const w = box.current.w * scaleX;
      const h = box.current.h * scaleY;

      const res = await ImageManipulator.manipulateAsync(
        currentUri,
        [{
          crop: {
            originX, originY,
            width: Math.min(w, imgW - originX),
            height: Math.min(h, imgH - originY),
          }
        }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCurrentUri(res.uri);
      setMode('view'); // Exit crop mode on success
    } catch (error) {
      Alert.alert("Error", "Could not crop image.");
    } finally {
      setLoading(false);
    }
  };

const handleSave = () => {
  const { onSaveCropped } = route.params || {};
  if (onSaveCropped) {
    onSaveCropped(currentUri); // send cropped image back
  }
  navigation.goBack();
};




  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        
        {/* Only show DONE in View mode */}
        {mode === 'view' && (
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CANVAS */}
      <View style={styles.canvas}>
        <Image 
          source={{ uri: currentUri }} 
          style={styles.image} 
          resizeMode="contain" 
        />
        
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}

        {/* CROP BOX: Only visible in 'crop' mode */}
        {!loading && isReady && mode === 'crop' && (
          <Animated.View
            {...moveResponder.panHandlers}
            style={[
              styles.cropBox,
              {
                transform: [{ translateX: panX }, { translateY: panY }],
                width: widthVal,
                height: heightVal,
              },
            ]}
          >
            <View style={[styles.gridLine, { left: '33%', width: 1, height: '100%' }]} />
            <View style={[styles.gridLine, { left: '66%', width: 1, height: '100%' }]} />
            <View style={[styles.gridLine, { top: '33%', height: 1, width: '100%' }]} />
            <View style={[styles.gridLine, { top: '66%', height: 1, width: '100%' }]} />

            <Animated.View 
              {...resizeResponder.panHandlers}
              style={styles.resizeHandle}
            />
          </Animated.View>
        )}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        {mode === 'view' ? (
          // VIEW MODE TOOLS
          <>
            <TouchableOpacity style={styles.tool} onPress={handleRotate}>
              <RefreshCcw color="#fff" size={20} />
              <Text style={styles.toolText}>Rotate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tool} onPress={() => setMode('crop')}>
              <Scissors color="#fff" size={20} />
              <Text style={styles.toolText}>Crop</Text>
            </TouchableOpacity>
          </>
        ) : (
          // CROP MODE TOOLS
          <>
            <TouchableOpacity style={styles.iconBtnSecondary} onPress={() => setMode('view')}>
              <X color="#fff" size={24} />
            </TouchableOpacity>

            <Text style={styles.modeTitle}>Adjust Crop</Text>

            <TouchableOpacity style={styles.iconBtnPrimary} onPress={applyCrop}>
              <Check color="#000" size={24} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    height: 60, marginTop: 40, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20 
  },
  saveText: { color: '#3b82f6', fontWeight: '700', fontSize: 16 },
  
  canvas: { 
    width: SCREEN_WIDTH, height: CANVAS_HEIGHT, 
    backgroundColor: '#111', overflow: 'hidden',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 20
  },
  
  cropBox: {
    position: 'absolute', top: 0, left: 0, 
    borderWidth: 1, borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  gridLine: {
    position: 'absolute', backgroundColor: 'rgba(255,255,255,0.3)',
  },
  resizeHandle: {
    position: 'absolute', right: -20, bottom: -20,
    width: 44, height: 44,
    backgroundColor: '#3b82f6', borderRadius: 22,
    borderWidth: 3, borderColor: '#fff',
    zIndex: 99,
  },
  
  footer: {
    position: 'absolute', bottom: 0, width: '100%', height: 100,
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  tool: { alignItems: 'center', gap: 5 },
  toolText: { color: '#fff', fontSize: 12 },
  modeTitle: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
  
  iconBtnPrimary: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'
  },
  iconBtnSecondary: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#333', justifyContent: 'center', alignItems: 'center'
  },
});