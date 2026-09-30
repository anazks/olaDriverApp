import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { Activity } from '../types';
import {
  CheckCircle2,
  Car,
  User,
  CreditCard,
  LogIn,
} from 'lucide-react-native';

interface ActivityItemProps {
  activity: Activity;
  isLast?: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  isLast = false,
}) => {
  const getIconInfo = () => {
    switch (activity.iconName) {
      case 'check-circle':
        return {
          icon: <CheckCircle2 size={18} color={COLORS.success} />,
          bg: COLORS.successLight,
        };
      case 'car':
        return {
          icon: <Car size={18} color={COLORS.purple} />,
          bg: COLORS.purpleLight,
        };
      case 'user':
        return {
          icon: <User size={18} color="#EC4899" />,
          bg: '#FCE7F3',
        };
      case 'credit-card':
        return {
          icon: <CreditCard size={18} color={COLORS.purple} />,
          bg: COLORS.purpleLight,
        };
      case 'log-in':
      default:
        return {
          icon: <LogIn size={18} color={COLORS.warning} />,
          bg: COLORS.warningLight,
        };
    }
  };

  const { icon, bg } = getIconInfo();

  return (
    <View style={[styles.container, !isLast && styles.withBorder]}>
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        {icon}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{activity.title}</Text>
          {activity.amount && (
            <Text style={styles.amount}>{activity.amount}</Text>
          )}
        </View>

        <Text style={styles.description}>{activity.description}</Text>
        <Text style={styles.timestamp}>{activity.timestamp}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
