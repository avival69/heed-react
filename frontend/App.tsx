import React, { useRef, useState, useContext, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as SplashScreen from 'expo-splash-screen';

/* ---------- ICONS ---------- */
import { Home, Search, PlusSquare, MessageCircle, User } from 'lucide-react-native';

/* ---------- FONTS ---------- */
import { useFonts, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';

/* ---------- SPLASH ---------- */
import AnimatedSplash from './screens/components/AnimatedSplash';

/* ---------- SCREENS ---------- */
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import CreateScreen from './screens/CreateScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import ItemScreen from './screens/ItemScreen';
import EditImageScreen from './screens/components/EditImageScreen';

/* ---------- AUTH ---------- */
import SignInScreen from './screens/auth/SignInScreen';
import SignUpScreen from './screens/auth/SignUpScreen';
import { AuthProvider, AuthContext } from 'src/context/AuthContext';

// Keep native splash visible until we are ready
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------- HELPER: GALLERY ---------- */
export async function openGallery(max = 4): Promise<string[] | null> {
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

/* ---------- FLOATING TAB BAR ---------- */
function FloatingTabBar(props: BottomTabBarProps & { scrollY: Animated.Value }) {
  const { state, navigation, scrollY } = props;
  const translateY = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let lastOffset = 0;
    let hidden = false;

    const listener = scrollY.addListener(({ value }) => {
      const diff = value - lastOffset;
      lastOffset = value;

      if (diff > 6 && !hidden && value > 50) {
        hidden = true;
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else if (diff < -6 && hidden) {
        hidden = false;
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => scrollY.removeListener(listener);
  }, []);

  return (
    <Animated.View style={[styles.tabBar, { transform: [{ translateY }] }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const color = isFocused ? '#3b82f6' : '#9ca3af';

        const onPress = async () => {
          if (route.name === 'Create') {
            const images = await openGallery(4);
            if (images?.length) {
              navigation.navigate('Create', { images });
            }
          } else {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} style={styles.tabItem} onPress={onPress}>
            {route.name === 'Home' && <Home size={24} color={color} />}
            {route.name === 'Search' && <Search size={24} color={color} />}
            {route.name === 'Create' && (
              <PlusSquare
                size={28}
                color={isFocused ? 'white' : color}
                fill={isFocused ? '#3b82f6' : 'transparent'}
              />
            )}
            {route.name === 'Chat' && <MessageCircle size={24} color={color} />}
            {route.name === 'Profile' && <User size={24} color={color} />}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

/* ---------- MAIN TABS ---------- */
function MainTabs() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} scrollY={scrollY} />}
    >
      <Tab.Screen name="Home">{() => <HomeScreen scrollY={scrollY} />}</Tab.Screen>
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/* ---------- AUTH STACK ---------- */
interface AuthStackProps {}
function AuthStack({}: AuthStackProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

/* ---------- ROOT APP ---------- */
function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);
  
  if (loading || !showSplash) {
    // Wait until AsyncStorage check and splash finishes
  }

  if (!showSplash) {
    SplashScreen.hideAsync();
  }

  return (
    <View style={{ flex: 1 }}>
      {showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}

      {!loading && (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
              <Stack.Screen name="Auth" component={AuthStack} />
            ) : (
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="Item" component={ItemScreen} />
                <Stack.Screen name="EditImage" component={EditImageScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
    HeedBrush: require('./assets/fonts/HeedBrush.otf'),
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});
