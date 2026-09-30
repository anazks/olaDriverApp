import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
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
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { driver, vehicle, financial, activities, navigate } = useApp();

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

            <View style={styles.onlineBadge}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.onlineBadgeText}>Shift Active</Text>
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
});
