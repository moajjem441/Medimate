import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Circle, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface LiquidBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const { width, height } = Dimensions.get('window');

export const LiquidBackground: React.FC<LiquidBackgroundProps> = ({
  children,
  style,
}) => {
  const { colors, isDark } = useTheme();

  // Gentle floating animation for liquid blobs
  const floatAnim1 = useSharedValue(0);
  const floatAnim2 = useSharedValue(0);

  useEffect(() => {
    floatAnim1.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    floatAnim2.value = withRepeat(
      withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const blob1Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatAnim1.value * 25 - 12 },
        { translateX: floatAnim1.value * 15 - 7 },
      ],
    };
  });

  const blob2Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: -floatAnim2.value * 30 + 15 },
        { translateX: -floatAnim2.value * 20 + 10 },
      ],
    };
  });

  const blobColors = colors.liquidBlobs;

  return (
    <View style={[styles.container, style]}>
      {/* Base Linear Gradient */}
      <LinearGradient
        colors={colors.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Liquid Blobs for Glass Refraction */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Blob 1: Top-Right (Cyan / Teal) */}
        <Animated.View style={[styles.blob1Wrapper, blob1Style]}>
          <Svg height="360" width="360" viewBox="0 0 360 360">
            <Defs>
              <SvgRadialGradient
                id="blobGrad1"
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fx="50%"
                fy="50%"
              >
                <Stop
                  offset="0%"
                  stopColor={blobColors[0]}
                  stopOpacity={isDark ? 0.38 : 0.28}
                />
                <Stop
                  offset="60%"
                  stopColor={blobColors[0]}
                  stopOpacity={isDark ? 0.18 : 0.12}
                />
                <Stop offset="100%" stopColor={blobColors[0]} stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="180" cy="180" r="170" fill="url(#blobGrad1)" />
          </Svg>
        </Animated.View>

        {/* Blob 2: Middle-Left (Blue / Purple) */}
        <Animated.View style={[styles.blob2Wrapper, blob2Style]}>
          <Svg height="380" width="380" viewBox="0 0 380 380">
            <Defs>
              <SvgRadialGradient
                id="blobGrad2"
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fx="50%"
                fy="50%"
              >
                <Stop
                  offset="0%"
                  stopColor={blobColors[1]}
                  stopOpacity={isDark ? 0.32 : 0.22}
                />
                <Stop
                  offset="65%"
                  stopColor={blobColors[1]}
                  stopOpacity={isDark ? 0.14 : 0.08}
                />
                <Stop offset="100%" stopColor={blobColors[1]} stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="190" cy="190" r="180" fill="url(#blobGrad2)" />
          </Svg>
        </Animated.View>

        {/* Blob 3: Bottom-Right (Pink / Coral) */}
        <Animated.View style={styles.blob3Wrapper}>
          <Svg height="320" width="320" viewBox="0 0 320 320">
            <Defs>
              <SvgRadialGradient
                id="blobGrad3"
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fx="50%"
                fy="50%"
              >
                <Stop
                  offset="0%"
                  stopColor={blobColors[2]}
                  stopOpacity={isDark ? 0.28 : 0.20}
                />
                <Stop
                  offset="70%"
                  stopColor={blobColors[2]}
                  stopOpacity={isDark ? 0.10 : 0.05}
                />
                <Stop offset="100%" stopColor={blobColors[2]} stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="160" cy="160" r="150" fill="url(#blobGrad3)" />
          </Svg>
        </Animated.View>
      </View>

      {/* Screen Foreground Children */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blob1Wrapper: {
    position: 'absolute',
    top: -60,
    right: -70,
    width: 360,
    height: 360,
  },
  blob2Wrapper: {
    position: 'absolute',
    top: height * 0.35,
    left: -100,
    width: 380,
    height: 380,
  },
  blob3Wrapper: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 320,
    height: 320,
  },
});
