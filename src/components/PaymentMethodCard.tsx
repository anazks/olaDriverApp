import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { CreditCard, ChevronRight, Check } from 'lucide-react-native';
import { StatusBadge } from './StatusBadge';

interface PaymentMethodCardProps {
  type: 'card' | 'paypal';
  last4?: string;
  email?: string;
  isDefault?: boolean;
  selected?: boolean;
  onPress: () => void;
  showChevron?: boolean;
  selectable?: boolean;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  type,
  last4 = '4242',
  email = 'carlos@example.com',
  isDefault = false,
  selected = false,
  onPress,
  showChevron = true,
  selectable = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {selectable && (
          <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
            {selected && <View style={styles.radioDot} />}
          </View>
        )}

        <View style={styles.iconBox}>
          {type === 'card' ? (
            <CreditCard size={20} color={COLORS.text} />
          ) : (
            <Text style={styles.paypalText}>P</Text>
          )}
        </View>

        <View>
          <Text style={styles.title}>
            {type === 'card' ? `Visa **** ${last4}` : 'PayPal'}
          </Text>
          <Text style={styles.subtitle}>
            {type === 'card' ? 'Expires 12/28' : email}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        {isDefault && <StatusBadge label="Default" variant="success" size="sm" />}
        {showChevron && <ChevronRight size={18} color={COLORS.textMuted} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#003087',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
