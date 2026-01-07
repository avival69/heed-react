import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home, Search, PlusSquare, MessageCircle, User } from 'lucide-react-native';
import { useFonts, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';

import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import CreateScreen from './screens/CreateScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';

import './global.css';

const Tab = createBottomTabNavigator();

/* ---------------- FLOATING TAB BAR ---------------- */
function FloatingTabBar({ state, descriptors, navigation, scrollY }: any) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Note: We use 'addListener' for manual control, but Animated.event in HomeScreen 
    // drives the value updates. This listener reacts to those updates.
    const id = scrollY.addListener(({ value }: { value: number }) => {
      Animated.spring(translateY, {
        toValue: value > 50 ? 100 : 0, // Hide if scrolled down > 50px
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    });

    return () => scrollY.removeListener(id);
  }, []);

  return (
    <Animated.View style={[styles.tabBar, { transform: [{ translateY }] }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const color = isFocused ? '#3b82f6' : '#9ca3af';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          // Using onTouchEnd as per your request, though TouchableOpacity is often preferred
          <View key={route.key} style={styles.tabItem} onTouchEnd={onPress}>
            {route.name === 'Home' && <Home size={24} color={color} />}
            {route.name === 'Search' && <Search size={24} color={color} />}
            {route.name === 'Create' && (
              <PlusSquare
                size={28}
                color={isFocused ? 'white' : color}
                fill={isFocused ? '#3b82f6' : 'transparent'}
                stroke={isFocused ? 'white' : color}
              />
            )}
            {route.name === 'Chat' && <MessageCircle size={24} color={color} />}
            {route.name === 'Profile' && <User size={24} color={color} />}
          </View>
        );
      })}
    </Animated.View>
  );
}

/* ---------------- APP ---------------- */
export default function App() {
  // 1. Load the Google Font
  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
  });

  // 2. Shared Scroll Value for Animation
  const scrollY = useRef(new Animated.Value(0)).current;

  // 3. Wait for fonts to load before rendering
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true,
          }}
          tabBar={(props) => <FloatingTabBar {...props} scrollY={scrollY} />}
        >
          <Tab.Screen name="Home">
            {/* Pass scrollY to HomeScreen so it can drive the animation */}
            {() => <HomeScreen scrollY={scrollY} />}
          </Tab.Screen>
          <Tab.Screen name="Search" component={SearchScreen} />
          <Tab.Screen name="Create" component={CreateScreen} />
          <Tab.Screen name="Chat" component={ChatScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

/* ---------------- STYLES ---------------- */
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
    elevation: 8, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});