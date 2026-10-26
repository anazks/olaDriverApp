import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import { Home, FileText, Car, Settings } from 'lucide-react-native';
import { useApp, isAccountActive } from '../context/AppContext';
import { BottomTabKey } from '../types';

export const BottomNavigation: React.FC = () => {
  const { activeBottomTab, setActiveBottomTab, navigate, driver, showToast } = useApp();

  const isUserActive = isAccountActive(driver.status, driver.isActive);

  const handleTabPress = (tab: BottomTabKey) => {
    if (!isUserActive && (tab === 'Statements' || tab === 'Payments' || tab === 'Vehicle')) {
      showToast(
        tab === 'Statements' || tab === 'Payments'
          ? 'Statements are disabled while account is inactive.'
          : 'Vehicle asset is unassigned while account is inactive.'
      );
      return;
    }
    setActiveBottomTab(tab);
    switch (tab) {
      case 'Home':
        navigate('Dashboard');
        break;
      case 'Statements':
      case 'Payments':
        navigate('Statements');
        break;
      case 'Vehicle':
        navigate('VehicleStatus');
        break;
      case 'Settings':
        navigate('Profile');
        break;
    }
  };

  const tabs: { key: BottomTabKey; label: string; icon: typeof Home }[] = [
    { key: 'Home', label: 'Home', icon: Home },
    { key: 'Statements', label: 'Statements', icon: FileText },
    { key: 'Vehicle', label: 'Vehicle', icon: Car },
    { key: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive =
          activeBottomTab === tab.key ||
          (tab.key === 'Statements' && activeBottomTab === 'Payments');
        const isDisabled =
          !isUserActive &&
          (tab.key === 'Statements' || tab.key === 'Payments' || tab.key === 'Vehicle');
        const IconComponent = tab.icon;
        const color = isActive ? COLORS.primary : isDisabled ? '#CBD5E1' : '#94A3B8';

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, isDisabled && { opacity: 0.4 }]}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={isDisabled ? 0.9 : 0.7}
          >
            <View style={styles.iconContainer}>
              <IconComponent size={22} color={color} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && <View style={styles.activeDot} />}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: color,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 26,
  },
  activeDot: {
    position: 'absolute',
    bottom: -3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.1,
  },
});
