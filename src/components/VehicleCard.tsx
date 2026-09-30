import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { StatusBadge } from './StatusBadge';
import { ChevronRight, Gauge, Fuel } from 'lucide-react-native';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.topInfo}>
        <View style={styles.textContainer}>
          <Text style={styles.makeModel}>
            {vehicle.make} {vehicle.model}
          </Text>
          <Text style={styles.variant}>
            {vehicle.variant} • {vehicle.year}
          </Text>

          <View style={styles.badgeRow}>
            <StatusBadge label={vehicle.status} variant="success" size="sm" />
            <View style={styles.plateTag}>
              <Text style={styles.plateText}>{vehicle.plateNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <ChevronRight size={18} color={COLORS.textSecondary} strokeWidth={2.5} />
        </View>
      </View>

      {/* CAR IMAGE CONTAINER */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.imageUrl }}
          style={styles.carImage}
          resizeMode="cover"
        />
      </View>

      {/* SPECS QUICK FOOTER */}
      <View style={styles.specsRow}>
        <View style={styles.specItem}>
          <Gauge size={14} color={COLORS.textSecondary} strokeWidth={2} />
          <Text style={styles.specText}>
            {vehicle.currentMileage.toLocaleString()} km
          </Text>
        </View>
        <View style={styles.specDivider} />
        <View style={styles.specItem}>
          <Fuel size={14} color={COLORS.textSecondary} strokeWidth={2} />
          <Text style={styles.specText}>{vehicle.fuelType}</Text>
        </View>
        <View style={styles.specDivider} />
        <View style={styles.specItem}>
          <Text style={styles.specMuted}>Service in </Text>
          <Text style={styles.specHighlight}>
            {(vehicle.nextService - vehicle.currentMileage).toLocaleString()} km
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  makeModel: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  variant: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 8,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plateTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  plateText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1.4,
    fontFamily: 'monospace',
  },
  arrowContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageContainer: {
    width: '100%',
    height: 146,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E2E8F0',
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.1,
  },
  specMuted: {
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 0.1,
  },
  specHighlight: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.1,
  },
});
