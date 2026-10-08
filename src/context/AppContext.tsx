import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Driver,
  CustomerProfile,
  Vehicle,
  FinancialData,
  PaymentMethod,
  Activity,
  AppNotification,
  RootScreen,
  BottomTabKey,
} from '../types';
import {
  INITIAL_DRIVER,
  INITIAL_VEHICLE,
  INITIAL_FINANCIAL,
  INITIAL_PAYMENT_METHODS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
} from '../mock/data';

interface AppContextType {
  currentScreen: RootScreen;
  navigate: (screen: RootScreen) => void;
  goBack: () => void;
  canGoBack: boolean;
  driver: Driver;
  updateDriver: (updates: Partial<Driver>) => void;
  vehicle: Vehicle;
  updateVehicle: (updates: Partial<Vehicle>) => void;
  financial: FinancialData;
  updateFinancial: (updates: Partial<FinancialData>) => void;
  paymentMethods: PaymentMethod[];
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  unreadNotificationsCount: number;
  isAuthenticated: boolean;
  profiles: CustomerProfile[];
  activeProfile: CustomerProfile | null;
  switchProfile: (profileId: string) => void;
  login: (email: string, driverData?: any, availableProfiles?: CustomerProfile[]) => void;
  logout: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  activeBottomTab: BottomTabKey;
  setActiveBottomTab: (tab: BottomTabKey) => void;
  processPayment: (amount: number) => Promise<boolean>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  pendingEmail: string;
  setPendingEmail: (email: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [screenStack, setScreenStack] = useState<RootScreen[]>(['Splash']);
  const [driver, setDriver] = useState<Driver>(INITIAL_DRIVER);
  const [vehicle, setVehicle] = useState<Vehicle>(INITIAL_VEHICLE);
  const [financial, setFinancial] = useState<FinancialData>(INITIAL_FINANCIAL);
  const [paymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTabKey>('Home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string>('carlos@example.com');
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<CustomerProfile | null>(null);

  const applyProfile = (prof: CustomerProfile) => {
    setActiveProfile(prof);
    // Update Driver state
    const parts = (prof.name || 'Driver').split(' ');
    setDriver((prev) => ({
      ...prev,
      name: prof.name || prev.name,
      firstName: parts[0] || prev.firstName,
      lastName: parts.slice(1).join(' ') || prev.lastName,
      email: prof.email || prev.email,
      phone: prof.phone || prev.phone,
      driverId: prof.customerId || prev.driverId,
    }));
    // Update Vehicle state
    if (prof.vehicle) {
      setVehicle((prev) => ({
        ...prev,
        ...prof.vehicle,
      }));
    }
    // Update Financial state
    if (prof.financial) {
      setFinancial((prev) => ({
        ...prev,
        ...prof.financial,
      }));
    }
  };

  const switchProfile = (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;
    applyProfile(target);
    showToast(`Switched to ${target.vehicle?.plateNumber || target.name}`);
  };

  const currentScreen = screenStack[screenStack.length - 1];
  const canGoBack = screenStack.length > 1;

  const navigate = (screen: RootScreen) => {
    // Sync bottom tab when navigating to key tab screens
    if (screen === 'Dashboard') setActiveBottomTab('Home');
    else if (screen === 'Payments') setActiveBottomTab('Payments');
    else if (screen === 'VehicleStatus') setActiveBottomTab('Vehicle');
    else if (screen === 'Profile') setActiveBottomTab('Settings');

    // Prevent duplicate top in stack
    setScreenStack((prev) => {
      if (prev[prev.length - 1] === screen) return prev;
      return [...prev, screen];
    });
  };

  const goBack = () => {
    setScreenStack((prev) => {
      if (prev.length <= 1) return prev;
      const nextStack = prev.slice(0, prev.length - 1);
      const targetScreen = nextStack[nextStack.length - 1];
      if (targetScreen === 'Dashboard') setActiveBottomTab('Home');
      else if (targetScreen === 'Payments') setActiveBottomTab('Payments');
      else if (targetScreen === 'VehicleStatus') setActiveBottomTab('Vehicle');
      else if (targetScreen === 'Profile') setActiveBottomTab('Settings');
      return nextStack;
    });
  };

  const updateDriver = (updates: Partial<Driver>) => {
    setDriver((prev) => ({ ...prev, ...updates }));
  };

  const updateVehicle = (updates: Partial<Vehicle>) => {
    setVehicle((prev) => ({ ...prev, ...updates }));
  };

  const updateFinancial = (updates: Partial<FinancialData>) => {
    setFinancial((prev) => {
      const next = { ...prev, ...updates };
      if (activeProfile) {
        activeProfile.financial = next;
      }
      return next;
    });
  };

  const addActivity = (newAct: Omit<Activity, 'id'>) => {
    const act: Activity = {
      ...newAct,
      id: `act_${Date.now()}`,
    };
    setActivities((prev) => [act, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  const login = (email: string, driverData?: any, availableProfiles?: CustomerProfile[]) => {
    setIsAuthenticated(true);
    if (availableProfiles && availableProfiles.length > 0) {
      setProfiles(availableProfiles);
      const primary = driverData?.id 
        ? (availableProfiles.find((p) => p.id === driverData.id) || availableProfiles[0])
        : availableProfiles[0];
      applyProfile(primary);
    } else if (driverData) {
      setDriver((prev) => {
        const fullName = driverData.name || driverData.personalInfo?.fullName || prev.name;
        const parts = fullName.split(' ');
        const firstName = parts[0] || prev.firstName;
        const lastName = parts.slice(1).join(' ') || prev.lastName;
        return {
          ...prev,
          email: driverData.email || driverData.personalInfo?.email || email,
          name: fullName,
          firstName,
          lastName,
          phone: driverData.phone || driverData.personalInfo?.phone || prev.phone,
          driverId: driverData.customerId || driverData.driverCode || String(driverData._id || prev.driverId),
        };
      });
      if (driverData.vehicle) {
        setVehicle((prev) => ({ ...prev, ...driverData.vehicle }));
      }
      if (driverData.financial) {
        setFinancial((prev) => ({ ...prev, ...driverData.financial }));
      }
    } else if (email) {
      setDriver((prev) => ({ ...prev, email }));
    }
    // Navigate straight to dashboard and reset stack
    setScreenStack(['Dashboard']);
    setActiveBottomTab('Home');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsDrawerOpen(false);
    setScreenStack(['Splash']);
    showToast('Logged out successfully');
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const processPayment = async (amount: number): Promise<boolean> => {
    // Simulate real network request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update financial balance
    setFinancial((prev) => ({
      ...prev,
      currentDue: Math.max(0, prev.currentDue - amount),
      totalEarnings: prev.totalEarnings,
    }));

    // Add activity record
    const now = new Date();
    const formattedDate = `Today · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    addActivity({
      title: 'Payment Successful',
      description: 'Vehicle balance payment via Stripe',
      amount: `$${amount.toFixed(2)}`,
      timestamp: formattedDate,
      category: 'Payments',
      iconName: 'check-circle',
      colorType: 'green',
    });

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: 'Payment Successful',
        message: `Your payment of $${amount.toFixed(2)} was completed successfully.`,
        time: 'Just now',
        unread: true,
        type: 'payment',
      },
      ...prev,
    ]);

    return true;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigate,
        goBack,
        canGoBack,
        driver,
        updateDriver,
        vehicle,
        updateVehicle,
        financial,
        updateFinancial,
        paymentMethods,
        activities,
        addActivity,
        notifications,
        markNotificationAsRead,
        unreadNotificationsCount,
        isAuthenticated,
        profiles,
        activeProfile,
        switchProfile,
        login,
        logout,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        activeBottomTab,
        setActiveBottomTab,
        processPayment,
        toastMessage,
        showToast,
        pendingEmail,
        setPendingEmail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
