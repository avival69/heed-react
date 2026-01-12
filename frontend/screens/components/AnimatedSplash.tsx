import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

type Props = {
  onFinish: () => void;
};

const TEXT = "Heed";
const LETTERS = TEXT.split('');

export default function AnimatedSplash({ onFinish }: Props) {
  const animatedValues = useRef(LETTERS.map(() => new Animated.Value(0))).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const runAnimation = async () => {
      await SplashScreen.hideAsync();

      const animations = LETTERS.map((_, index) => {
        return Animated.timing(animatedValues[index], {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        });
      });

      Animated.sequence([
        Animated.stagger(150, animations),
        Animated.delay(800),
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    };

    runAnimation();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <View style={styles.textWrapper}>
        {LETTERS.map((letter, index) => {
          return (
            <Animated.Text
              key={index}
              style={[
                styles.text,
                {
                  opacity: animatedValues[index],
                  transform: [
                    {
                      translateY: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                    {
                        scale: animatedValues[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                        })
                    }
                  ],
                },
              ]}
            >
              {letter}
            </Animated.Text>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Allow letters to overlap slightly without getting cut off
    overflow: 'visible', 
  },
  text: {
    color: '#000000',
    fontSize: 72, 
    fontFamily: 'HeedBrush', 
    
    // FIX: Add padding so the brush strokes don't get cut off
    paddingHorizontal: 15,
    paddingVertical: 10,
    
    // FIX: Pull letters back together since we added padding
    marginHorizontal: -8, 
    
    // Ensure the text itself isn't clipped
    includeFontPadding: false,
    textAlign: 'center',
  },
});