import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { StatusBadge } from '../components/StatusBadge';
import { BottomNavigation } from '../components/BottomNavigation';
import { useApp } from '../context/AppContext';
import { fetchVehicleDetails } from '../api/authService';
import { VehicleDocument } from '../types';
import {
  Car,
  Wrench,
  Gauge,
  Fuel,
  Hash,
  ShieldCheck,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  Phone,
  Navigation,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Share2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const VehicleStatusScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { vehicle, updateVehicle, activeProfile, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'maintenance'>('overview');
  const [selectedDoc, setSelectedDoc] = useState<VehicleDocument | null>(null);
  const [isDocModalVisible, setIsDocModalVisible] = useState<boolean>(false);

  // Fetch full vehicle info and docs from backend on mount or when plate/id changes
  useEffect(() => {
    let isMounted = true;
    const loadVehicle = async () => {
      try {
        const queryId =
          vehicle?.plateNumber ||
          vehicle?.id ||
          activeProfile?.vehicle?.plateNumber ||
          activeProfile?.vehicle?.id;

        if (queryId) {
          const res = await fetchVehicleDetails(queryId);
          if (isMounted && (res?.data || res?.vehicle)) {
            updateVehicle(res.data || res.vehicle);
          }
        }
      } catch (err: any) {
        console.warn('[VehicleStatusScreen] Backend fetch error:', err.message);
      }
    };

    loadVehicle();
    return () => {
      isMounted = false;
    };
  }, [vehicle?.plateNumber, vehicle?.id]);

  const currentMileage = vehicle?.currentMileage || 18450;
  const nextService = vehicle?.nextService || 23450;
  const remainingKm = Math.max(0, nextService - currentMileage);
  const serviceInterval = 5000;
  const progressRatio = Math.min(1, Math.max(0, (serviceInterval - remainingKm) / serviceInterval));
  const progressPercent = Math.round(progressRatio * 100);

  const documents: VehicleDocument[] = vehicle?.documents || [
    {
      id: 'doc_reg_fb',
      title: 'Registration Certificate (Registro Único)',
      type: 'REGISTRATION',
      docNumber: `RUV-${vehicle.plateNumber}-PAN`,
      expiryDate: '2027-04-28T10:00:00.000Z',
      status: 'Valid',
      issuer: 'Autoridad del Tránsito y Transporte Terrestre (ATTT)',
    },
    {
      id: 'doc_tax_fb',
      title: 'Municipal Road Tax & Sticker (Placa / Calcomanía)',
      type: 'ROAD_TAX',
      docNumber: `TAX-${vehicle.plateNumber}`,
      expiryDate: '2027-03-29T10:00:00.000Z',
      status: 'Valid',
      issuer: 'Municipio de Panamá',
    },
    {
      id: 'doc_rev_fb',
      title: 'Mechanical Inspection (Revisado Vehicular)',
      type: 'ROADWORTHINESS',
      docNumber: `REV-${vehicle.plateNumber}-2026`,
      expiryDate: '2027-02-27T10:00:00.000Z',
      status: 'Valid',
      issuer: 'Centro Técnico de Revisado Autorizado',
    },
    {
      id: 'doc_ins_fb',
      title: 'Commercial Fleet Insurance Certificate',
      type: 'INSURANCE',
      docNumber: vehicle?.insurance?.policyNumber || 'POL-OLA-2026-0941',
      expiryDate: vehicle?.insurance?.expiryDate || '2027-07-27T10:00:00.000Z',
      status: 'Valid',
      issuer: vehicle?.insurance?.provider || 'ASSA Compañía de Seguros, S.A.',
    },
  ];

  const handleOpenDoc = (doc: VehicleDocument) => {
    setSelectedDoc(doc);
    setIsDocModalVisible(true);
  };

  const handleDownloadDoc = (doc: VehicleDocument) => {
    showToast(`Downloading ${doc.title}...`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Vehicle Info & Status" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* VEHICLE HERO CARD */}
        <View style={[styles.heroCard, SHADOWS.card]}>
          <View style={styles.heroDetails}>
            <View style={styles.heroHeaderBar}>
              <View style={styles.heroIconBadgeGroup}>
                <View style={styles.heroCarIconBox}>
                  <Car size={22} color={COLORS.primary} strokeWidth={2.5} />
                </View>
                <View style={styles.branchPill}>
                  <Text style={styles.branchPillText}>
                    {vehicle.branch || 'Panama City Depot'}
                  </Text>
                </View>
              </View>
              <StatusBadge label={vehicle.status || 'Active'} variant="success" />
            </View>

            <View style={styles.heroTitleRow}>
              <Text style={styles.vehicleName}>
                {vehicle.make} {vehicle.model}
              </Text>
              <Text style={styles.vehicleModel}>
                {vehicle.variant} · {vehicle.year}
              </Text>
            </View>

            {/* QUICK HIGHLIGHT CHIPS */}
            <View style={styles.highlightPillsRow}>
              <View style={styles.pillItem}>
                <Text style={styles.pillLabel}>PLATE</Text>
                <Text style={styles.pillValue}>{vehicle.plateNumber}</Text>
              </View>
              <View style={styles.pillDivider} />
              <View style={styles.pillItem}>
                <Text style={styles.pillLabel}>FLEET NO</Text>
                <Text style={styles.pillValue}>{vehicle.fleetNumber || 'FL-101'}</Text>
              </View>
              <View style={styles.pillDivider} />
              <View style={styles.pillItem}>
                <Text style={styles.pillLabel}>FUEL</Text>
                <Text style={styles.pillValue}>{vehicle.fuelType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3-WAY SEGMENTED NAVIGATION */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'overview' && styles.segmentTabActive,
            ]}
            onPress={() => setActiveTab('overview')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'overview' && styles.segmentTextActive,
              ]}
            >
              Specs & Info
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'documents' && styles.segmentTabActive,
            ]}
            onPress={() => setActiveTab('documents')}
            activeOpacity={0.7}
          >
            <View style={styles.tabBadgeRow}>
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'documents' && styles.segmentTextActive,
                ]}
              >
                Documents
              </Text>
              <View style={styles.docCountBadge}>
                <Text style={styles.docCountBadgeText}>{documents.length}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'maintenance' && styles.segmentTabActive,
            ]}
            onPress={() => setActiveTab('maintenance')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'maintenance' && styles.segmentTextActive,
              ]}
            >
              Maintenance
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB CONTENT: SPECS & INFO */}
        {activeTab === 'overview' && (
          <>
            {/* FULL MECHANICAL & VEHICLE SPECIFICATIONS */}
            <View style={[styles.infoCard, SHADOWS.subtle]}>
              <Text style={styles.cardHeader}>Technical Specifications</Text>

              <View style={styles.infoRow}>
                <View style={styles.iconLabelGroup}>
                  <Hash size={18} color={COLORS.textSecondary} />
                  <Text style={styles.infoLabel}>Registration / Plate</Text>
                </View>
                <Text style={styles.infoValueBold}>{vehicle.plateNumber}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconLabelGroup}>
                  <ShieldCheck size={18} color={COLORS.textSecondary} />
                  <Text style={styles.infoLabel}>VIN / Chassis Number</Text>
                </View>
                <Text style={styles.infoValueMono}>{vehicle.vin}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconLabelGroup}>
                  <Layers size={18} color={COLORS.textSecondary} />
                  <Text style={styles.infoLabel}>Engine Number</Text>
                </View>
                <Text style={styles.infoValueMono}>
                  {vehicle.engineNumber || 'ENG-4B11-9238'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconLabelGroup}>
                  <Sparkles size={18} color={COLORS.textSecondary} />
                  <Text style={styles.infoLabel}>Exterior Colour</Text>
                </View>
                <Text style={styles.infoValue}>
                  {vehicle.colour || 'Silver Metallic'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconLabelGroup}>
                  <Fuel size={18} color={COLORS.textSecondary} />
                  <Text style={styles.infoLabel}>Fuel Type</Text>
                </View>
                <Text style={styles.infoValue}>{vehicle.fuelType}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconLabelGroup}>
                  <Gauge size={18} color={COLORS.textSecondary} />
                  <Text style={styles.infoLabel}>Transmission</Text>
                </View>
                <Text style={styles.infoValue}>
                  {vehicle.transmission || 'Automatic'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconLabelGroup}>
                  <Layers size={18} color={COLORS.textSecondary} />
                  <Text style={styles.infoLabel}>Seating Capacity</Text>
                </View>
                <Text style={styles.infoValue}>
                  {vehicle.seats ? `${vehicle.seats} Passengers` : '5 Passengers'}
                </Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <View style={styles.iconLabelGroup}>
                  <Navigation size={18} color={COLORS.textSecondary} />
                  <Text style={styles.infoLabel}>Assigned Hub / Branch</Text>
                </View>
                <Text style={styles.infoValueBold}>
                  {vehicle.branch || 'Panama City Central'}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* TAB CONTENT: DOCUMENTS */}
        {activeTab === 'documents' && (
          <View style={styles.documentsContainer}>
            {/* DOCUMENTS SUMMARY BANNER */}
            <View style={[styles.docsBannerCard, SHADOWS.subtle]}>
              <View style={styles.docsBannerIconCircle}>
                <ShieldCheck size={24} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docsBannerTitle}>All Documents Verified</Text>
                <Text style={styles.docsBannerSub}>
                  Official government permits & active insurance cards on file.
                </Text>
              </View>
            </View>

            {/* DOCUMENT CARDS LIST */}
            {documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={[styles.documentCard, SHADOWS.subtle]}
                activeOpacity={0.7}
                onPress={() => handleOpenDoc(doc)}
              >
                <View style={styles.docCardTop}>
                  <View style={styles.docTypeIconCircle}>
                    <FileText size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.docHeaderInfo}>
                    <Text style={styles.docTitle}>{doc.title}</Text>
                    <Text style={styles.docNumber}>Doc #: {doc.docNumber}</Text>
                  </View>
                  <View style={styles.docValidBadge}>
                    <Text style={styles.docValidBadgeText}>
                      {doc.status || 'Valid'}
                    </Text>
                  </View>
                </View>

                <View style={styles.docDivider} />

                <View style={styles.docCardBottom}>
                  <View style={styles.docMetaItem}>
                    <Calendar size={13} color={COLORS.textSecondary} />
                    <Text style={styles.docMetaText}>
                      Exp:{' '}
                      <Text style={styles.docMetaHighlight}>
                        {doc.expiryDate
                          ? new Date(doc.expiryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Valid'}
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.docActionGroup}>
                    <TouchableOpacity
                      style={styles.viewDocBtn}
                      onPress={() => handleOpenDoc(doc)}
                    >
                      <Eye size={14} color={COLORS.primary} />
                      <Text style={styles.viewDocBtnText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.downloadIconBtn}
                      onPress={() => handleDownloadDoc(doc)}
                    >
                      <Download size={14} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* COMMERCIAL INSURANCE DETAILS CARD */}
            <View style={[styles.insuranceCard, SHADOWS.subtle]}>
              <View style={styles.insuranceHeader}>
                <View>
                  <Text style={styles.cardHeader}>Commercial Fleet Insurance</Text>
                  <Text style={styles.cardSubHeader}>
                    {vehicle.insurance?.provider || 'ASSA Compañía de Seguros, S.A.'}
                  </Text>
                </View>
                <View style={styles.insuranceBadge}>
                  <Text style={styles.insuranceBadgeText}>ACTIVE POLICY</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Policy Number</Text>
                <Text style={styles.infoValueMono}>
                  {vehicle.insurance?.policyNumber || 'POL-OLA-2026-0941'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Coverage Level</Text>
                <Text style={styles.infoValue}>
                  {vehicle.insurance?.coverageType || 'Full Comprehensive Fleet'}
                </Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>24/7 Policy Emergency Phone</Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('tel:+5078002772')}
                  style={styles.callSupportRow}
                >
                  <Phone size={14} color={COLORS.primary} />
                  <Text style={styles.phoneHighlight}>+507 800-2772</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* TAB CONTENT: MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <>
            {/* SERVICE PROGRESS CARD */}
            <View style={[styles.serviceCard, SHADOWS.subtle]}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceTitle}>Service Schedule</Text>
                <Text style={styles.remainingText}>
                  {remainingKm.toLocaleString()} km remaining
                </Text>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>

              <View style={styles.progressLabels}>
                <Text style={styles.progressSubLabel}>
                  Last: {(currentMileage - (serviceInterval - remainingKm)).toLocaleString()} km
                </Text>
                <Text style={styles.progressCurrentKm}>
                  Current: {currentMileage.toLocaleString()} km
                </Text>
                <Text style={styles.progressSubLabel}>
                  Target: {nextService.toLocaleString()} km
                </Text>
              </View>
            </View>

            {/* ROUTINE MAINTENANCE ITEMS */}
            <View style={[styles.infoCard, SHADOWS.subtle]}>
              <Text style={styles.cardHeader}>Routine Maintenance Checklist</Text>

              <View style={styles.checkItemRow}>
                <View style={styles.checkIconBox}>
                  <CheckCircle2 size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkItemTitle}>Engine Oil & Filter</Text>
                  <Text style={styles.checkItemSub}>Synthetic 5W-30 Oil · Inspected</Text>
                </View>
                <Text style={styles.checkStatusGood}>OK</Text>
              </View>

              <View style={styles.checkItemRow}>
                <View style={styles.checkIconBox}>
                  <CheckCircle2 size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkItemTitle}>Brake Pads & Rotors</Text>
                  <Text style={styles.checkItemSub}>Front 8mm · Rear 7mm</Text>
                </View>
                <Text style={styles.checkStatusGood}>OK</Text>
              </View>

              <View style={styles.checkItemRow}>
                <View style={styles.checkIconBox}>
                  <CheckCircle2 size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkItemTitle}>Tire Tread & Pressure</Text>
                  <Text style={styles.checkItemSub}>32 PSI · Tread depth 6.5mm</Text>
                </View>
                <Text style={styles.checkStatusGood}>OK</Text>
              </View>

              <View style={[styles.checkItemRow, { borderBottomWidth: 0 }]}>
                <View style={styles.checkIconBox}>
                  <CheckCircle2 size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkItemTitle}>Battery & Electrical</Text>
                  <Text style={styles.checkItemSub}>12.6V Static · Alternator verified</Text>
                </View>
                <Text style={styles.checkStatusGood}>OK</Text>
              </View>
            </View>

            {/* ROADSIDE ASSISTANCE & REPORT ISSUE */}
            <View style={[styles.supportCard, SHADOWS.subtle]}>
              <View style={styles.supportHeader}>
                <Wrench size={20} color={COLORS.primary} />
                <Text style={styles.supportTitle}>Workshop & Emergency Support</Text>
              </View>
              <Text style={styles.supportText}>
                Need unscheduled maintenance or emergency mechanical assistance? Contact the fleet operations team directly.
              </Text>
              <TouchableOpacity
                style={styles.supportBtn}
                onPress={() => showToast('Connecting to Fleet Dispatch...')}
              >
                <Phone size={16} color={COLORS.white} />
                <Text style={styles.supportBtnText}>Call Fleet Dispatch (24/7)</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* DOCUMENT PREVIEW MODAL */}
      <Modal
        visible={isDocModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDocModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, SHADOWS.card]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleGroup}>
                <FileText size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedDoc?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsDocModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalStatusRow}>
                <View style={styles.modalVerifiedBadge}>
                  <CheckCircle2 size={14} color="#059669" />
                  <Text style={styles.modalVerifiedText}>OFFICIALLY VERIFIED</Text>
                </View>
                <Text style={styles.modalExpDate}>
                  Valid until:{' '}
                  {selectedDoc?.expiryDate
                    ? new Date(selectedDoc.expiryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Permanent'}
                </Text>
              </View>

              <View style={styles.modalFieldBox}>
                <Text style={styles.modalFieldLabel}>DOCUMENT NUMBER</Text>
                <Text style={styles.modalFieldValue}>{selectedDoc?.docNumber}</Text>
              </View>

              <View style={styles.modalFieldBox}>
                <Text style={styles.modalFieldLabel}>ISSUING AUTHORITY</Text>
                <Text style={styles.modalFieldValue}>
                  {selectedDoc?.issuer || 'Government Authority'}
                </Text>
              </View>

              <View style={styles.modalFieldBox}>
                <Text style={styles.modalFieldLabel}>ASSIGNED VEHICLE</Text>
                <Text style={styles.modalFieldValue}>
                  {vehicle.make} {vehicle.model} ({vehicle.plateNumber})
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalDownloadBtn}
                onPress={() => {
                  setIsDocModalVisible(false);
                  showToast(`Downloaded ${selectedDoc?.title}`);
                }}
              >
                <Download size={16} color={COLORS.white} />
                <Text style={styles.modalDownloadText}>Download Certificate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  heroDetails: {
    padding: 18,
  },
  heroHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroCarIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  branchPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  branchPillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitleRow: {
    marginBottom: 14,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  vehicleModel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  highlightPillsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  pillItem: {
    flex: 1,
    alignItems: 'center',
  },
  pillLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pillValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  pillDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 18,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentTabActive: {
    borderBottomColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  docCountBadge: {
    backgroundColor: 'rgba(0, 168, 107, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  docCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubHeader: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  iconLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoValueBold: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  infoValueMono: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  documentsContainer: {
    marginBottom: 16,
  },
  docsBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
    gap: 12,
  },
  docsBannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docsBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  docsBannerSub: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
    lineHeight: 16,
  },
  documentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  docCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docTypeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 168, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docHeaderInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  docNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  docValidBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  docValidBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  docDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  docCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  docMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  docMetaHighlight: {
    fontWeight: '700',
    color: COLORS.text,
  },
  docActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(0, 168, 107, 0.08)',
  },
  viewDocBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  downloadIconBtn: {
    padding: 6,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
  },
  insuranceCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 6,
    marginBottom: 16,
  },
  insuranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  insuranceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  insuranceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  callSupportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  progressCurrentKm: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  checkIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  checkItemSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  checkStatusGood: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  supportCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  supportText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  supportBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  modalVerifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  modalExpDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalFieldBox: {
    marginBottom: 12,
  },
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalFieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalActions: {
    gap: 10,
  },
  modalDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  modalDownloadText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
