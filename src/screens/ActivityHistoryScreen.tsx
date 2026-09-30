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
import { ActivityItem } from '../components/ActivityItem';
import { BottomNavigation } from '../components/BottomNavigation';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ActivityHistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { activities } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'All' | ActivityCategory>('All');

  const filters: ('All' | ActivityCategory)[] = ['All', 'Payments', 'Vehicle', 'Account'];

  const filteredActivities = activities.filter((act) => {
    if (selectedFilter === 'All') return true;
    return act.category === selectedFilter;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Activity History" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HORIZONTAL FILTER PILLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillSelected,
                ]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ACTIVITY LIST CONTAINER */}
        <View style={[styles.listCard, SHADOWS.subtle]}>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act, index) => (
              <ActivityItem
                key={act.id}
                activity={act}
                isLast={index === filteredActivities.length - 1}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No activity found</Text>
              <Text style={styles.emptyDesc}>
                There are no activities recorded under "{selectedFilter}".
              </Text>
            </View>
          )}
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
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
