import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';
import { useApp, isAccountActive } from '../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { ConfirmationModal } from './ConfirmationModal';
import { OlaBannerLogo } from './OlaLogo';
import {
  LayoutDashboard,
  User,
  Car,
  CreditCard,
  List,
  Wallet,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  X,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const SideMenu: React.FC = () => {
  const { isDrawerOpen, closeDrawer, driver, navigate, logout, showToast } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isUserActive = isAccountActive(driver.status, driver.isActive);

  const handleNavigate = (screen: any) => {
    closeDrawer();
    navigate(screen);
  };

  const handleDisabledAction = (msg: string) => {
    showToast(msg);
  };

  const handleInfoAction = (title: string) => {
    closeDrawer();
    showToast(`${title} opened`);
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, action: () => handleNavigate('Dashboard'), disabled: false },
    { label: 'My Profile', icon: User, action: () => handleNavigate('Profile'), disabled: false },
    {
      label: 'Vehicle',
      icon: Car,
      action: isUserActive
        ? () => handleNavigate('VehicleStatus')
        : () => handleDisabledAction('Vehicle asset is unassigned while account is inactive.'),
      disabled: !isUserActive,
    },
    {
      label: 'Statements',
      icon: FileText,
      action: isUserActive
        ? () => handleNavigate('Statements')
        : () => handleDisabledAction('Statements are disabled while account is inactive.'),
      disabled: !isUserActive,
    },
    {
      label: 'Activity History',
      icon: List,
      action: isUserActive
        ? () => handleNavigate('ActivityHistory')
        : () => handleDisabledAction('Activity logs are disabled while account is inactive.'),
      disabled: !isUserActive,
    },
    {
      label: 'Payment Methods',
      icon: Wallet,
      action: isUserActive
        ? () => handleNavigate('Payments')
        : () => handleDisabledAction('Payment methods are disabled while account is inactive.'),
      disabled: !isUserActive,
    },
    { label: 'Help & Support', icon: HelpCircle, action: () => handleInfoAction('Help & Support'), disabled: false },
    { label: 'Terms & Conditions', icon: FileText, action: () => handleInfoAction('Terms & Conditions'), disabled: false },
    { label: 'Privacy Policy', icon: Shield, action: () => handleInfoAction('Privacy Policy'), disabled: false },
  ];

  return (
    <>
      <Modal
        visible={isDrawerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDrawer}
      >
        <View style={styles.overlay}>
          {/* TAP OUTSIDE TO CLOSE */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeDrawer}
          />

          {/* DRAWER CONTENT */}
          <View style={styles.drawer}>
            {/* DRAWER HEADER */}
            <View style={styles.drawerHeader}>
              <OlaBannerLogo width={140} />

              <TouchableOpacity
                onPress={closeDrawer}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* DRIVER PROFILE CARD */}
            <TouchableOpacity
              style={styles.profileCard}
              onPress={() => handleNavigate('Profile')}
              activeOpacity={0.8}
            >
              {driver.avatarUrl ? (
                <Image
                  source={{ uri: driver.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }]}>
                  <User size={24} color={COLORS.textSecondary} />
                </View>
              )}
              <View style={styles.profileText}>
                <Text style={styles.driverName}>{driver.name || 'Driver'}</Text>
                {driver.driverId ? <Text style={styles.driverId}>ID: {driver.driverId}</Text> : null}
                <View style={styles.badgeRow}>
                  <StatusBadge label={driver.verified ? "Verified" : "Active"} variant="verified" size="sm" />
                </View>
              </View>
            </TouchableOpacity>

            {/* SCROLLABLE MENU ITEMS */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuList}
            >
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, item.disabled && { opacity: 0.38 }]}
                    onPress={item.action}
                    activeOpacity={item.disabled ? 0.9 : 0.7}
                  >
                    <IconComponent
                      size={20}
                      color={item.disabled ? '#94A3B8' : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        item.disabled && { color: '#94A3B8' },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* LOGOUT BUTTON */}
            <View style={styles.drawerFooter}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => setShowLogoutModal(true)}
                activeOpacity={0.7}
              >
                <LogOut size={20} color={COLORS.error} />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmationModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        isDestructive
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 24, 32, 0.5)',
  },
  drawer: {
    width: Math.min(width * 0.82, 320),
    backgroundColor: COLORS.white,
    height: '100%',
    paddingTop: 48,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoContainer: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 140,
    height: 30,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileText: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  driverId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  menuList: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
  },
});
