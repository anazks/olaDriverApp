import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { Check } from 'lucide-react-native';

interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'verified';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'success',
  size = 'md',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
      case 'verified':
        return { bg: COLORS.successLight, text: COLORS.success, border: '#BBF7D0' };
      case 'warning':
        return { bg: COLORS.warningLight, text: COLORS.warning, border: '#FDE68A' };
      case 'error':
        return { bg: COLORS.errorLight, text: COLORS.error, border: '#FECACA' };
      case 'neutral':
      default:
        return { bg: '#F1F5F9', text: COLORS.textSecondary, border: COLORS.border };
    }
  };

  const colors = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 8 : 10,
        },
      ]}
    >
      {variant === 'verified' && (
        <Check size={isSm ? 10 : 12} color={COLORS.success} strokeWidth={3} style={{ marginRight: 3 }} />
      )}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSm ? 11 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
