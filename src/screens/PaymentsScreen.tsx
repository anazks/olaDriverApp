import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { PaymentCard } from '../components/PaymentCard';
import { PaymentMethodCard } from '../components/PaymentMethodCard';
import { ActivityItem } from '../components/ActivityItem';
import { BottomNavigation } from '../components/BottomNavigation';
import { useApp } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PaymentsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { financial, activities, paymentMethods, navigate, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const paymentActivities = activities.filter((a) => a.category === 'Payments');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Payments" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TOP PAYMENT CARD */}
        <PaymentCard
          totalDue={financial.currentDue}
          dueDate={financial.paymentDueDate}
          onPayNow={() => navigate('MakePayment')}
        />

        {/* SEGMENTED TABS: OVERVIEW / HISTORY */}
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
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'history' && styles.segmentTabActive,
            ]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'history' && styles.segmentTextActive,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'overview' ? (
          <>
            {/* PAYMENT BREAKDOWN */}
            <View style={[styles.breakdownCard, SHADOWS.subtle]}>
              <Text style={styles.sectionTitle}>Payment Breakdown</Text>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Base Rental</Text>
                <Text style={styles.breakdownValue}>
                  ${financial.baseRental.toFixed(2)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Insurance</Text>
                <Text style={styles.breakdownValue}>
                  ${financial.insurance.toFixed(2)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Service Fee</Text>
                <Text style={styles.breakdownValue}>
                  ${financial.serviceFee.toFixed(2)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdownTotalRow}>
                <Text style={styles.totalLabel}>Total Due</Text>
                <Text style={styles.totalAmount}>
                  ${financial.currentDue.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* PAYMENT METHODS */}
            <View style={styles.paymentMethodsHeader}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              <TouchableOpacity onPress={() => showToast('Add card opened')}>
                <Text style={styles.addMethodText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {paymentMethods.map((pm) => (
              <PaymentMethodCard
                key={pm.id}
                type={pm.type}
                last4={pm.last4}
                email={pm.email}
                isDefault={pm.isDefault}
                onPress={() => showToast(`Payment method selected: ${pm.type}`)}
              />
            ))}
          </>
        ) : (
          /* PAYMENT HISTORY LIST */
          <View style={[styles.historyCard, SHADOWS.subtle]}>
            {paymentActivities.length > 0 ? (
              paymentActivities.map((act, index) => (
                <ActivityItem
                  key={act.id}
                  activity={act}
                  isLast={index === paymentActivities.length - 1}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No payment history yet.</Text>
              </View>
            )}
          </View>
        )}
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
  segmentContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  paymentMethodsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addMethodText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
