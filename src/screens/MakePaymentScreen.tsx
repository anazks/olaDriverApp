import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { PaymentMethodCard } from '../components/PaymentMethodCard';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SuccessModal } from '../components/SuccessModal';
import { useApp } from '../context/AppContext';
import { Lock, CreditCard, User, Calendar, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MakePaymentScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { financial, processPayment, goBack, navigate } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<'card' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState('Carlos Mendoza');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const parts = cleaned.match(/[\s\S]{1,4}/g) || [];
    return parts.join(' ');
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  const handlePay = async () => {
    const newErrors: { [key: string]: string } = {};

    if (selectedMethod === 'card') {
      const plainCard = cardNumber.replace(/\s/g, '');
      if (plainCard.length < 16) {
        newErrors.cardNumber = 'Enter a valid 16-digit card number';
      }
      if (!cardHolder.trim()) {
        newErrors.cardHolder = 'Cardholder name is required';
      }
      if (expiry.length < 5) {
        newErrors.expiry = 'MM/YY required';
      }
      if (cvv.length < 3) {
        newErrors.cvv = '3-digit CVV';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
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
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Total Due</Text>
            <Text style={styles.amountText}>
              ${financial.currentDue.toFixed(2)}
            </Text>
            <Text style={styles.dueDateText}>Due on {financial.paymentDueDate}</Text>
          </View>

          {/* METHOD SELECTION */}
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          <PaymentMethodCard
            type="card"
            last4="4242"
            selectable
            selected={selectedMethod === 'card'}
            showChevron={false}
            onPress={() => setSelectedMethod('card')}
          />

          <PaymentMethodCard
            type="paypal"
            email="carlos@example.com"
            selectable
            selected={selectedMethod === 'paypal'}
            showChevron={false}
            onPress={() => setSelectedMethod('paypal')}
          />

          {/* CARD FORM */}
          {selectedMethod === 'card' && (
            <View style={[styles.cardForm, SHADOWS.subtle]}>
              <InputField
                label="Card Number"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChangeText={(t) => {
                  setCardNumber(formatCardNumber(t));
                  if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: '' }));
                }}
                leftIcon={<CreditCard size={18} color={COLORS.textSecondary} />}
                keyboardType="numeric"
                maxLength={19}
                rightIcon={<Text style={styles.visaBadge}>VISA</Text>}
                error={errors.cardNumber}
              />

              <InputField
                label="Cardholder Name"
                placeholder="Carlos Mendoza"
                value={cardHolder}
                onChangeText={(t) => {
                  setCardHolder(t);
                  if (errors.cardHolder) setErrors((prev) => ({ ...prev, cardHolder: '' }));
                }}
                leftIcon={<User size={18} color={COLORS.textSecondary} />}
                error={errors.cardHolder}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Expiry Date"
                    placeholder="MM / YY"
                    value={expiry}
                    onChangeText={(t) => {
                      setExpiry(formatExpiry(t));
                      if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: '' }));
                    }}
                    leftIcon={<Calendar size={18} color={COLORS.textSecondary} />}
                    keyboardType="numeric"
                    maxLength={5}
                    error={errors.expiry}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <InputField
                    label="CVV"
                    placeholder="123"
                    value={cvv}
                    onChangeText={(t) => {
                      setCvv(t.replace(/\D/g, '').slice(0, 4));
                      if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: '' }));
                    }}
                    leftIcon={<ShieldCheck size={18} color={COLORS.textSecondary} />}
                    keyboardType="numeric"
                    maxLength={4}
                    isPassword
                    error={errors.cvv}
                  />
                </View>
              </View>
            </View>
          )}

          {/* PAY BUTTON */}
          <PrimaryButton
            title={`Pay $${financial.currentDue.toFixed(2)}`}
            onPress={handlePay}
            loading={loading}
            style={styles.payBtn}
          />

          {/* SECURE STRIPE BADGE */}
          <View style={styles.secureBadgeRow}>
            <Lock size={15} color={COLORS.textSecondary} />
            <Text style={styles.secureText}>
              Secure payment powered by <Text style={styles.stripeText}>Stripe</Text>
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
    marginBottom: 24,
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amountLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 4,
  },
  dueDateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  cardForm: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
    marginBottom: 20,
  },
  visaBadge: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00579F',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  payBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
  secureBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  stripeText: {
    fontWeight: '700',
    color: COLORS.text,
  },
});
