import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { BottomNavigation } from '../components/BottomNavigation';
import { useApp } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCustomerStatement } from '../api/authService';
import { StatementTransaction, CustomerStatementData } from '../types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  FileText,
  CheckCircle2,
  ArrowDownLeft,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Search,
  X,
  FileDown,
  ArrowUpDown,
  Filter,
  Check,
  Calendar,
  ChevronRight,
  Printer,
  Car,
  Clock,
} from 'lucide-react-native';

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'ref_asc';
type TypeFilter = 'ALL' | 'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE';
type StatusFilter = 'ALL' | 'PAID' | 'PENDING';

const SORT_LABELS: Record<SortOption, string> = {
  date_desc: 'Newest First',
  date_asc: 'Oldest First',
  amount_desc: 'Amount: High to Low',
  amount_asc: 'Amount: Low to High',
  ref_asc: 'Reference: A to Z',
};

export const PaymentsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    financial,
    updateFinancial,
    showToast,
    activeProfile,
    driver,
    vehicle,
  } = useApp();

  const [statementData, setStatementData] = useState<CustomerStatementData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [showSortModal, setShowSortModal] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<StatementTransaction | null>(null);

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
          statement: res.statement || [],
        });

        // Keep financial data synchronized
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

  const rawStatementList = statementData?.statement || [];

  // Summary Metrics
  const totalInvoiced = statementData?.summary?.totalInvoiced ?? 
    rawStatementList.reduce((acc, item) => acc + (item.debit || 0), 0);
  const totalPaid = statementData?.summary?.totalPaid ?? 
    rawStatementList.reduce((acc, item) => acc + (item.credit || 0), 0);
  const closingBalance = statementData?.summary?.closingBalance ?? (totalInvoiced - totalPaid);

  // Filter & Sort Logic
  const filteredAndSortedList = useMemo(() => {
    let result = [...rawStatementList];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.refNumber?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.date?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      result = result.filter((item) => {
        const t = (item.type || '').toUpperCase();
        if (typeFilter === 'INVOICE') return t.includes('INVOICE');
        if (typeFilter === 'PAYMENT') return t.includes('PAYMENT');
        if (typeFilter === 'CREDIT_NOTE') return t.includes('CREDIT');
        return true;
      });
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((item) => {
        const s = (item.status || '').toUpperCase();
        if (statusFilter === 'PAID') return s === 'PAID' || s === 'COMPLETED';
        if (statusFilter === 'PENDING') return s === 'PENDING' || s === 'DUE' || s === 'OVERDUE';
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount_desc': {
          const valA = Math.max(a.debit || 0, a.credit || 0);
          const valB = Math.max(b.debit || 0, b.credit || 0);
          return valB - valA;
        }
        case 'amount_asc': {
          const valA = Math.max(a.debit || 0, a.credit || 0);
          const valB = Math.max(b.debit || 0, b.credit || 0);
          return valA - valB;
        }
        case 'ref_asc':
          return (a.refNumber || '').localeCompare(b.refNumber || '');
        default:
          return 0;
      }
    });

    return result;
  }, [rawStatementList, searchQuery, typeFilter, statusFilter, sortOption]);

  // Generate and Download PDF Statement
  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);

    try {
      const customerName = driver.name || activeProfile?.name || 'Customer';
      const customerId = activeProfile?.customerId || (activeProfile as any)?.customerNumber || driver.driverId || 'N/A';
      const phone = activeProfile?.phone || driver.phone || 'N/A';
      const email = activeProfile?.email || driver.email || 'N/A';
      const vehicleInfo = vehicle.plateNumber
        ? `${vehicle.year} ${vehicle.make} ${vehicle.model} · Plate: ${vehicle.plateNumber}`
        : 'Not Assigned';
      const statementDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const tableRowsHtml = filteredAndSortedList.map((item, index) => {
        const isInvoice = item.type?.toUpperCase().includes('INVOICE');
        const isPayment = item.type?.toUpperCase().includes('PAYMENT');
        const isPaid = item.status?.toUpperCase() === 'PAID' || item.status?.toUpperCase() === 'COMPLETED';

        return `
          <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
              ${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 11px; color: #0f172a;">
              ${item.refNumber || '-'}
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155;">
              ${item.description || '-'}
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
              ${item.type || 'Standard'}
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px; font-weight: 700; color: #b45309;">
              ${item.debit > 0 ? `$${item.debit.toFixed(2)}` : '-'}
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px; font-weight: 700; color: #059669;">
              ${item.credit > 0 ? `$${item.credit.toFixed(2)}` : '-'}
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px; font-weight: 800; color: #0f172a;">
              $${item.runningBalance.toFixed(2)}
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 10px;">
              <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-weight: 700; background-color: ${
                isPaid ? '#d1fae5' : '#fef3c7'
              }; color: ${isPaid ? '#065f46' : '#92400e'};">
                ${item.status || 'PENDING'}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>OLA CARS - Customer Statement</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 32px;
              font-size: 12px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #00A86B;
              padding-bottom: 18px;
              margin-bottom: 22px;
            }
            .brand-title {
              font-size: 24px;
              font-weight: 900;
              color: #00A86B;
              letter-spacing: -0.5px;
              margin: 0;
            }
            .brand-sub {
              font-size: 10px;
              color: #64748b;
              margin: 4px 0 0 0;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 700;
            }
            .statement-title {
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              text-align: right;
              margin: 0;
            }
            .statement-date {
              font-size: 11px;
              color: #64748b;
              text-align: right;
              margin-top: 4px;
            }
            .info-grid {
              display: flex;
              justify-content: space-between;
              margin-bottom: 22px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
            }
            .info-col {
              flex: 1;
            }
            .info-label {
              font-size: 9px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
              letter-spacing: 0.5px;
              margin-bottom: 3px;
            }
            .info-value {
              font-size: 12px;
              font-weight: 700;
              color: #0f172a;
            }
            .summary-cards {
              display: flex;
              gap: 12px;
              margin-bottom: 24px;
            }
            .card {
              flex: 1;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              background: #ffffff;
              text-align: center;
            }
            .card-label {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
            }
            .card-value {
              font-size: 18px;
              font-weight: 800;
              margin-top: 4px;
              color: #0f172a;
            }
            .card-paid .card-value {
              color: #059669;
            }
            .card-due .card-value {
              color: #b45309;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 28px;
            }
            th {
              background: #0f172a;
              color: #ffffff;
              text-align: left;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 10px 12px;
              font-weight: 700;
            }
            th.text-right {
              text-align: right;
            }
            th.text-center {
              text-align: center;
            }
            .footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              font-size: 10px;
              color: #94a3b8;
              text-align: center;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="brand-title">OLA CARS PANAMA</h1>
              <p class="brand-sub">Official Customer Statement & Ledger</p>
            </div>
            <div>
              <h2 class="statement-title">STATEMENT OF ACCOUNT</h2>
              <p class="statement-date">Generated: ${statementDate}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-col">
              <div class="info-label">Customer / Driver</div>
              <div class="info-value">${customerName}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">ID: ${customerId}</div>
            </div>
            <div class="info-col">
              <div class="info-label">Contact Details</div>
              <div class="info-value">${phone}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${email}</div>
            </div>
            <div class="info-col">
              <div class="info-label">Assigned Vehicle</div>
              <div class="info-value">${vehicleInfo}</div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label">Total Invoiced</div>
              <div class="card-value">$${totalInvoiced.toFixed(2)}</div>
            </div>
            <div class="card card-paid">
              <div class="card-label">Total Paid</div>
              <div class="card-value">$${totalPaid.toFixed(2)}</div>
            </div>
            <div class="card card-due">
              <div class="card-label">Closing Balance</div>
              <div class="card-value">$${closingBalance.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference #</th>
                <th>Description</th>
                <th>Type</th>
                <th class="text-right">Debit ($)</th>
                <th class="text-right">Credit ($)</th>
                <th class="text-right">Balance ($)</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredAndSortedList.length > 0
                  ? tableRowsHtml
                  : `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">No statement entries matching current filters.</td></tr>`
              }
            </tbody>
          </table>

          <div class="footer">
            <p><strong>OLA CARS PANAMA S.A.</strong> · Automated Fleet Accounting System</p>
            <p>This is an official computer-generated statement. For disputes or queries, contact fleet finance at support@olacars.com</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Statement PDF',
          UTI: '.pdf',
        });
        showToast('Statement PDF generated and ready to download');
      } else {
        await Print.printAsync({ uri });
        showToast('Statement sent to printer/viewer');
      }
    } catch (err: any) {
      console.warn('[PaymentsScreen] PDF generation error:', err.message);
      showToast('Could not generate PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Statements" showBack />

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
        {/* EXECUTIVE STATEMENT SUMMARY & ACTION HEADER */}
        <View style={[styles.summaryCard, SHADOWS.subtle]}>
          <View style={styles.summaryTopRow}>
            <View style={styles.customerMetaCol}>
              <Text style={styles.customerName} numberOfLines={1}>
                {driver.name || activeProfile?.name || 'Customer Account'}
              </Text>
              <View style={styles.idBadgeRow}>
                <View style={styles.idChip}>
                  <Text style={styles.idChipText}>
                    {activeProfile?.customerId || (activeProfile as any)?.customerNumber || driver.driverId || 'CUST-ACCOUNT'}
                  </Text>
                </View>
                {vehicle.plateNumber ? (
                  <View style={styles.vehicleChip}>
                    <Car size={11} color="#475569" />
                    <Text style={styles.vehicleChipText}>{vehicle.plateNumber}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              style={styles.refreshIconBtn}
              onPress={() => loadStatement(true)}
              activeOpacity={0.7}
            >
              <RefreshCw size={15} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* FINANCIAL STATS CHIPS (3-COLUMN ROW) */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Invoiced</Text>
              <Text style={styles.metricVal}>${totalInvoiced.toFixed(2)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Paid</Text>
              <Text style={[styles.metricVal, { color: '#059669' }]}>${totalPaid.toFixed(2)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Closing Balance</Text>
              <Text
                style={[
                  styles.metricVal,
                  { color: closingBalance > 0 ? '#B45309' : COLORS.text },
                ]}
              >
                ${closingBalance.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* DOWNLOAD PDF ACTION BUTTON */}
          <TouchableOpacity
            style={[styles.downloadPdfButton, downloadingPdf && styles.btnDisabled]}
            onPress={handleDownloadPdf}
            disabled={downloadingPdf}
            activeOpacity={0.8}
          >
            {downloadingPdf ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <FileDown size={17} color={COLORS.white} strokeWidth={2.4} />
            )}
            <Text style={styles.downloadPdfButtonText}>
              {downloadingPdf ? 'Generating PDF Statement...' : 'Download Statement PDF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH & CONTROLS TOOLBAR */}
        <View style={styles.controlsSection}>
          {/* SEARCH BAR */}
          <View style={styles.searchBar}>
            <Search size={16} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ref #, description, date..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* FILTER & SORT ROW */}
          <View style={styles.filterSortRow}>
            {/* TYPE FILTER PILLS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsScroll}
            >
              <TouchableOpacity
                style={[styles.filterPill, typeFilter === 'ALL' && styles.filterPillActive]}
                onPress={() => setTypeFilter('ALL')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, typeFilter === 'ALL' && styles.filterPillTextActive]}>
                  All Types
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, typeFilter === 'INVOICE' && styles.filterPillActive]}
                onPress={() => setTypeFilter('INVOICE')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, typeFilter === 'INVOICE' && styles.filterPillTextActive]}>
                  Invoices
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, typeFilter === 'PAYMENT' && styles.filterPillActive]}
                onPress={() => setTypeFilter('PAYMENT')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, typeFilter === 'PAYMENT' && styles.filterPillTextActive]}>
                  Payments
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, typeFilter === 'CREDIT_NOTE' && styles.filterPillActive]}
                onPress={() => setTypeFilter('CREDIT_NOTE')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, typeFilter === 'CREDIT_NOTE' && styles.filterPillTextActive]}>
                  Credit Notes
                </Text>
              </TouchableOpacity>

              {/* STATUS FILTER PILLS */}
              <View style={styles.pillSeparator} />

              <TouchableOpacity
                style={[styles.filterPill, statusFilter === 'PAID' && styles.filterPillActiveEmerald]}
                onPress={() => setStatusFilter(statusFilter === 'PAID' ? 'ALL' : 'PAID')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    statusFilter === 'PAID' && styles.filterPillTextActiveEmerald,
                  ]}
                >
                  Paid Only
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, statusFilter === 'PENDING' && styles.filterPillActiveAmber]}
                onPress={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    statusFilter === 'PENDING' && styles.filterPillTextActiveAmber,
                  ]}
                >
                  Pending Only
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* SORT BUTTON */}
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
              activeOpacity={0.7}
            >
              <ArrowUpDown size={14} color={COLORS.primary} />
              <Text style={styles.sortButtonText}>{SORT_LABELS[sortOption]}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RESULTS HEADER */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>Statement Ledger</Text>
          <Text style={styles.listHeaderCount}>
            {filteredAndSortedList.length} {filteredAndSortedList.length === 1 ? 'Record' : 'Records'}
          </Text>
        </View>

        {/* STATEMENT TRANSACTIONS LIST */}
        {loading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching statement ledger...</Text>
          </View>
        ) : filteredAndSortedList.length > 0 ? (
          <View style={[styles.statementCard, SHADOWS.subtle]}>
            {filteredAndSortedList.map((item, index) => {
              const isInvoice = item.type?.toUpperCase().includes('INVOICE');
              const isPayment = item.type?.toUpperCase().includes('PAYMENT');
              const isPaid = item.status?.toUpperCase() === 'PAID' || item.status?.toUpperCase() === 'COMPLETED';

              return (
                <TouchableOpacity
                  key={item.id || item.refNumber || index}
                  style={[
                    styles.statementRow,
                    index !== filteredAndSortedList.length - 1 && styles.rowDivider,
                  ]}
                  onPress={() => setSelectedTransaction(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowMain}>
                    {/* ICON */}
                    <View
                      style={[
                        styles.typeIconBox,
                        isInvoice
                          ? styles.iconBoxInvoice
                          : isPayment
                          ? styles.iconBoxPayment
                          : styles.iconBoxCredit,
                      ]}
                    >
                      {isInvoice ? (
                        <FileText size={16} color="#D97706" />
                      ) : isPayment ? (
                        <ArrowDownLeft size={16} color="#059669" />
                      ) : (
                        <RotateCcw size={16} color="#7C3AED" />
                      )}
                    </View>

                    {/* DETAILS */}
                    <View style={styles.rowTextCol}>
                      <View style={styles.refRow}>
                        <Text style={styles.refNumber}>{item.refNumber}</Text>
                        <View
                          style={[
                            styles.statusTag,
                            isPaid ? styles.statusTagPaid : styles.statusTagPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusTagText,
                              isPaid ? styles.statusTextPaid : styles.statusTextPending,
                            ]}
                          >
                            {item.status || 'PENDING'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.itemDescription} numberOfLines={1}>
                        {item.description}
                      </Text>

                      <Text style={styles.itemDate}>
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    {/* AMOUNTS */}
                    <View style={styles.rowAmountCol}>
                      {isInvoice && item.debit > 0 && (
                        <Text style={styles.debitText}>+${item.debit.toFixed(2)}</Text>
                      )}
                      {isPayment && item.credit > 0 && (
                        <Text style={styles.creditText}>-${item.credit.toFixed(2)}</Text>
                      )}
                      {!isInvoice && !isPayment && item.credit > 0 && (
                        <Text style={styles.creditNoteText}>-${item.credit.toFixed(2)}</Text>
                      )}

                      <View style={styles.balancePill}>
                        <Text style={styles.balancePillText}>
                          Bal: ${item.runningBalance.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyCard, SHADOWS.subtle]}>
            <AlertCircle size={36} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Statement Records Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try clearing your filters or search terms to see all transactions.'
                : 'Statement records will appear here as rental invoices and payments are generated.'}
            </Text>
            {(searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                  setStatusFilter('ALL');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearFilterButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* SORTING MODAL */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Statements</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOptionRow,
                  sortOption === option && styles.sortOptionRowActive,
                ]}
                onPress={() => {
                  setSortOption(option);
                  setShowSortModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortOption === option && styles.sortOptionTextActive,
                  ]}
                >
                  {SORT_LABELS[option]}
                </Text>
                {sortOption === option && <Check size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* TRANSACTION DETAIL MODAL */}
      <Modal
        visible={!!selectedTransaction}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedTransaction(null)}
        >
          <View style={styles.detailSheet} onStartShouldSetResponder={() => true}>
            {selectedTransaction && (
              <>
                <View style={styles.detailHeader}>
                  <View>
                    <Text style={styles.detailTitle}>{selectedTransaction.refNumber}</Text>
                    <Text style={styles.detailSub}>
                      {selectedTransaction.type || 'Statement Entry'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedTransaction(null)}>
                    <X size={22} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailAmountBox}>
                  <Text style={styles.detailAmountLabel}>Transaction Amount</Text>
                  <Text
                    style={[
                      styles.detailAmountVal,
                      selectedTransaction.debit > 0
                        ? { color: '#B45309' }
                        : { color: '#059669' },
                    ]}
                  >
                    {selectedTransaction.debit > 0
                      ? `+$${selectedTransaction.debit.toFixed(2)}`
                      : `-$${selectedTransaction.credit.toFixed(2)}`}
                  </Text>
                  <View
                    style={[
                      styles.detailStatusBadge,
                      selectedTransaction.status === 'PAID' || selectedTransaction.status === 'COMPLETED'
                        ? styles.statusTagPaid
                        : styles.statusTagPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagText,
                        selectedTransaction.status === 'PAID' || selectedTransaction.status === 'COMPLETED'
                          ? styles.statusTextPaid
                          : styles.statusTextPending,
                      ]}
                    >
                      Status: {selectedTransaction.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailInfoList}>
                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailInfoLabel}>Description</Text>
                    <Text style={styles.detailInfoValue}>{selectedTransaction.description}</Text>
                  </View>

                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailInfoLabel}>Date</Text>
                    <Text style={styles.detailInfoValue}>
                      {new Date(selectedTransaction.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>

                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailInfoLabel}>Account Balance After</Text>
                    <Text style={[styles.detailInfoValue, { fontWeight: '800' }]}>
                      ${selectedTransaction.runningBalance.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.detailCloseBtn}
                  onPress={() => setSelectedTransaction(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.detailCloseBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerMetaCol: {
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  idBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  idChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  idChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  vehicleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  refreshIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: '75%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 3,
    textAlign: 'center',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  downloadPdfButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: RADIUS.lg,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  downloadPdfButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  controlsSection: {
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    padding: 0,
  },
  filterSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterPillsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  filterPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillActiveEmerald: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  filterPillActiveAmber: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  filterPillTextActiveEmerald: {
    color: '#065F46',
    fontWeight: '700',
  },
  filterPillTextActiveAmber: {
    color: '#92400E',
    fontWeight: '700',
  },
  pillSeparator: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 2,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  listHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statementCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
  },
  statementRow: {
    paddingVertical: 13,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  iconBoxInvoice: {
    backgroundColor: '#FEF3C7',
  },
  iconBoxPayment: {
    backgroundColor: '#D1FAE5',
  },
  iconBoxCredit: {
    backgroundColor: '#EDE9FE',
  },
  rowTextCol: {
    flex: 1,
    marginRight: 8,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  refNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusTagPaid: {
    backgroundColor: '#D1FAE5',
  },
  statusTagPending: {
    backgroundColor: '#FEF3C7',
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextPaid: {
    color: '#065F46',
  },
  statusTextPending: {
    color: '#92400E',
  },
  itemDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  rowAmountCol: {
    alignItems: 'flex-end',
  },
  debitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  creditText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  creditNoteText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7C3AED',
  },
  balancePill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: 4,
  },
  balancePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearFilterButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  clearFilterButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sortOptionRowActive: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  detailSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  detailSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailAmountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginBottom: 16,
  },
  detailAmountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  detailAmountVal: {
    fontSize: 26,
    fontWeight: '900',
    marginVertical: 4,
  },
  detailStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 2,
  },
  detailInfoList: {
    marginBottom: 20,
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailInfoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailInfoValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  detailCloseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  detailCloseBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
