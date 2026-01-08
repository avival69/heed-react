import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Home,
  Search,
  PlusSquare,
  MessageCircle,
  User,
} from 'lucide-react-native';
import {
  useFonts,
  DancingScript_700Bold,
} from '@expo-google-fonts/dancing-script';

/* ---------- MAIN SCREENS ---------- */
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import CreateScreen from './screens/CreateScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';

/* ---------- AUTH SCREENS ---------- */
import SignInScreen from './screens/auth/SignInScreen';
import SignUpScreen from './screens/auth/SignUpScreen';

import './global.css';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ---------- FAST FLOATING TAB BAR ---------- */
function FloatingTabBar(
  props: BottomTabBarProps & { scrollY: Animated.Value }
) {
  const { state, navigation, scrollY } = props;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let lastValue = 0;

    const id = scrollY.addListener(({ value }) => {
      const goingDown = value > lastValue && value > 20;
      lastValue = value;

      Animated.timing(translateY, {
        toValue: goingDown ? 90 : 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    });

    return () => scrollY.removeListener(id);
  }, [scrollY]);

  return (
    <Animated.View style={[styles.tabBar, { transform: [{ translateY }] }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const color = isFocused ? '#3b82f6' : '#9ca3af';

        return (
          <View
            key={route.key}
            style={styles.tabItem}
            onTouchEnd={() =>
              !isFocused && navigation.navigate(route.name)
            }
          >
            {route.name === 'Home' && <Home size={24} color={color} />}
            {route.name === 'Search' && <Search size={24} color={color} />}
            {route.name === 'Create' && (
              <PlusSquare
                size={28}
                color={isFocused ? 'white' : color}
                fill={isFocused ? '#3b82f6' : 'transparent'}
              />
            )}
            {route.name === 'Chat' && (
              <MessageCircle size={24} color={color} />
            )}
            {route.name === 'Profile' && <User size={24} color={color} />}
          </View>
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
      tabBar={(props) => (
        <FloatingTabBar {...props} scrollY={scrollY} />
      )}
    >
      <Tab.Screen name="Home">
        {() => <HomeScreen scrollY={scrollY} />}
      </Tab.Screen>
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/* ---------- APP ROOT ---------- */
export default function App() {
  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
  });

  // 🔐 TEMP AUTH STATE (replace with Firebase later)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <MainTabs />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn">
              {(props) => (
                <SignInScreen
                  {...props}
                  onLogin={() => setIsLoggedIn(true)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
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
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
