import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { TrendingUp, BarChart3 } from 'lucide-react-native';

interface DashboardCardProps {
  amount: number;
  periodLabel?: string;
  growthPercent?: number;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  amount,
  periodLabel = 'This Month',
  growthPercent = 12,
}) => {
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={[styles.card, SHADOWS.card]}>
      {/* CARD ACCENT GLOW STRIP */}
      <View style={styles.topAccentStrip} />

      {/* TOP ROW */}
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <Text style={styles.headerLabel}>TOTAL EARNINGS</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amountText}>{formattedAmount}</Text>
          </View>
          <Text style={styles.periodText}>{periodLabel}</Text>
        </View>

        {/* RIGHT CHART ICON BADGE */}
        <View style={styles.chartBadge}>
          <View style={styles.chartIconWrapper}>
            <BarChart3 size={24} color={COLORS.primary} strokeWidth={2.2} />
          </View>
          <View style={styles.miniBars}>
            <View style={[styles.bar, { height: 9 }]} />
            <View style={[styles.bar, { height: 15 }]} />
            <View style={[styles.bar, { height: 12 }]} />
            <View style={[styles.bar, styles.activeBar, { height: 22 }]} />
          </View>
        </View>
      </View>

      {/* CARD DIVIDER & STATS */}
      <View style={styles.bottomRow}>
        <View style={styles.growthBadge}>
          <TrendingUp size={13} color={COLORS.primary} strokeWidth={2.8} />
          <Text style={styles.growthText}>+{growthPercent}%</Text>
        </View>
        <Text style={styles.comparisonText}>vs previous month</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F1A24',
    borderRadius: RADIUS.xl,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E2D3D',
    position: 'relative',
    overflow: 'hidden',
  },
  topAccentStrip: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.8,
    borderRadius: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 4,
  },
  leftInfo: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8295A9',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 3,
    letterSpacing: -0.5,
  },
  amountText: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.8,
  },
  periodText: {
    fontSize: 12,
    color: '#8295A9',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  chartBadge: {
    backgroundColor: 'rgba(0, 168, 107, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 107, 0.24)',
  },
  chartIconWrapper: {
    marginBottom: 4,
  },
  miniBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 22,
  },
  bar: {
    width: 3.5,
    backgroundColor: '#27384A',
    borderRadius: 2,
  },
  activeBar: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1A2938',
    paddingTop: 12,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 107, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: RADIUS.full,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 107, 0.25)',
  },
  growthText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  comparisonText: {
    fontSize: 12,
    color: '#8295A9',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
