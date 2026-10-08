import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { QuickActionCard } from '../components/QuickActionCard';
import { VehicleCard } from '../components/VehicleCard';
import { ActivityItem } from '../components/ActivityItem';
import { BottomNavigation } from '../components/BottomNavigation';
import { useApp } from '../context/AppContext';
import {
  CreditCard,
  Car,
  UserCheck,
  Receipt,
  ShieldCheck,
  RefreshCw,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { 
    driver, 
    vehicle, 
    financial, 
    activities, 
    navigate, 
    profiles, 
    activeProfile, 
    switchProfile 
  } = useApp();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // Responsive card width calculation for 2x2 grid
  const horizontalPadding = 18;
  const gridGap = 12;
  const cardWidth = Math.floor((width - horizontalPadding * 2 - gridGap) / 2);

  const recentActivities = activities.slice(0, 2);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* APP HEADER */}
      <AppHeader
        showMenu
        centerLogo
        showNotification
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
      >
        {/* PREMIUM RESPONSIVE DRIVER HERO / GREETING SECTION */}
        <View style={[styles.greetingCard, SHADOWS.subtle]}>
          <View style={styles.greetingTopBar}>
            <View style={styles.verifiedTag}>
              <ShieldCheck size={12} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={styles.verifiedText}>Verified Driver</Text>
            </View>

            <View style={styles.topBarRight}>
              {profiles.length > 1 && (
                <TouchableOpacity
                  style={styles.switchPillBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowSwitchModal(true)}
                  accessibilityLabel="Switch assigned vehicle profile"
                >
                  <RefreshCw size={11} color={COLORS.primary} />
                  <Text style={styles.switchPillText}>Switch ({profiles.length})</Text>
                </TouchableOpacity>
              )}

              <View style={styles.onlineBadge}>
                <View style={styles.greenPulseDot} />
                <Text style={styles.onlineBadgeText}>Shift Active</Text>
              </View>
            </View>
          </View>

          <View style={styles.greetingMainRow}>
            <View style={styles.greetingInfo}>
              <Text style={styles.greetingPre}>Good to see you on the road,</Text>
              <Text style={styles.greetingName} numberOfLines={1}>
                Hi, {driver.firstName} 👋
              </Text>
              <Text style={styles.vehicleSub} numberOfLines={1}>
                {vehicle.make} {vehicle.model} • {vehicle.plateNumber}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigate('Profile')}
              activeOpacity={0.8}
              style={styles.avatarContainer}
            >
              <Image
                source={{ uri: driver.avatarUrl }}
                style={styles.avatarImg}
              />
              <View style={styles.statusPulseDot} />
            </TouchableOpacity>
          </View>

          {profiles.length > 1 && (
            <TouchableOpacity
              style={styles.switchBannerBar}
              activeOpacity={0.8}
              onPress={() => setShowSwitchModal(true)}
            >
              <View style={styles.switchBannerLeft}>
                <Layers size={13} color={COLORS.primary} />
                <Text style={styles.switchBannerText}>
                  {profiles.length} Profiles Available • Tap to Switch Profile
                </Text>
              </View>
              <ChevronRight size={14} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* QUICK ACTIONS SECTION (PERFECTLY RESPONSIVE 2X2 GRID) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <Text style={styles.sectionSubCount}>4 Short-cuts</Text>
        </View>

        <View style={[styles.quickActionGrid, { gap: gridGap }]}>
          <QuickActionCard
            cardWidth={cardWidth}
            title="Make Payment"
            subtitle={`$${financial.currentDue.toFixed(2)} Due`}
            badge="Due soon"
            icon={<CreditCard size={22} color={COLORS.primary} strokeWidth={2.4} />}
            iconBgColor="#E6F7F0"
            onPress={() => navigate('Payments')}
          />
          <QuickActionCard
            cardWidth={cardWidth}
            title="Vehicle Status"
            subtitle={`${vehicle.make} ${vehicle.model}`}
            badge="Active"
            icon={<Car size={22} color={COLORS.purple} strokeWidth={2.4} />}
            iconBgColor="#F3E8FF"
            onPress={() => navigate('VehicleStatus')}
          />
          <QuickActionCard
            cardWidth={cardWidth}
            title="My Profile"
            subtitle={`ID: ${driver.driverId}`}
            badge="Verified"
            icon={<UserCheck size={22} color="#0284C7" strokeWidth={2.4} />}
            iconBgColor="#E0F2FE"
            onPress={() => navigate('Profile')}
          />
          <QuickActionCard
            cardWidth={cardWidth}
            title="All Activities"
            subtitle="History & Logs"
            icon={<Receipt size={22} color="#D97706" strokeWidth={2.4} />}
            iconBgColor="#FEF3C7"
            onPress={() => navigate('ActivityHistory')}
          />
        </View>

        {/* ASSIGNED VEHICLE SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ASSIGNED VEHICLE</Text>
          <TouchableOpacity onPress={() => navigate('VehicleStatus')} activeOpacity={0.7}>
            <Text style={styles.viewMoreText}>Manage</Text>
          </TouchableOpacity>
        </View>

        <VehicleCard
          vehicle={vehicle}
          onPress={() => navigate('VehicleStatus')}
        />

        {/* RECENT ACTIVITY SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <TouchableOpacity onPress={() => navigate('ActivityHistory')} activeOpacity={0.7}>
            <Text style={styles.viewMoreText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.recentActivitiesCard, SHADOWS.subtle]}>
          {recentActivities.map((act, index) => (
            <ActivityItem
              key={act.id}
              activity={act}
              isLast={index === recentActivities.length - 1}
            />
          ))}
        </View>
      </ScrollView>

      {/* FIXED BOTTOM NAVIGATION */}
      <BottomNavigation />

      {/* SWITCH PROFILE MODAL */}
      <Modal
        visible={showSwitchModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSwitchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Car size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.modalTitle}>Switch Vehicle Profile</Text>
              <Text style={styles.modalSubtitle}>
                Select the customer account and assigned vehicle to open:
              </Text>
            </View>

            <ScrollView style={styles.profileList} showsVerticalScrollIndicator={false}>
              {profiles.map((p) => {
                const isSelected = activeProfile
                  ? activeProfile.id === p.id
                  : vehicle.plateNumber === p.vehicle?.plateNumber;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.profileCard, isSelected && styles.profileCardActive]}
                    activeOpacity={0.8}
                    onPress={() => {
                      switchProfile(p.id);
                      setShowSwitchModal(false);
                    }}
                  >
                    <View style={styles.profileCardLeft}>
                      <View style={[styles.vehiclePlateBadge, isSelected && styles.vehiclePlateBadgeActive]}>
                        <Text style={[styles.vehiclePlateText, isSelected && styles.vehiclePlateTextActive]}>
                          {p.vehicle?.plateNumber || 'ASSIGNED VEHICLE'}
                        </Text>
                      </View>
                      <Text style={styles.profileVehicleModel}>
                        {p.vehicle?.make} {p.vehicle?.model} ({p.vehicle?.year || '2024'})
                      </Text>
                      <Text style={styles.profileNameText}>
                        {p.name} • {p.branch || 'Panama HQ'}
                      </Text>
                      <Text style={styles.profileDuesText}>
                        Current Due: ${p.financial?.currentDue?.toFixed(2) || '0.00'}
                      </Text>
                    </View>
                    {isSelected ? (
                      <View style={styles.activeCheckCircle}>
                        <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                      </View>
                    ) : (
                      <ChevronRight size={18} color={COLORS.textSecondary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              activeOpacity={0.8}
              onPress={() => setShowSwitchModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 28,
  },
  greetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },
  greetingTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F7F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  verifiedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  greetingMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  greetingInfo: {
    flex: 1,
  },
  greetingPre: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.4,
    marginTop: 2,
    marginBottom: 3,
  },
  vehicleSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.primary,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  statusPulseDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1.1,
  },
  sectionSubCount: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  viewMoreText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  recentActivitiesCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    marginBottom: 16,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  switchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  switchBannerBar: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#CBE5D9',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  switchBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 22,
    ...SHADOWS.card,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  profileList: {
    marginTop: 8,
    maxHeight: 280,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF9',
    borderWidth: 1.5,
    borderColor: '#E8EFEA',
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 10,
  },
  profileCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F2FAF6',
  },
  profileCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  vehiclePlateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#101820',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  vehiclePlateBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  vehiclePlateText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D2EE00',
    letterSpacing: 1,
  },
  vehiclePlateTextActive: {
    color: '#FFFFFF',
  },
  profileVehicleModel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  profileNameText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  profileDuesText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  activeCheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: '#F1F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
