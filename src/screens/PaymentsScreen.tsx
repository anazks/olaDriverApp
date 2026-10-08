import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { PaymentCard } from '../components/PaymentCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { useApp } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCustomerStatement } from '../api/authService';
import { StatementTransaction, CustomerStatementData, PendingInvoice } from '../types';
import {
  FileText,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Calendar,
  Clock,
  RotateCcw,
  RefreshCw,
  CreditCard,
  ShieldCheck,
} from 'lucide-react-native';

export const PaymentsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    financial,
    updateFinancial,
    paymentMethods,
    navigate,
    showToast,
    activeProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'statement'>('overview');
  const [statementData, setStatementData] = useState<CustomerStatementData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load statement from backend
  const loadStatement = useCallback(async (isPullRefresh = false) => {
    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const customerId = activeProfile?.id || activeProfile?.customerId || 'me';
      const res = await fetchCustomerStatement(customerId);
      if (res && res.success) {
        setStatementData({
          summary: res.summary,
          statement: res.statement,
        });

        // Keep AppContext financial pending balance synchronized with backend customer statement
        if (typeof res.summary?.pendingAmount === 'number') {
          updateFinancial({
            currentDue: res.summary.pendingAmount,
            paymentDueDate: res.summary.nextDueDate || financial.paymentDueDate,
            baseRental: res.summary.breakdown?.baseRental ?? financial.baseRental,
            insurance: res.summary.breakdown?.insurance ?? financial.insurance,
            serviceFee: res.summary.breakdown?.serviceFee ?? financial.serviceFee,
          });
        }
      }
    } catch (err: any) {
      console.warn('[PaymentsScreen] Error loading statement:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeProfile?.id, activeProfile?.customerId]);

  useEffect(() => {
    loadStatement();
  }, [loadStatement]);

  const pendingAmount = statementData?.summary?.pendingAmount ?? financial.currentDue;
  const dueDate = statementData?.summary?.nextDueDate ?? financial.paymentDueDate;
  const pendingInvoices = statementData?.summary?.pendingInvoices || [];
  const statementList = statementData?.statement || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Payments" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadStatement(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* TOP PAYMENT CARD — SHOWS REAL PENDING BALANCE & PAY NOW BUTTON */}
        <PaymentCard
          totalDue={pendingAmount}
          dueDate={dueDate}
          buttonText={
            pendingAmount > 0
              ? `Pay Pending Balance · $${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'Pay Now'
          }
          onPayNow={() => navigate('MakePayment')}
        />

        {/* SEGMENTED TABS: OVERVIEW / STATEMENT */}
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
              activeTab === 'statement' && styles.segmentTabActive,
            ]}
            onPress={() => setActiveTab('statement')}
            activeOpacity={0.7}
          >
            <View style={styles.tabBadgeRow}>
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'statement' && styles.segmentTextActive,
                ]}
              >
                Statement
              </Text>
              {statementList.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{statementList.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching statement & ledger...</Text>
          </View>
        ) : activeTab === 'overview' ? (
          <>
            {/* OVERVIEW SECTION: PENDING AMOUNT DATA */}
            <View style={[styles.pendingSummaryCard, SHADOWS.subtle]}>
              <View style={styles.pendingHeaderRow}>
                <View>
                  <Text style={styles.pendingLabel}>Pending Amount Due</Text>
                  <Text style={styles.pendingAmountLarge}>
                    ${pendingAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.pendingStatusBadge,
                    pendingAmount > 0 ? styles.badgePending : styles.badgePaid,
                  ]}
                >
                  {pendingAmount > 0 ? (
                    <Clock size={13} color="#D97706" />
                  ) : (
                    <CheckCircle2 size={13} color="#059669" />
                  )}
                  <Text
                    style={[
                      styles.pendingStatusText,
                      pendingAmount > 0 ? styles.textPending : styles.textPaid,
                    ]}
                  >
                    {pendingAmount > 0 ? 'Payment Due' : 'Paid in Full'}
                  </Text>
                </View>
              </View>

              <View style={styles.pendingMetaRow}>
                <Calendar size={14} color={COLORS.textSecondary} />
                <Text style={styles.pendingMetaText}>
                  Scheduled Due Date: <Text style={styles.boldText}>{dueDate}</Text>
                </Text>
              </View>
            </View>

            {/* PENDING CHARGES BREAKDOWN */}
            <View style={[styles.breakdownCard, SHADOWS.subtle]}>
              <Text style={styles.sectionTitle}>Pending Charges Breakdown</Text>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Base Weekly Rental</Text>
                <Text style={styles.breakdownValue}>
                  ${(statementData?.summary?.breakdown?.baseRental ?? financial.baseRental).toFixed(2)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Comprehensive Insurance</Text>
                <Text style={styles.breakdownValue}>
                  ${(statementData?.summary?.breakdown?.insurance ?? financial.insurance).toFixed(2)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Platform & Maintenance Fee</Text>
                <Text style={styles.breakdownValue}>
                  ${(statementData?.summary?.breakdown?.serviceFee ?? financial.serviceFee).toFixed(2)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdownTotalRow}>
                <Text style={styles.totalLabel}>Total Pending Balance</Text>
                <Text style={styles.totalAmount}>
                  ${pendingAmount.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* PENDING INVOICES LIST (IF ANY) */}
            {pendingInvoices.length > 0 && (
              <View style={[styles.pendingInvoicesCard, SHADOWS.subtle]}>
                <View style={styles.invoicesHeader}>
                  <Text style={styles.sectionTitle}>Pending Invoices</Text>
                  <View style={styles.invoiceCountChip}>
                    <Text style={styles.invoiceCountChipText}>
                      {pendingInvoices.length} {pendingInvoices.length === 1 ? 'Invoice' : 'Invoices'}
                    </Text>
                  </View>
                </View>

                {pendingInvoices.map((inv: PendingInvoice, idx: number) => (
                  <View
                    key={inv.id || idx}
                    style={[
                      styles.invoiceItemRow,
                      idx !== pendingInvoices.length - 1 && styles.borderBottom,
                    ]}
                  >
                    <View style={styles.invoiceIconBox}>
                      <FileText size={18} color="#D97706" />
                    </View>
                    <View style={styles.invoiceInfo}>
                      <Text style={styles.invoiceNumber}>{inv.invoiceNumber}</Text>
                      <Text style={styles.invoiceDesc} numberOfLines={1}>
                        {inv.description}
                      </Text>
                      <Text style={styles.invoiceDueDate}>
                        Due: {new Date(inv.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={styles.invoiceAmountCol}>
                      <Text style={styles.invoiceAmountText}>
                        ${inv.remaining.toFixed(2)}
                      </Text>
                      <View style={styles.pendingMiniBadge}>
                        <Text style={styles.pendingMiniBadgeText}>
                          {inv.status || 'PENDING'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* YAPPY INSTANT PAYMENT METHOD */}
            <View style={[styles.yappyCard, SHADOWS.subtle]}>
              <View style={styles.yappyHeaderRow}>
                <View style={styles.yappyTitleGroup}>
                  <View style={styles.yappyIconBox}>
                    <Text style={styles.yappyIconText}>Y</Text>
                  </View>
                  <View>
                    <Text style={styles.yappyTitle}>Yappy by Banco General</Text>
                    <Text style={styles.yappySubtitle}>Primary Mobile Payment</Text>
                  </View>
                </View>
                <View style={styles.yappyActiveBadge}>
                  <CheckCircle2 size={13} color="#059669" />
                  <Text style={styles.yappyActiveText}>Connected</Text>
                </View>
              </View>

              <View style={styles.yappyInfoBox}>
                <View style={styles.yappyInfoRow}>
                  <Text style={styles.yappyLabel}>Merchant Directory</Text>
                  <Text style={styles.yappyValueBold}>@OlaCarsPanama</Text>
                </View>
                <View style={styles.yappyInfoRow}>
                  <Text style={styles.yappyLabel}>Registered Phone</Text>
                  <Text style={styles.yappyValue}>
                    {activeProfile?.phone || '+507 6234-5678'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.yappyPayActionBtn}
                onPress={() => navigate('MakePayment')}
                activeOpacity={0.8}
              >
                <Text style={styles.yappyPayActionText}>
                  Pay with Yappy · ${pendingAmount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* STATEMENT SECTION (RENAMED FROM HISTORY) */
          <View style={styles.statementSection}>
            {/* STATEMENT SUMMARY METRICS */}
            <View style={[styles.statementMetricsCard, SHADOWS.subtle]}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Total Invoiced</Text>
                <Text style={styles.metricValue}>
                  ${(statementData?.summary?.totalInvoiced ?? 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Total Paid</Text>
                <Text style={[styles.metricValue, { color: '#059669' }]}>
                  ${(statementData?.summary?.totalPaid ?? 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Closing Balance</Text>
                <Text style={[styles.metricValue, { color: COLORS.text }]}>
                  ${(statementData?.summary?.closingBalance ?? pendingAmount).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* STATEMENT TRANSACTIONS HEADER */}
            <View style={styles.statementHeaderRow}>
              <Text style={styles.sectionTitle}>Customer Statement Registry</Text>
              <TouchableOpacity
                onPress={() => loadStatement(true)}
                style={styles.refreshBtn}
                activeOpacity={0.7}
              >
                <RefreshCw size={14} color={COLORS.primary} />
                <Text style={styles.refreshBtnText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* STATEMENT TRANSACTIONS LIST */}
            <View style={[styles.statementListCard, SHADOWS.subtle]}>
              {statementList.length > 0 ? (
                statementList.map((item: StatementTransaction, index: number) => {
                  const isInvoice = item.type?.toUpperCase() === 'INVOICE';
                  const isPayment = item.type?.toUpperCase() === 'PAYMENT';
                  const isCreditNote = item.type?.toUpperCase().includes('CREDIT');

                  return (
                    <View
                      key={item.id || index}
                      style={[
                        styles.statementItem,
                        index !== statementList.length - 1 && styles.borderBottom,
                      ]}
                    >
                      <View style={styles.itemTopRow}>
                        <View style={styles.itemTypeGroup}>
                          <View
                            style={[
                              styles.itemIconCircle,
                              isInvoice
                                ? styles.iconInvoice
                                : isPayment
                                ? styles.iconPayment
                                : styles.iconCredit,
                            ]}
                          >
                            {isInvoice ? (
                              <FileText size={15} color="#D97706" />
                            ) : isPayment ? (
                              <ArrowDownLeft size={15} color="#059669" />
                            ) : (
                              <RotateCcw size={15} color="#7C3AED" />
                            )}
                          </View>
                          <View>
                            <Text style={styles.itemRefNumber}>{item.refNumber}</Text>
                            <Text style={styles.itemDate}>
                              {new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.amountCol}>
                          {isInvoice && item.debit > 0 && (
                            <Text style={styles.debitAmount}>
                              +${item.debit.toFixed(2)}
                            </Text>
                          )}
                          {isPayment && item.credit > 0 && (
                            <Text style={styles.creditAmount}>
                              -${item.credit.toFixed(2)}
                            </Text>
                          )}
                          {isCreditNote && item.credit > 0 && (
                            <Text style={styles.creditNoteAmount}>
                              -${item.credit.toFixed(2)}
                            </Text>
                          )}
                          <View
                            style={[
                              styles.statusBadge,
                              item.status === 'PAID' || item.status === 'COMPLETED'
                                ? styles.badgePaid
                                : styles.badgePending,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                item.status === 'PAID' || item.status === 'COMPLETED'
                                  ? styles.textPaid
                                  : styles.textPending,
                              ]}
                            >
                              {item.status}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.itemBottomRow}>
                        <Text style={styles.itemDesc} numberOfLines={1}>
                          {item.description}
                        </Text>
                        <Text style={styles.runningBalanceText}>
                          Bal: ${item.runningBalance.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <AlertCircle size={32} color={COLORS.textSecondary} />
                  <Text style={styles.emptyTitle}>No Statement Records</Text>
                  <Text style={styles.emptyText}>
                    Financial statement records will appear here as rental invoices and payments are generated.
                  </Text>
                </View>
              )}
            </View>
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
  tabBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countBadge: {
    backgroundColor: 'rgba(0, 168, 107, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  pendingSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  pendingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  pendingLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pendingAmountLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  pendingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgePaid: {
    backgroundColor: '#D1FAE5',
  },
  textPending: {
    color: '#D97706',
    fontWeight: '700',
  },
  textPaid: {
    color: '#059669',
    fontWeight: '700',
  },
  pendingStatusText: {
    fontSize: 12,
  },
  pendingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pendingMetaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
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
  pendingInvoicesCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  invoicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  invoiceCountChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  invoiceCountChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  invoiceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  invoiceIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  invoiceDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  invoiceDueDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  invoiceAmountCol: {
    alignItems: 'flex-end',
  },
  invoiceAmountText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  pendingMiniBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: 3,
  },
  pendingMiniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  yappyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  yappyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  yappyTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yappyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yappyIconText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  yappyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  yappySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  yappyActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  yappyActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  yappyInfoBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  yappyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  yappyLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  yappyValueBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  yappyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  yappyPayActionBtn: {
    backgroundColor: '#0284C7',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yappyPayActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  statementSection: {
    marginBottom: 20,
  },
  statementMetricsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  statementHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statementListCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  statementItem: {
    paddingVertical: 14,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemTypeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInvoice: {
    backgroundColor: '#FEF3C7',
  },
  iconPayment: {
    backgroundColor: '#D1FAE5',
  },
  iconCredit: {
    backgroundColor: '#EDE9FE',
  },
  itemRefNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  debitAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B45309',
  },
  creditAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  creditNoteAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7C3AED',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingLeft: 44,
  },
  itemDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  runningBalanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
