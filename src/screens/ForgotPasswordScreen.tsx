import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Mail, Lock, KeyRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ForgotPasswordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { goBack, navigate, showToast } = useApp();

  const [step, setStep] = useState<'request' | 'otp' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('carlos@example.com');
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      showToast('Verification code sent: 1234');
    }, 800);
  };

  const handleVerifyOtp = () => {
    if (otp.join('').length < 4) {
      setError('Please enter complete 4-digit code');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('reset');
    }, 800);
  };

  const handleResetPassword = () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Password reset successfully! Please login.');
      navigate('Login');
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (step === 'otp') setStep('request');
              else if (step === 'reset') setStep('otp');
              else goBack();
            }}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {step === 'request' && (
            <View>
              <View style={styles.iconCircle}>
                <Mail size={32} color={COLORS.primary} />
              </View>

              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.description}>
                Enter your registered email or phone number and we'll send you a verification code.
              </Text>

              <InputField
                label="Email or Phone"
                placeholder="Enter email or phone"
                value={identifier}
                onChangeText={(t) => {
                  setIdentifier(t);
                  setError('');
                }}
                leftIcon={<Mail size={18} color={COLORS.textSecondary} />}
                error={error}
              />

              <PrimaryButton
                title="Send Verification Code"
                onPress={handleSendCode}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          )}

          {step === 'otp' && (
            <View>
              <View style={styles.iconCircle}>
                <KeyRound size={32} color={COLORS.primary} />
              </View>

              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.description}>
                We sent a 4-digit code to {identifier}. Enter it below to proceed.
              </Text>

              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    style={styles.otpBox}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => {
                      const newOtp = [...otp];
                      newOtp[idx] = val;
                      setOtp(newOtp);
                      setError('');
                    }}
                  />
                ))}
              </View>

              {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

              <PrimaryButton
                title="Verify"
                onPress={handleVerifyOtp}
                loading={loading}
                style={styles.submitBtn}
              />

              <TouchableOpacity
                onPress={() => showToast('New code sent: 1234')}
                style={styles.resendBtn}
              >
                <Text style={styles.resendText}>Didn't receive code? Resend</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'reset' && (
            <View>
              <View style={styles.iconCircle}>
                <Lock size={32} color={COLORS.primary} />
              </View>

              <Text style={styles.title}>Create New Password</Text>
              <Text style={styles.description}>
                Your new password must be different from previous passwords.
              </Text>

              <InputField
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setError('');
                }}
                leftIcon={<Lock size={18} color={COLORS.textSecondary} />}
                isPassword
              />

              <InputField
                label="Confirm Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setError('');
                }}
                leftIcon={<Lock size={18} color={COLORS.textSecondary} />}
                isPassword
                error={error}
              />

              <PrimaryButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 26,
  },
  submitBtn: {
    marginTop: 8,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  otpBox: {
    flex: 1,
    height: 60,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
