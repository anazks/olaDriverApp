import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../context/AppContext';
import { Bell, CreditCard, Wrench, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const NotificationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationAsRead, navigate } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard size={18} color={COLORS.primary} />;
      case 'service':
        return <Wrench size={18} color={COLORS.warning} />;
      default:
        return <CheckCircle2 size={18} color={COLORS.info} />;
    }
  };

  const handleNotificationPress = (notif: any) => {
    markNotificationAsRead(notif.id);
    if (notif.type === 'payment') navigate('Payments');
    else if (notif.type === 'service') navigate('VehicleStatus');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Notifications" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.length > 0 ? (
          <View style={[styles.card, SHADOWS.subtle]}>
            {notifications.map((item, index) => {
              const isLast = index === notifications.length - 1;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notificationItem,
                    !isLast && styles.withBorder,
                    item.unread && styles.itemUnread,
                  ]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    {getIcon(item.type)}
                  </View>

                  <View style={styles.content}>
                    <View style={styles.headerRow}>
                      <Text style={styles.title}>{item.title}</Text>
                      {item.unread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Bell size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        )}
      </ScrollView>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    gap: 12,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemUnread: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
