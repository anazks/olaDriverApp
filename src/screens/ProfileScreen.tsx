import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { StatusBadge } from '../components/StatusBadge';
import { ProfileMenuItem } from '../components/ProfileMenuItem';
import { SecondaryButton } from '../components/SecondaryButton';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { BottomNavigation } from '../components/BottomNavigation';
import { useApp, isAccountActive } from '../context/AppContext';
import {
  Edit3,
  User,
  Phone,
  CreditCard,
  FileBadge,
  MapPin,
  HeartHandshake,
  LogOut,
  Car,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building,
  Gauge,
  Fuel,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Hash,
  FileText,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { driver, vehicle, paymentMethods, navigate, logout, showToast, refreshProfile } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch driver stats and assigned vehicle on screen load
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        await refreshProfile();
      } catch (err: any) {
        if (isMounted) {
          console.warn('[ProfileScreen] refreshProfile error:', err.message);
        }
      }
    };
    fetchLatest();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshProfile();
      if (res) {
        showToast('Profile and vehicle details updated');
      } else {
        showToast('Profile refreshed');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to refresh profile');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshProfile, showToast]);

  const driverStatus = (driver.status || 'INACTIVE').toUpperCase();
  const isActiveDriver = isAccountActive(driver.status, driver.isActive);
  const isSuspended = driverStatus === 'SUSPENDED' || driverStatus === 'REJECTED';
  const isPending = ['DRAFT', 'PENDING REVIEW', 'VERIFICATION', 'CREDIT CHECK', 'MANAGER REVIEW', 'CONTRACT PENDING'].includes(driverStatus);

  const getStatusBadgeVariant = (): 'success' | 'warning' | 'error' | 'neutral' => {
    if (isActiveDriver) return 'success';
    if (isSuspended) return 'error';
    if (isPending) return 'warning';
    return 'neutral';
  };

  const getStatusDescription = () => {
    if (isActiveDriver) {
      return 'Account is verified and in active standing for vehicle assignments.';
    }
    if (isSuspended) {
      return 'Account is suspended. Please contact dispatch or branch administrator.';
    }
    if (isPending) {
      return `Onboarding in progress (${driverStatus.toLowerCase()}). Action required from staff.`;
    }
    return 'You are currently inactive. Please contact OLACARS to activate.';
  };

  // Assigned Vehicle details checks
  const hasAssignedVehicle = Boolean(
    vehicle?.plateNumber ||
    vehicle?.make ||
    vehicle?.model ||
    driver?.currentVehicle
  );

  const vehicleMake = vehicle?.make || vehicle?.basicDetails?.make || '';
  const vehicleModel = vehicle?.model || vehicle?.basicDetails?.model || '';
  const vehicleYear = vehicle?.year || vehicle?.basicDetails?.year || '';
  const vehiclePlate = vehicle?.plateNumber || vehicle?.legalDocs?.registrationNumber || '';
  const vehicleFleetNo = vehicle?.fleetNumber || vehicle?.basicDetails?.fleetNumber || '';
  const vehicleRent = vehicle?.weeklyRent || vehicle?.basicDetails?.weeklyRent || 0;
  const vehicleMileage = vehicle?.currentMileage || vehicle?.basicDetails?.odometer || 0;
  const vehicleFuel = vehicle?.fuelType || vehicle?.basicDetails?.fuelType || 'Petrol';
  const vehicleColour = vehicle?.colour || vehicle?.basicDetails?.colour || '';
  const vehicleCategory = vehicle?.category || vehicle?.basicDetails?.category || '';
  const vehicleStatus = vehicle?.status || 'Active';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <AppHeader
        title="My Profile"
        showBack
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleRefresh}
              disabled={isRefreshing}
              activeOpacity={0.7}
              accessibilityLabel="Refresh profile and vehicle stats"
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <RefreshCw size={19} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, !isActiveDriver && { opacity: 0.4 }]}
              onPress={() => {
                if (!isActiveDriver) {
                  showToast('Profile editing is disabled while account is inactive.');
                  return;
                }
                navigate('EditProfile');
              }}
              disabled={!isActiveDriver}
              activeOpacity={0.7}
              accessibilityLabel="Edit profile"
            >
              <Edit3 size={19} color={isActiveDriver ? COLORS.primary : '#94A3B8'} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* DRIVER INFO SECTION */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {driver.avatarUrl ? (
                <Image
                  source={{ uri: driver.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={38} color={COLORS.textSecondary} />
                </View>
              )}
            </View>
            <View
              style={[
                styles.statusIndicatorDot,
                {
                  backgroundColor: isActiveDriver
                    ? COLORS.success
                    : isSuspended
                    ? COLORS.error
                    : isPending
                    ? COLORS.warning
                    : COLORS.textSecondary,
                },
              ]}
            />
          </View>

          <Text style={styles.driverName}>{driver.name || 'Ola Driver'}</Text>

          <View style={styles.badgesRow}>
            <StatusBadge
              label={isActiveDriver ? 'Active Driver' : driverStatus}
              variant={getStatusBadgeVariant()}
              size="sm"
            />
            {driver.driverId ? (
              <View style={styles.driverIdTag}>
                <Hash size={12} color={COLORS.textSecondary} />
                <Text style={styles.driverIdText}>{driver.driverId}</Text>
              </View>
            ) : null}
            {driver.branch ? (
              <View style={styles.branchTag}>
                <Building size={12} color={COLORS.primary} />
                <Text style={styles.branchTagText}>{driver.branch}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* 1. USER STATS STATUS BANNER */}
        <View
          style={[
            styles.statusBanner,
            isActiveDriver
              ? styles.statusBannerActive
              : isSuspended
              ? styles.statusBannerSuspended
              : styles.statusBannerInactive,
            SHADOWS.subtle,
          ]}
        >
          <View style={styles.statusBannerTop}>
            <View style={styles.statusIconWrap}>
              {isActiveDriver ? (
                <CheckCircle2 size={22} color={COLORS.success} />
              ) : isSuspended ? (
                <AlertCircle size={22} color={COLORS.error} />
              ) : (
                <ShieldCheck size={22} color={COLORS.warning} />
              )}
            </View>
            <View style={styles.statusTextWrap}>
              <View style={styles.statusHeaderRow}>
                <Text style={styles.statusTitle}>
                  {isActiveDriver ? 'Account Active' : `Account: ${driverStatus}`}
                </Text>
                <View
                  style={[
                    styles.pulseDot,
                    {
                      backgroundColor: isActiveDriver
                        ? COLORS.success
                        : isSuspended
                        ? COLORS.error
                        : COLORS.warning,
                    },
                  ]}
                />
              </View>
              <Text style={styles.statusDescription}>{getStatusDescription()}</Text>
            </View>
          </View>

          <View style={styles.statusMetaRow}>
            <View style={styles.statusMetaItem}>
              <Text style={styles.statusMetaLabel}>Standing</Text>
              <Text
                style={[
                  styles.statusMetaValue,
                  { color: isActiveDriver ? COLORS.success : COLORS.text },
                ]}
              >
                {isActiveDriver ? 'Operational' : driverStatus}
              </Text>
            </View>
            <View style={styles.statusMetaDivider} />
            <View style={styles.statusMetaItem}>
              <Text style={styles.statusMetaLabel}>Branch</Text>
              <Text style={styles.statusMetaValue}>
                {driver.branch || 'Headquarters'}
              </Text>
            </View>
            <View style={styles.statusMetaDivider} />
            <View style={styles.statusMetaItem}>
              <Text style={styles.statusMetaLabel}>Vehicle Link</Text>
              <Text style={styles.statusMetaValue}>
                {hasAssignedVehicle ? 'Assigned' : 'Unassigned'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. ASSIGNED VEHICLE & VEHICLE DETAILS SECTION */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Car size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Assigned Vehicle</Text>
          </View>
          {hasAssignedVehicle && (
            <TouchableOpacity
              onPress={() => navigate('VehicleStatus')}
              activeOpacity={0.7}
              style={styles.sectionActionBtn}
            >
              <Text style={styles.sectionActionText}>View Full Status</Text>
              <ChevronRight size={14} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {hasAssignedVehicle ? (
          <TouchableOpacity
            style={[styles.vehicleCard, SHADOWS.card]}
            onPress={() => navigate('VehicleStatus')}
            activeOpacity={0.85}
          >
            {/* Top row with make, model & status */}
            <View style={styles.vehicleHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleName}>
                  {vehicleYear ? `${vehicleYear} ` : ''}
                  {vehicleMake || 'Assigned'} {vehicleModel || 'Vehicle'}
                </Text>
                {vehicleCategory ? (
                  <Text style={styles.vehicleCategoryText}>
                    {vehicleCategory} {vehicleColour ? `• ${vehicleColour}` : ''}
                  </Text>
                ) : null}
              </View>
              <StatusBadge
                label={vehicleStatus}
                variant={vehicleStatus.toLowerCase().includes('active') ? 'success' : 'neutral'}
                size="sm"
              />
            </View>

            {/* License plate & Fleet tag banner */}
            <View style={styles.plateRow}>
              {vehiclePlate ? (
                <View style={styles.licensePlateContainer}>
                  <View style={styles.plateFlagStrip}>
                    <Text style={styles.plateFlagText}>PA</Text>
                  </View>
                  <Text style={styles.licensePlateNumber}>{vehiclePlate}</Text>
                </View>
              ) : null}

              {vehicleFleetNo ? (
                <View style={styles.fleetBadge}>
                  <Text style={styles.fleetBadgeText}>Fleet #{vehicleFleetNo}</Text>
                </View>
              ) : null}

              {vehicleRent > 0 ? (
                <View style={styles.rentBadge}>
                  <DollarSign size={12} color="#047857" />
                  <Text style={styles.rentBadgeText}>${vehicleRent}/wk</Text>
                </View>
              ) : null}
            </View>

            {/* Vehicle Specs Grid */}
            <View style={styles.specsGrid}>
              <View style={styles.specBox}>
                <Gauge size={14} color={COLORS.textSecondary} />
                <View style={styles.specBoxText}>
                  <Text style={styles.specBoxLabel}>Odometer</Text>
                  <Text style={styles.specBoxValue}>
                    {vehicleMileage > 0 ? `${vehicleMileage.toLocaleString()} km` : 'Active'}
                  </Text>
                </View>
              </View>

              <View style={styles.specBox}>
                <Fuel size={14} color={COLORS.textSecondary} />
                <View style={styles.specBoxText}>
                  <Text style={styles.specBoxLabel}>Fuel Type</Text>
                  <Text style={styles.specBoxValue}>{vehicleFuel || 'N/A'}</Text>
                </View>
              </View>

              {vehicle.vin ? (
                <View style={styles.specBox}>
                  <ShieldCheck size={14} color={COLORS.textSecondary} />
                  <View style={styles.specBoxText}>
                    <Text style={styles.specBoxLabel}>VIN</Text>
                    <Text style={styles.specBoxValue} numberOfLines={1}>
                      {vehicle.vin.length > 8 ? `...${vehicle.vin.slice(-8)}` : vehicle.vin}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Action link */}
            <View style={styles.vehicleFooterAction}>
              <Text style={styles.vehicleFooterText}>
                View specs, maintenance & documents
              </Text>
              <ChevronRight size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.noVehicleCard, SHADOWS.subtle]}>
            <View style={styles.noVehicleIconContainer}>
              <Car size={32} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.noVehicleTitle}>No Vehicle Assigned</Text>
            <Text style={styles.noVehicleSubtitle}>
              You currently do not have a vehicle allocated to your profile. Contact your branch manager or dispatch for vehicle assignment.
            </Text>
            <TouchableOpacity
              style={styles.refreshVehicleBtn}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <RefreshCw size={14} color={COLORS.primary} />
              <Text style={styles.refreshVehicleBtnText}>Check Allocation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. PROFILE MENU & DETAILS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account & Profile Details</Text>
        </View>

        <View style={[styles.menuCard, SHADOWS.subtle]}>
          <ProfileMenuItem
            icon={<User size={20} color={COLORS.primary} />}
            label="Personal Information"
            badge={
              <Text style={styles.menuValueText}>
                {driver.firstName || driver.name || 'View'}
              </Text>
            }
            onPress={() => navigate('EditProfile')}
          />
          <ProfileMenuItem
            icon={<Phone size={20} color={COLORS.primary} />}
            label="Contact Number"
            badge={
              <Text style={styles.menuValueText}>{driver.phone || 'Not set'}</Text>
            }
            onPress={() => navigate('EditProfile')}
          />
          <ProfileMenuItem
            icon={<FileBadge size={20} color={COLORS.primary} />}
            label="Driver Status & ID"
            badge={
              <StatusBadge
                label={driverStatus}
                variant={getStatusBadgeVariant()}
                size="sm"
              />
            }
            onPress={() =>
              showToast(driver.driverId ? `Driver Code: ${driver.driverId}` : `Status: ${driverStatus}`)
            }
          />
          <ProfileMenuItem
            icon={<FileText size={20} color={COLORS.primary} />}
            label="Customer Statements"
            badge={
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>View</Text>
              </View>
            }
            onPress={() => {
              if (!isActiveDriver) {
                showToast('Statements are disabled while account is inactive.');
                return;
              }
              navigate('Statements');
            }}
          />
          <ProfileMenuItem
            icon={<Building size={20} color={COLORS.primary} />}
            label="Branch / Fleet Depot"
            badge={
              <Text style={styles.menuValueText}>
                {driver.branch || 'Headquarters'}
              </Text>
            }
            onPress={() =>
              showToast(driver.branch ? `Assigned Branch: ${driver.branch}` : 'Assigned to central depot')
            }
          />
          <ProfileMenuItem
            icon={<MapPin size={20} color={COLORS.primary} />}
            label="Registered Address"
            onPress={() => showToast(driver.address || 'No address registered')}
          />
          <ProfileMenuItem
            icon={<HeartHandshake size={20} color={COLORS.primary} />}
            label="Emergency Contact"
            isLast
            onPress={() =>
              showToast(
                driver.emergencyContact
                  ? `Emergency: ${driver.emergencyContact}`
                  : 'No emergency contact on file'
              )
            }
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
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
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicatorDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  driverName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  driverIdTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  driverIdText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  branchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  branchTagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  // 1. User Stats Status Banner
  statusBanner: {
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
  },
  statusBannerActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusBannerSuspended: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusBannerInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  statusBannerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusIconWrap: {
    marginRight: 12,
    marginTop: 2,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  statusMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  statusMetaItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusMetaDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
  statusMetaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statusMetaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  sectionActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Assigned Vehicle Card
  vehicleCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  vehicleCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  licensePlateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: '#CA8A04',
    overflow: 'hidden',
  },
  plateFlagStrip: {
    backgroundColor: '#EAB308',
    paddingHorizontal: 5,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateFlagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#713F12',
  },
  licensePlateNumber: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#713F12',
    paddingHorizontal: 8,
    letterSpacing: 1.5,
  },
  fleetBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  fleetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  rentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  specsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  specBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specBoxText: {
    flex: 1,
  },
  specBoxLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  specBoxValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 1,
  },
  vehicleFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  vehicleFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // No Vehicle Card
  noVehicleCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginBottom: 24,
  },
  noVehicleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  noVehicleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  noVehicleSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
    maxWidth: 280,
  },
  refreshVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  refreshVehicleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Menu Card
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
    fontWeight: '600',
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
    marginBottom: 16,
  },
});
