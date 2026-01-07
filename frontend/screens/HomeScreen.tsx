import React, { useState } from 'react';
import { View, Text, Animated, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Generate dummy data with random heights for "Masonry" effect
const generateData = () => {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    height: Math.floor(Math.random() * 150) + 150, // Random height between 150-300
    color: `hsl(${Math.random() * 360}, 70%, 80%)`, // Random pastel color
    title: `Post ${i + 1}`
  }));
};

export default function HomeScreen({ scrollY }: { scrollY: Animated.Value }) {
  const [data] = useState(generateData());

  // Split data into two columns for Masonry effect
  const leftColumn = data.filter((_, i) => i % 2 === 0);
  const rightColumn = data.filter((_, i) => i % 2 !== 0);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      
      {/* --- Header --- */}
      <View className="px-4 py-2 flex-row items-center justify-between border-b border-gray-100 pb-4">
        <Text 
          style={{ fontFamily: 'DancingScript_700Bold' }} 
          className="text-4xl text-black"
        >
          Heed
        </Text>
        {/* Placeholder for Icons (Like, Message) */}
        <View className="flex-row gap-4">
           <View className="w-6 h-6 bg-gray-200 rounded-full" />
           <View className="w-6 h-6 bg-gray-200 rounded-full" />
        </View>
      </View>

      {/* --- Masonry ScrollView --- */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEventThrottle={16}
        onScroll={
            scrollY ? 
            Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false } // 'false' because layout properties might animate
            ) : undefined
        }
      >
        <View className="flex-row px-2 pt-2">
          {/* Left Column */}
          <View className="flex-1 mr-2">
            {leftColumn.map((item) => (
              <View 
                key={item.id} 
                style={{ height: item.height, backgroundColor: item.color }} 
                className="w-full rounded-2xl mb-3 justify-end p-3"
              >
                <Text className="font-bold text-gray-700">{item.title}</Text>
              </View>
            ))}
          </View>

          {/* Right Column */}
          <View className="flex-1">
            {rightColumn.map((item) => (
              <View 
                key={item.id} 
                style={{ height: item.height, backgroundColor: item.color }} 
                className="w-full rounded-2xl mb-3 justify-end p-3"
              >
                <Text className="font-bold text-gray-700">{item.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}