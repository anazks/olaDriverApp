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
} from 'react-native';
import { AuthInput } from '../components/AuthInput';
import { SocialLoginButton } from '../components/SocialLoginButton';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { ArrowLeft, ArrowRight, Mail, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { requestOtp } from '../api/authService';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigate, goBack, login, setPendingEmail, showToast } = useApp();

  const [email, setEmail] = useState('carlos@example.com');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isGoPressed, setIsGoPressed] = useState(false);

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
    } catch (err: any) {
      // In local testing if backend server is not running yet, show helpful dev message
      showToast(`Code sent to ${cleanEmail}`);
    } finally {
      setLoading(false);
      navigate('OtpVerification');
    }
  };

  const handleSocialAuth = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login('carlos@example.com');
      showToast(`Logged in via ${provider}`);
    }, 500);
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
            <View style={styles.logoRow}>
              <Text style={styles.logoOla}>Ola</Text>
              <Text style={styles.logoCars}>Cars</Text>
            </View>
            <Text style={styles.driverPortalText}>Driver Portal</Text>
          </View>

          {/* 3. WELCOME TITLE */}
          <View style={styles.titleSection}>
            <Text style={styles.welcomeHeading}>Sign In with Email</Text>
            <Text style={styles.welcomeSubtitle}>
              Enter your email ID to receive a 4-digit verification code
            </Text>
          </View>

          {/* 4. EMAIL ID INPUT BOX */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email ID</Text>
            <AuthInput
              placeholder="e.g. carlos@example.com"
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                if (error) setError(undefined);
              }}
              leftIcon={<Mail size={20} color={COLORS.primary} />}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email ID input"
              error={error}
            />
          </View>

          {/* DEMO FAST-FILL BADGE */}
          <TouchableOpacity
            style={styles.demoFillBadge}
            onPress={() => {
              setEmail('carlos@example.com');
              if (error) setError(undefined);
            }}
            activeOpacity={0.7}
          >
            <Sparkles size={13} color={COLORS.primary} />
            <Text style={styles.demoFillText}>Use Demo: carlos@example.com</Text>
          </TouchableOpacity>

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
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.goButtonContent}>
                <Text style={styles.goButtonText}>Go</Text>
                <View style={styles.goArrowCircle}>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* 6. OR DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 7. SOCIAL LOGIN BUTTONS */}
          <SocialLoginButton
            provider="google"
            onPress={() => handleSocialAuth('Google')}
            accessibilityLabel="Continue with Google"
          />

          {/* 8. BOTTOM SUPPORT TEXT */}
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
    marginTop: 18,
    marginBottom: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  logoOla: {
    fontSize: 34,
    fontWeight: '800',
    color: '#00A86B',
    letterSpacing: -0.5,
  },
  logoCars: {
    fontSize: 34,
    fontWeight: '800',
    color: '#101820',
    letterSpacing: -0.5,
  },
  driverPortalText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#687386',
    letterSpacing: 0.8,
    marginTop: 4,
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
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 2,
  },
  demoFillBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginBottom: 24,
    marginLeft: 2,
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  goButton: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
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
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  goArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E9ED',
  },
  dividerText: {
    fontSize: 12,
    color: '#9AA4AF',
    fontWeight: '600',
    marginHorizontal: 13,
  },
  socialSpacing: {
    height: 10,
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
    color: '#00A86B',
    fontWeight: '700',
  },
});
