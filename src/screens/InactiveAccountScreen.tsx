import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import {
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  Mail,
  RefreshCw,
  LogOut,
  Car,
  Ban,
  User,
  MapPin,
  Clock,
  ChevronRight,
  Info,
} from 'lucide-react-native';

const SUPPORT_PHONE = '+5078339595';
const SUPPORT_PHONE_DISPLAY = '+507 833-9595';
const SUPPORT_WHATSAPP = '50760001234';
const SUPPORT_WHATSAPP_DISPLAY = '+507 6000-1234';
const SUPPORT_EMAIL = 'soporte@olacars.com';
const SUPPORT_HOURS = 'Monday – Saturday · 8:00 AM – 6:00 PM';
const SUPPORT_ADDRESS = 'Vía España, PH OLA Cars Center, Panama City';

export const InactiveAccountScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { driver, logout, refreshProfile, showToast, navigate } = useApp();
  const [checking, setChecking] = useState(false);

  const handleCall = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {
      showToast('Unable to open phone dialer');
    });
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello OLACARS Support, my account (${driver.name || driver.driverId || driver.email}) is currently inactive. Could you please assist me with activation and vehicle assignment?`
    );
    const url = `whatsapp://send?phone=${SUPPORT_WHATSAPP}&text=${text}`;
    const webFallback = `https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) return Linking.openURL(url);
        return Linking.openURL(webFallback);
      })
      .catch(() => {
        showToast('Unable to launch WhatsApp');
      });
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(
      `Account Activation Request - ${driver.name || driver.driverId}`
    );
    const body = encodeURIComponent(
      `Hello OLACARS Team,\n\nMy driver account is marked as INACTIVE and vehicle asset is unassigned.\n\nDriver Details:\n- Name: ${driver.name}\n- Driver ID: ${driver.driverId}\n- Email: ${driver.email}\n- Phone: ${driver.phone}\n\nPlease review and activate my account.\n\nThank you.`
    );
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`).catch(() => {
      showToast('Unable to open email client');
    });
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const result = await refreshProfile();
      const updatedStatus = (result?.driver?.status || driver.status || '').toUpperCase();
      if (updatedStatus === 'ACTIVE' || updatedStatus === 'APPROVED') {
        showToast('Account activated! Welcome to OLACARS.');
        navigate('Dashboard');
      } else {
        showToast('Status is still INACTIVE. Please contact support.');
      }
    } catch {
      showToast('Could not verify status. Check your network.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 8 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FB" />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLogoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
            accessibilityLabel="OLACARS Logo"
          />
        </View>

        <TouchableOpacity
          style={styles.logoutTopButton}
          onPress={logout}
          activeOpacity={0.7}
          accessibilityLabel="Log out"
        >
          <LogOut size={16} color="#DC2626" />
          <Text style={styles.logoutTopText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO INACTIVE CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroLogoBadge}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.heroLogo}
              resizeMode="contain"
              accessibilityLabel="OLACARS Logo"
            />
          </View>

          <View style={styles.alertIconCircleOuter}>
            <View style={styles.alertIconCircleInner}>
              <ShieldAlert size={36} color="#D97706" />
            </View>
          </View>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>ACCOUNT INACTIVE</Text>
          </View>

          <Text style={styles.heroTitle}>Account Currently Inactive</Text>
          <Text style={styles.heroDescription}>
            Your driver profile is currently marked as <Text style={styles.boldRed}>INACTIVE</Text>.
            All vehicle assets are unassigned. Please contact <Text style={styles.boldDark}>OLACARS</Text> to
            activate your contract and assign your vehicle.
          </Text>
        </View>

        {/* CUSTOMER / DRIVER SUMMARY CARD */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionHeaderTitle}>Profile Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <User size={18} color="#475569" />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Driver / Customer Name</Text>
              <Text style={styles.infoValue}>{driver.name || 'Not provided'}</Text>
            </View>
          </View>

          {Boolean(driver.driverId) && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Info size={18} color="#475569" />
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Driver Code</Text>
                <Text style={styles.infoValue}>{driver.driverId}</Text>
              </View>
            </View>
          )}

          {Boolean(driver.email) && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Mail size={18} color="#475569" />
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Registered Email</Text>
                <Text style={styles.infoValue}>{driver.email}</Text>
              </View>
            </View>
          )}

          {Boolean(driver.phone) && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <PhoneCall size={18} color="#475569" />
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{driver.phone}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <MapPin size={18} color="#475569" />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Branch</Text>
              <Text style={styles.infoValue}>
                {driver.branch || 'Panama Main Branch'}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.infoRowLast]}>
            <View style={[styles.infoIconBox, styles.infoIconBoxRed]}>
              <Ban size={18} color="#DC2626" />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Assigned Vehicle</Text>
              <View style={styles.unassignedBadge}>
                <Text style={styles.unassignedBadgeText}>No Vehicle Assigned (Unassigned)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CONTACT OLACARS ACTIONS */}
        <View style={styles.contactCard}>
          <Text style={styles.sectionHeaderTitle}>Contact OLACARS to Activate</Text>
          <Text style={styles.contactSubtitle}>
            Reach out to our operations team for contract renewal or vehicle allocation:
          </Text>

          {/* WhatsApp Action */}
          <TouchableOpacity
            style={styles.actionBtnWhatsApp}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <View style={styles.actionBtnIconBoxGreen}>
              <MessageSquare size={20} color="#FFFFFF" />
            </View>
            <View style={styles.actionBtnContent}>
              <Text style={styles.actionBtnTitleGreen}>Chat on WhatsApp</Text>
              <Text style={styles.actionBtnSubGreen}>{SUPPORT_WHATSAPP_DISPLAY} · Fast response</Text>
            </View>
            <ChevronRight size={18} color="#059669" />
          </TouchableOpacity>

          {/* Call Support Action */}
          <TouchableOpacity
            style={styles.actionBtnPhone}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <View style={styles.actionBtnIconBoxDark}>
              <PhoneCall size={20} color="#000000" />
            </View>
            <View style={styles.actionBtnContent}>
              <Text style={styles.actionBtnTitleDark}>Call Support</Text>
              <Text style={styles.actionBtnSubDark}>{SUPPORT_PHONE_DISPLAY} · Toll free</Text>
            </View>
            <ChevronRight size={18} color="#111827" />
          </TouchableOpacity>

          {/* Email Support Action */}
          <TouchableOpacity
            style={styles.actionBtnEmail}
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <View style={styles.actionBtnIconBoxBlue}>
              <Mail size={20} color="#1D4ED8" />
            </View>
            <View style={styles.actionBtnContent}>
              <Text style={styles.actionBtnTitleBlue}>Email Support</Text>
              <Text style={styles.actionBtnSubBlue}>{SUPPORT_EMAIL}</Text>
            </View>
            <ChevronRight size={18} color="#2563EB" />
          </TouchableOpacity>

          {/* Operating hours note */}
          <View style={styles.hoursRow}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.hoursText}>{SUPPORT_HOURS}</Text>
          </View>

          <View style={styles.addressRow}>
            <MapPin size={14} color="#64748B" />
            <Text style={styles.addressText}>{SUPPORT_ADDRESS}</Text>
          </View>
        </View>

        {/* LIVE REFRESH BUTTON */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleCheckStatus}
          disabled={checking}
          activeOpacity={0.8}
        >
          {checking ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <RefreshCw size={18} color="#000000" />
          )}
          <Text style={styles.refreshButtonText}>
            {checking ? 'Checking Status with OLACARS...' : 'Check Status & Re-activate'}
          </Text>
        </TouchableOpacity>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutButtonText}>Log Out of Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLogoContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 125,
    height: 26,
  },
  heroLogoBadge: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  heroLogo: {
    width: 180,
    height: 38,
  },
  logoutTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  logoutTopText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    ...SHADOWS.card,
    marginBottom: 16,
  },
  alertIconCircleOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  alertIconCircleInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  },
  boldRed: {
    fontWeight: '700',
    color: '#DC2626',
  },
  boldDark: {
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...SHADOWS.subtle,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoIconBoxRed: {
    backgroundColor: '#FEE2E2',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  unassignedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  unassignedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    ...SHADOWS.subtle,
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  actionBtnWhatsApp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 10,
  },
  actionBtnIconBoxGreen: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionBtnContent: {
    flex: 1,
  },
  actionBtnTitleGreen: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#065F46',
  },
  actionBtnSubGreen: {
    fontSize: 12,
    color: '#047857',
    marginTop: 1,
  },
  actionBtnPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 10,
  },
  actionBtnIconBoxDark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionBtnTitleDark: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionBtnSubDark: {
    fontSize: 12,
    color: '#475569',
    marginTop: 1,
  },
  actionBtnEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 14,
  },
  actionBtnIconBoxBlue: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionBtnTitleBlue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  actionBtnSubBlue: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  hoursText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    ...SHADOWS.subtle,
  },
  refreshButtonText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    height: 48,
    borderRadius: RADIUS.lg,
  },
  logoutButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#DC2626',
  },
});
