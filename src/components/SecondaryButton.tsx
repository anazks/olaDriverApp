import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'outline' | 'ghost' | 'dangerOutline' | 'whiteOutline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'outline',
  style,
  textStyle,
  icon,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'whiteOutline':
        return {
          border: 'rgba(255, 255, 255, 0.4)',
          bg: 'transparent',
          text: COLORS.white,
        };
      case 'dangerOutline':
        return {
          border: COLORS.error,
          bg: 'transparent',
          text: COLORS.error,
        };
      case 'ghost':
        return {
          border: 'transparent',
          bg: '#F1F5F9',
          text: COLORS.text,
        };
      case 'outline':
      default:
        return {
          border: COLORS.border,
          bg: COLORS.white,
          text: COLORS.text,
        };
    }
  };

  const current = getStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          borderColor: current.border,
          backgroundColor: current.bg,
        },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.text, { color: current.text }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
