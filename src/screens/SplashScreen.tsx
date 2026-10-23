import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react-native';
import { OlaBannerLogo } from '../components/OlaLogo';

export const SplashScreen: React.FC = () => {
  const { navigate } = useApp();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* SUBTLE DARK AUTOMOTIVE BACKGROUND */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.darkOverlay}>
          {/* MAIN SINGLE-PAGE CONTENT */}
          <Animated.View
            style={[
              styles.contentWrapper,
              {
                paddingTop: Math.max(insets.top + 32, 54),
                paddingBottom: Math.max(insets.bottom + 24, 36),
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* BRANDING SECTION */}
            <View style={styles.brandingSection}>
              <OlaBannerLogo width={260} transparentBg />
            </View>

            {/* BOTTOM ACTION BUTTONS */}
            <View style={styles.bottomSection}>
              {/* CLEAN SOLID GREEN GET STARTED BUTTON */}
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={() => navigate('Login')}
                activeOpacity={0.85}
                accessibilityLabel="Get Started"
                accessibilityRole="button"
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <ArrowRight size={18} color="#000000" strokeWidth={2.4} />
              </TouchableOpacity>

              {/* CLEAN FROSTED GLASS DRIVER LOGIN BUTTON */}
              <TouchableOpacity
                style={styles.glassLoginButton}
                onPress={() => navigate('Login')}
                activeOpacity={0.75}
                accessibilityLabel="Driver Login"
                accessibilityRole="button"
              >
                <Text style={styles.glassLoginText}>Driver Login</Text>
              </TouchableOpacity>

              <Text style={styles.footerNote}>Reliable Vehicles. Real Opportunities.</Text>
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080C0F',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 16, 0.88)',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  brandingSection: {
    alignItems: 'center',
    marginTop: '15%',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    height: 54,
    backgroundColor: 'rgb(200, 230, 0)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    shadowColor: 'rgb(200, 230, 0)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.3,
  },
  glassLoginButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  glassLoginText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  footerNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
