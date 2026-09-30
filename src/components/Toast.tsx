import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  Animated,
  Platform,
  TouchableOpacity,
  Easing,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RADIUS } from '../constants/theme';
import { Check, Info } from 'lucide-react-native';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  const insets = useSafeAreaInsets();
  const [visibleText, setVisibleText] = useState<string | null>(message);

  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse dot animation
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    if (visibleText) {
      pulseLoop.start();
    } else {
      pulseLoop.stop();
    }

    return () => pulseLoop.stop();
  }, [visibleText]);

  useEffect(() => {
    if (message) {
      setVisibleText(message);
      translateY.setValue(-60);
      opacity.setValue(0);
      scale.setValue(0.92);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 75,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 75,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (visibleText) {
      // Smooth exit animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -40,
          duration: 220,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.94,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisibleText(null);
      });
    }
  }, [message]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -40,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisibleText(null);
    });
  };

  if (!visibleText) return null;

  const topOffset = Math.max(insets.top + 8, Platform.OS === 'ios' ? 52 : 36);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          top: topOffset,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleDismiss}
        style={styles.pill}
        accessibilityLabel={visibleText}
        accessibilityRole="alert"
      >
        <View style={styles.iconCircle}>
          <Check size={12} color="#FFFFFF" strokeWidth={3} />
        </View>

        <Text style={styles.text} numberOfLines={2}>
          {visibleText}
        </Text>

        <Animated.View
          style={[
            styles.pulseDot,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    gap: 9,
    maxWidth: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F8FAFC',
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 2,
  },
});
