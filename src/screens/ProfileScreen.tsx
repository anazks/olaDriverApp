import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { StatusBadge } from '../components/StatusBadge';
import { ProfileMenuItem } from '../components/ProfileMenuItem';
import { SecondaryButton } from '../components/SecondaryButton';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { BottomNavigation } from '../components/BottomNavigation';
import { useApp } from '../context/AppContext';
import {
  Edit3,
  User,
  Phone,
  CreditCard,
  FileBadge,
  MapPin,
  HeartHandshake,
  LogOut,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { driver, navigate, logout, showToast } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <AppHeader
        title="My Profile"
        showBack
        rightAction={
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Edit3 size={20} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* DRIVER INFO SECTION */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: driver.avatarUrl }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.driverName}>{driver.name}</Text>

          <View style={styles.badgesRow}>
            <StatusBadge label="Verified" variant="verified" />
            <Text style={styles.driverId}>ID: {driver.driverId}</Text>
          </View>
        </View>

        {/* PROFILE MENU */}
        <View style={[styles.menuCard, SHADOWS.subtle]}>
          <ProfileMenuItem
            icon={<User size={20} color={COLORS.primary} />}
            label="Personal Information"
            onPress={() => navigate('EditProfile')}
          />
          <ProfileMenuItem
            icon={<Phone size={20} color={COLORS.primary} />}
            label="Contact Details"
            badge={
              <Text style={styles.menuValueText}>{driver.phone}</Text>
            }
            onPress={() => navigate('EditProfile')}
          />
          <ProfileMenuItem
            icon={<FileBadge size={20} color={COLORS.primary} />}
            label="Driving License"
            badge={<StatusBadge label="Verified" variant="verified" size="sm" />}
            onPress={() => showToast('License No: DL-8849204 (Valid till 2029)')}
          />
          <ProfileMenuItem
            icon={<CreditCard size={20} color={COLORS.primary} />}
            label="Payment Methods"
            badge={
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>2 Cards</Text>
              </View>
            }
            onPress={() => navigate('Payments')}
          />
          <ProfileMenuItem
            icon={<MapPin size={20} color={COLORS.primary} />}
            label="Address"
            onPress={() => showToast(driver.address)}
          />
          <ProfileMenuItem
            icon={<HeartHandshake size={20} color={COLORS.primary} />}
            label="Emergency Contact"
            isLast
            onPress={() => showToast(`Emergency: ${driver.emergencyContact}`)}
          />
        </View>

        {/* LOGOUT BUTTON */}
        <SecondaryButton
          title="Logout"
          variant="dangerOutline"
          icon={<LogOut size={18} color={COLORS.error} />}
          onPress={() => setShowLogoutModal(true)}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* CONFIRMATION MODAL */}
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

      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileHeaderCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  driverName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  driverId: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  menuValueText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  logoutBtn: {
    marginBottom: 12,
  },
});
