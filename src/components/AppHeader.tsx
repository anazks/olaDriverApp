import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { ArrowLeft, Menu, Bell } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
  rightAction?: React.ReactNode;
  showNotification?: boolean;
  onNotification?: () => void;
  centerLogo?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showMenu = false,
  onMenu,
  rightAction,
  showNotification = false,
  onNotification,
  centerLogo = false,
}) => {
  const { goBack, openDrawer, navigate, unreadNotificationsCount } = useApp();

  const handleBack = () => {
    if (onBack) onBack();
    else goBack();
  };

  const handleMenu = () => {
    if (onMenu) onMenu();
    else openDrawer();
  };

  const handleNotification = () => {
    if (onNotification) onNotification();
    else navigate('Notifications');
  };

  return (
    <View style={styles.header}>
      {/* LEFT ELEMENT */}
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color={COLORS.text} strokeWidth={2.4} />
          </TouchableOpacity>
        ) : showMenu ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleMenu}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Menu size={22} color={COLORS.text} strokeWidth={2.4} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* CENTER ELEMENT */}
      <View style={styles.centerContainer}>
        {centerLogo ? (
          <View style={styles.logoWrapper}>
            <View style={styles.logoRow}>
              <Text style={styles.logoOla}>Ola</Text>
              <Text style={styles.logoCars}>Cars</Text>
            </View>
            <Text style={styles.logoSubtag}>DRIVER PORTAL</Text>
          </View>
        ) : title ? (
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      {/* RIGHT ELEMENT */}
      <View style={styles.rightContainer}>
        {rightAction ? (
          rightAction
        ) : showNotification ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotification}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Bell size={22} color={COLORS.text} strokeWidth={2.2} />
            {unreadNotificationsCount > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoOla: {
    fontSize: 21,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  logoCars: {
    fontSize: 21,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoSubtag: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    marginTop: -1,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
});
