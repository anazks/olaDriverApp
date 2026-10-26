import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { AuthInput } from '../components/AuthInput';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { requestOtp } from '../api/authService';
import { OLA_LOGO_PNG_BASE64 } from '../constants/logoPngData';
import { OLA_LOGO_BASE64 } from '../constants/logoData';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigate, goBack, setPendingEmail, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isGoPressed, setIsGoPressed] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Please enter your email ID';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const handleGo = async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(undefined);
    setLoading(true);

    const cleanEmail = email.trim();
    setPendingEmail(cleanEmail);

    try {
      await requestOtp(cleanEmail);
      showToast(`Verification code sent to ${cleanEmail}`);
      navigate('OtpVerification');
    } catch (err: any) {
      const errMsg = err.message || "Email isn't registered";
      setError(errMsg);
      showToast(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* 1. TOP HEADER - BACK BUTTON */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={[styles.backButton, isBackPressed && styles.backButtonPressed]}
            onPress={() => goBack()}
            onPressIn={() => setIsBackPressed(true)}
            onPressOut={() => setIsBackPressed(false)}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* 2. BRAND LOGO SECTION */}
          <View style={styles.logoSection}>
            <View style={styles.logoBadgeContainer}>
              <Image
                source={logoError ? { uri: OLA_LOGO_BASE64 } : { uri: OLA_LOGO_PNG_BASE64 }}
                style={styles.logoImage}
                resizeMode="contain"
                accessibilityLabel="Arrendadora Ola Cars Logo"
                onError={() => setLogoError(true)}
                 />
            </View>
          </View>

          {/* 3. WELCOME TITLE */}
          <View style={styles.titleSection}>
            <Text style={styles.welcomeHeading}>Sign In with Email</Text>
            <Text style={styles.welcomeSubtitle}>
              Enter your email ID to receive a 6-digit verification code
            </Text>
          </View>

          {/* 4. EMAIL ID INPUT BOX */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email ID</Text>
            <AuthInput
              placeholder="e.g. driver@olacars.com"
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                if (error) setError(undefined);
              }}
              leftIcon={<Mail size={20} color="#000000" />}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email ID input"
              error={error}
            />
          </View>

          {/* 5. GO BUTTON */}
          <TouchableOpacity
            style={[
              styles.goButton,
              isGoPressed && styles.goButtonPressed,
              loading && styles.goButtonDisabled,
            ]}
            onPress={handleGo}
            onPressIn={() => setIsGoPressed(true)}
            onPressOut={() => setIsGoPressed(false)}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityLabel="Go to verification screen"
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <View style={styles.goButtonContent}>
                <Text style={styles.goButtonText}>Go</Text>
                <View style={styles.goArrowCircle}>
                  <ArrowRight size={18} color="#000000" strokeWidth={2.6} />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* 6. BOTTOM SUPPORT TEXT */}
          <View style={styles.supportRow}>
            <Text style={styles.supportPrefix}>Need assistance with your account? </Text>
            <TouchableOpacity
              onPress={() => showToast('Connecting to OlaCars Driver Support...')}
              activeOpacity={0.7}
              accessibilityLabel="Contact support"
              accessibilityRole="button"
            >
              <Text style={styles.supportLink}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    paddingHorizontal: 18,
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: '#F5F7F8',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  logoBadgeContainer: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  logoImage: {
    width: 220,
    height: 48,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 28,
  },
  welcomeHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#101820',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#687386',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 2,
  },
  goButton: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  goButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  goButtonDisabled: {
    opacity: 0.7,
  },
  goButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  goButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.4,
  },
  goArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    flexWrap: 'wrap',
  },
  supportPrefix: {
    fontSize: 12.5,
    color: '#687386',
    fontWeight: '400',
  },
  supportLink: {
    fontSize: 12.5,
    color: '#000000',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
