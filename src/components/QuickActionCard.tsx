import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { ArrowUpRight } from 'lucide-react-native';

interface QuickActionCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  iconBgColor?: string;
  badge?: string;
  cardWidth?: number;
  style?: ViewStyle;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  iconBgColor = COLORS.primaryLight,
  badge,
  cardWidth,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        SHADOWS.subtle,
        cardWidth ? { width: cardWidth } : null,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      {/* TOP ROW: ICON + TOP-RIGHT ARROW */}
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>

        <View style={styles.arrowCircle}>
          <ArrowUpRight size={15} color={COLORS.textSecondary} strokeWidth={2.4} />
        </View>
      </View>

      {/* BOTTOM CONTENT */}
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>

        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  textContainer: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  subtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 3,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  badgeContainer: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
