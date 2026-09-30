import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface AuthInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  leftIcon: React.ReactNode;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  accessibilityLabel: string;
  containerStyle?: ViewStyle;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  placeholder,
  value,
  onChangeText,
  leftIcon,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  accessibilityLabel,
  containerStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
        ]}
      >
        <View style={styles.leftIconWrapper}>{leftIcon}</View>

        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#687386"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color="#687386" />
            ) : (
              <Eye size={20} color="#687386" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE3E8',
    borderRadius: 11,
    paddingLeft: 14,
    paddingRight: 6,
  },
  inputWrapperFocused: {
    borderColor: '#00A86B',
    borderWidth: 1.5,
  },
  inputWrapperError: {
    borderColor: '#D64545',
    borderWidth: 1.5,
  },
  leftIconWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#101820',
    paddingVertical: 0,
  },
  rightIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#D64545',
    marginTop: 4,
    marginLeft: 4,
  },
});
