import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { ArrowLeft, ShieldCheck, Mail, CheckCircle2, RotateCcw, Pencil } from 'lucide-react-native';
import { verifyOtpAndLogin, requestOtp } from '../api/authService';

export const OtpVerificationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { goBack, login, pendingEmail, showToast } = useApp();

  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isVerifyPressed, setIsVerifyPressed] = useState(false);

  // References for the 4 input boxes
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Countdown timer for Resend Code
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Focus the first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs[0].current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    setError(null);

    // If user pasted a 4-digit code
    if (value.length > 1) {
      const cleanDigits = value.replace(/[^0-9]/g, '').slice(0, 4).split('');
      const newOtp = [...otp];
      cleanDigits.forEach((digit, i) => {
        if (i < 4) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(cleanDigits.length, 3);
      inputRefs[nextIndex].current?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtp(newOtp);

    // Auto-advance to next box if digit entered
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setError(null);
    setOtp(['', '', '', '']);
    try {
      await requestOtp(pendingEmail || 'driver@olacars.com');
      showToast('New verification code sent to your email');
    } catch {
      showToast('New 4-digit code sent: 1234');
    }
    inputRefs[0].current?.focus();
  };

  const handleVerify = async () => {
    const enteredCode = otp.join('');

    if (enteredCode.length < 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await verifyOtpAndLogin(pendingEmail || 'driver@olacars.com', enteredCode);
      showToast('Verification successful! Welcome to OlaCars.');
      login(pendingEmail || 'driver@olacars.com');
    } catch (err: any) {
      // In dev fallback or if demo code 1234 is used
      if (enteredCode === '1234' || __DEV__) {
        showToast('Signed in successfully! (Dev Mode)');
        login(pendingEmail || 'driver@olacars.com');
      } else {
        setError(err.message || 'Invalid verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

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
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* 1. TOP HEADER */}
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

          <Text style={styles.headerTitle}>Verification</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* 2. ICON & TITLE */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={36} color={COLORS.primary} strokeWidth={2.2} />
            </View>
          </View>

          <Text style={styles.heading}>Enter 4-Digit Code</Text>
          <Text style={styles.subheading}>
            We've sent a 4-digit verification code to your email ID
          </Text>

          {/* 3. EMAIL BADGE WITH EDIT OPTION */}
          <View style={styles.emailPill}>
            <Mail size={16} color={COLORS.primary} />
            <Text style={styles.emailText} numberOfLines={1}>
              {pendingEmail || 'driver@olacars.com'}
            </Text>
            <TouchableOpacity
              onPress={() => goBack()}
              activeOpacity={0.7}
              style={styles.editButton}
              accessibilityLabel="Change email"
            >
              <Pencil size={13} color={COLORS.primary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* 4. 4-DIGIT OTP BOXES */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => {
              const isFilled = Boolean(digit);
              return (
                <TextInput
                  key={index}
                  ref={inputRefs[index]}
                  style={[
                    styles.otpBox,
                    isFilled && styles.otpBoxFilled,
                    error ? styles.otpBoxError : null,
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                  accessibilityLabel={`Digit ${index + 1}`}
                />
              );
            })}
          </View>

          {/* ERROR MESSAGE */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* DEMO HINT */}
          <View style={styles.demoHintRow}>
            <CheckCircle2 size={14} color={COLORS.textSecondary} />
            <Text style={styles.demoHintText}>Tip: Enter 1234 or any 4 digits to proceed</Text>
          </View>

          {/* 5. VERIFY BUTTON */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              isVerifyPressed && styles.verifyButtonPressed,
              (!isOtpComplete || loading) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            onPressIn={() => setIsVerifyPressed(true)}
            onPressOut={() => setIsVerifyPressed(false)}
            disabled={!isOtpComplete || loading}
            activeOpacity={0.8}
            accessibilityLabel="Verify code and continue to home screen"
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          {/* 6. RESEND CODE */}
          <View style={styles.resendRow}>
            <Text style={styles.resendPrefix}>Didn't receive the code? </Text>
            {resendTimer > 0 ? (
              <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendCode}
                activeOpacity={0.7}
                style={styles.resendActionBtn}
                accessibilityLabel="Resend verification code"
                accessibilityRole="button"
              >
                <RotateCcw size={14} color={COLORS.primary} />
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            )}
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
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRightPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8F7',
    borderWidth: 1,
    borderColor: '#E2EBE6',
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 32,
    maxWidth: '90%',
  },
  emailText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingLeft: 4,
  },
  editText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    width: '100%',
    marginBottom: 16,
  },
  otpBox: {
    width: 60,
    height: 64,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#DDE3E8',
    backgroundColor: '#FAFBFC',
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    ...SHADOWS.subtle,
  },
  otpBoxError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF8F8',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },
  demoHintText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  verifyButton: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  verifyButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  verifyButtonDisabled: {
    opacity: 0.55,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendPrefix: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  timerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  resendActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
