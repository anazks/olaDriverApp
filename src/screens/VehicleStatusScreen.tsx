import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { StatusBadge } from '../components/StatusBadge';
import { BottomNavigation } from '../components/BottomNavigation';
import { useApp } from '../context/AppContext';
import { Wrench, Gauge, Fuel, Hash, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const VehicleStatusScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { vehicle } = useApp();

  const remainingKm = vehicle.nextService - vehicle.currentMileage;
  const progressRatio = vehicle.currentMileage / vehicle.nextService;
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Vehicle Status" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* LARGE VEHICLE IMAGE CENTERED */}
        <View style={[styles.imageCard, SHADOWS.card]}>
          <Image
            source={{ uri: vehicle.imageUrl }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
        </View>

        {/* VEHICLE TITLE & BADGE */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.vehicleName}>
              {vehicle.make} {vehicle.model}
            </Text>
            <Text style={styles.vehicleModel}>{vehicle.variant} {vehicle.year}</Text>
          </View>
          <StatusBadge label={vehicle.status} variant="success" />
        </View>

        {/* VEHICLE INFORMATION CARD */}
        <View style={[styles.infoCard, SHADOWS.subtle]}>
          <Text style={styles.cardHeader}>Vehicle Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconLabelGroup}>
              <Hash size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Plate Number</Text>
            </View>
            <Text style={styles.infoValueBold}>{vehicle.plateNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconLabelGroup}>
              <ShieldCheck size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>VIN Number</Text>
            </View>
            <Text style={styles.infoValueMono}>{vehicle.vin}</Text>
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
              <Text style={styles.infoLabel}>Current Mileage</Text>
            </View>
            <Text style={styles.infoValue}>
              {vehicle.currentMileage.toLocaleString()} km
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.iconLabelGroup}>
              <Wrench size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Next Service</Text>
            </View>
            <Text style={styles.infoValue}>
              {vehicle.nextService.toLocaleString()} km
            </Text>
          </View>
        </View>

        {/* SERVICE PROGRESS CARD */}
        <View style={[styles.serviceCard, SHADOWS.subtle]}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceTitle}>Service Schedule</Text>
            <Text style={styles.remainingText}>{remainingKm.toLocaleString()} km remaining</Text>
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
            <Text style={styles.progressSubLabel}>0 km</Text>
            <Text style={styles.progressSubLabel}>{vehicle.currentMileage.toLocaleString()} km</Text>
            <Text style={styles.progressSubLabel}>{vehicle.nextService.toLocaleString()} km</Text>
          </View>
        </View>
      </ScrollView>

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
  imageCard: {
    width: '100%',
    height: 190,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
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
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
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
});
