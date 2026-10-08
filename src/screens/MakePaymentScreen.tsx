import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SuccessModal } from '../components/SuccessModal';
import { useApp } from '../context/AppContext';
import { Phone, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MakePaymentScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { financial, processPayment, goBack, activeProfile, driver } = useApp();

  const [yappyPhone, setYappyPhone] = useState(
    activeProfile?.phone || driver?.phone || '+507 6234-5678'
  );
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string>('');

  const handlePayWithYappy = async () => {
    if (!yappyPhone.trim() || yappyPhone.length < 7) {
      setError('Please enter a valid mobile phone number for Yappy.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await processPayment(financial.currentDue);
      setLoading(false);
      setShowSuccessModal(true);
    } catch {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <AppHeader title="Pay Now" showBack />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* AMOUNT HEADER */}
          <View style={[styles.amountSection, SHADOWS.subtle]}>
            <Text style={styles.amountLabel}>Pending Balance Amount</Text>
            <Text style={styles.amountText}>
              ${financial.currentDue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.dueDateText}>
              Due on {financial.paymentDueDate || 'Friday'}
            </Text>
          </View>

          {/* YAPPY BRAND HERO CARD */}
          <View style={[styles.yappyHeroCard, SHADOWS.subtle]}>
            <View style={styles.yappyBrandRow}>
              <View style={styles.yappyLogoBox}>
                <Text style={styles.yappyLogoText}>Y</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.yappyBrandTitle}>Yappy Instant Mobile Pay</Text>
                <Text style={styles.yappyBrandSub}>Banco General · Panama</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={12} color="#059669" />
                <Text style={styles.verifiedBadgeText}>Official</Text>
              </View>
            </View>

            <View style={styles.merchantDivider} />

            <View style={styles.merchantRow}>
              <Text style={styles.merchantLabel}>Merchant Directory</Text>
              <Text style={styles.merchantTag}>@OlaCarsPanama</Text>
            </View>
            <View style={styles.merchantRow}>
              <Text style={styles.merchantLabel}>Customer Profile</Text>
              <Text style={styles.merchantValue}>
                {activeProfile?.name || driver.name}
              </Text>
            </View>
            <View style={styles.merchantRow}>
              <Text style={styles.merchantLabel}>Vehicle Assigned</Text>
              <Text style={styles.merchantValue}>
                {activeProfile?.vehicle?.plateNumber || 'EI2430'}
              </Text>
            </View>
          </View>

          {/* YAPPY PHONE INPUT */}
          <View style={[styles.phoneCard, SHADOWS.subtle]}>
            <Text style={styles.sectionTitle}>Confirm Yappy Mobile Number</Text>
            <Text style={styles.sectionSubtitle}>
              Ensure your mobile number is registered with your Banco General Yappy account.
            </Text>

            <InputField
              label="Yappy Mobile Phone"
              placeholder="+507 6000-0000"
              value={yappyPhone}
              onChangeText={(t) => {
                setYappyPhone(t);
                if (error) setError('');
              }}
              leftIcon={<Smartphone size={18} color="#0284C7" />}
              keyboardType="phone-pad"
              error={error}
            />

            <View style={styles.stepsBox}>
              <Text style={styles.stepsTitle}>How Yappy Payment Works:</Text>
              <Text style={styles.stepText}>
                1. Tap <Text style={styles.boldText}>&apos;Pay with Yappy&apos;</Text> below.
              </Text>
              <Text style={styles.stepText}>
                2. You will receive an instant approval push in your Banco General / Yappy App.
              </Text>
              <Text style={styles.stepText}>
                3. Your pending vehicle balance is credited immediately on approval.
              </Text>
            </View>
          </View>

          {/* YAPPY PAY ACTION BUTTON */}
          <PrimaryButton
            title={
              financial.currentDue > 0
                ? `Pay with Yappy · $${financial.currentDue.toFixed(2)}`
                : 'No Pending Balance Due'
            }
            onPress={handlePayWithYappy}
            loading={loading}
            disabled={financial.currentDue <= 0}
            style={styles.payBtn}
          />

          {/* SECURE BANCO GENERAL / YAPPY BADGE */}
          <View style={styles.secureBadgeRow}>
            <ShieldCheck size={16} color="#059669" />
            <Text style={styles.secureText}>
              Protected by <Text style={styles.yappyBoldText}>Yappy Banco General</Text> Security Gateway
            </Text>
          </View>
        </ScrollView>

        {/* SUCCESS MODAL */}
        <SuccessModal
          visible={showSuccessModal}
          amount={`$${financial.currentDue > 0 ? financial.currentDue.toFixed(2) : '320.00'}`}
          onDone={() => {
            setShowSuccessModal(false);
            goBack();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amountLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 4,
  },
  dueDateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  yappyHeroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  yappyBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yappyLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yappyLogoText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  yappyBrandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  yappyBrandSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  merchantDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 14,
  },
  merchantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  merchantLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  merchantTag: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
  },
  merchantValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  phoneCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
  },
  stepsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  stepText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  payBtn: {
    marginBottom: 16,
    backgroundColor: '#0284C7',
  },
  secureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  yappyBoldText: {
    fontWeight: '700',
    color: '#0284C7',
  },
});
