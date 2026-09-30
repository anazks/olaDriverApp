import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';
import { CreditCard } from 'lucide-react-native';

interface PaymentCardProps {
  totalDue: number;
  dueDate: string;
  onPayNow: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  totalDue,
  dueDate,
  onPayNow,
}) => {
  return (
    <View style={[styles.card, SHADOWS.card]}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.dueLabel}>Total Due</Text>
          <Text style={styles.amountText}>
            ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.dueDateText}>Due on {dueDate}</Text>
        </View>

        <View style={styles.iconCircle}>
          <CreditCard size={26} color={COLORS.primary} />
        </View>
      </View>

      <PrimaryButton
        title="Pay Now"
        onPress={onPayNow}
        style={styles.payButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.dark,
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  dueLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  amountText: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    marginVertical: 4,
    letterSpacing: 0.5,
  },
  dueDateText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 168, 107, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 107, 0.25)',
  },
  payButton: {
    height: 48,
    borderRadius: RADIUS.md,
  },
});
