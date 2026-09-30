import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { ChevronRight } from 'lucide-react-native';

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  onPress: () => void;
  isLast?: boolean;
}

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon,
  label,
  badge,
  onPress,
  isLast = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, !isLast && styles.withBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftRow}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.rightRow}>
        {badge}
        <ChevronRight size={18} color={COLORS.textMuted} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevron: {
    marginLeft: 2,
  },
});
