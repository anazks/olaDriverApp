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
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<CustomerProfile | null>(null);

  const applyProfile = (prof: any) => {
    setActiveProfile(prof);
    // Update Driver state
    const fullName = prof.name || prof.fullName || '';
    const parts = fullName.split(' ');
    setDriver((prev) => ({
      ...prev,
      name: fullName || prev.name,
      firstName: prof.firstName || parts[0] || prev.firstName,
      lastName: prof.lastName || parts.slice(1).join(' ') || prev.lastName,
      email: prof.email || prev.email,
      phone: prof.phone || prev.phone,
      driverId: prof.customerId || prof.driverCode || prof.id || prev.driverId,
    }));
    // Update Vehicle state from API
    const vehicleObj =
      prof.vehicle ||
      prof.assignedVehicle ||
      prof.vehicleDetails ||
      prof.assigned_vehicle;

    if (vehicleObj && typeof vehicleObj === 'object') {
      setVehicle((prev) => ({
        ...prev,
        ...vehicleObj,
        make: vehicleObj.make || vehicleObj.brand || prev.make || '',
        model: vehicleObj.model || prev.model || '',
        variant: vehicleObj.variant || prev.variant || '',
        year: vehicleObj.year || prev.year || new Date().getFullYear(),
        plateNumber: vehicleObj.plateNumber || vehicleObj.plate_number || vehicleObj.licensePlate || prev.plateNumber || '',
        fleetNumber: vehicleObj.fleetNumber || vehicleObj.fleet_number || prev.fleetNumber || '',
        vin: vehicleObj.vin || vehicleObj.chassisNumber || prev.vin || '',
        engineNumber: vehicleObj.engineNumber || vehicleObj.engine_number || prev.engineNumber || '',
        fuelType: vehicleObj.fuelType || vehicleObj.fuel_type || prev.fuelType || '',
        transmission: vehicleObj.transmission || prev.transmission || '',
        colour: vehicleObj.colour || vehicleObj.color || prev.colour || '',
        seats: vehicleObj.seats ?? prev.seats ?? 0,
        category: vehicleObj.category || prev.category || '',
        currentMileage: vehicleObj.currentMileage || vehicleObj.current_mileage || prev.currentMileage || 0,
        nextService: vehicleObj.nextService || vehicleObj.next_service || prev.nextService || 0,
        status: vehicleObj.status || prev.status || 'Active',
        branch: vehicleObj.branch || prof.branch || prev.branch || '',
        documents: vehicleObj.documents || prev.documents || [],
      }));
    }
    // Update Financial state from API
    if (prof.financial || prof.statementSummary || prof.billing) {
      const fin = prof.financial || prof.statementSummary || prof.billing;
      setFinancial((prev) => ({
        ...prev,
        ...fin,
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
      const fullName = driverData.name || driverData.personalInfo?.fullName || '';
      const parts = fullName.split(' ');
      const firstName = driverData.firstName || parts[0] || '';
      const lastName = driverData.lastName || parts.slice(1).join(' ') || '';

      setDriver((prev) => ({
        ...prev,
        email: driverData.email || driverData.personalInfo?.email || email,
        name: fullName,
        firstName,
        lastName,
        phone: driverData.phone || driverData.personalInfo?.phone || '',
        driverId: driverData.customerId || driverData.driverCode || String(driverData._id || ''),
        verified: Boolean(driverData.verified ?? true),
        address: driverData.address || driverData.personalInfo?.address || '',
        emergencyContact: driverData.emergencyContact || driverData.personalInfo?.emergencyContact || '',
        avatarUrl: driverData.avatarUrl || driverData.avatar || '',
      }));

      // Map assigned vehicle from API response
      const vehicleObj =
        driverData.vehicle ||
        driverData.assignedVehicle ||
        driverData.vehicleDetails ||
        driverData.assigned_vehicle;

      if (vehicleObj && typeof vehicleObj === 'object') {
        setVehicle((prev) => ({
          ...prev,
          ...vehicleObj,
          make: vehicleObj.make || vehicleObj.brand || prev.make || '',
          model: vehicleObj.model || prev.model || '',
          variant: vehicleObj.variant || prev.variant || '',
          year: vehicleObj.year || prev.year || new Date().getFullYear(),
          plateNumber: vehicleObj.plateNumber || vehicleObj.plate_number || vehicleObj.licensePlate || prev.plateNumber || '',
          fleetNumber: vehicleObj.fleetNumber || vehicleObj.fleet_number || prev.fleetNumber || '',
          vin: vehicleObj.vin || vehicleObj.chassisNumber || prev.vin || '',
          engineNumber: vehicleObj.engineNumber || vehicleObj.engine_number || prev.engineNumber || '',
          fuelType: vehicleObj.fuelType || vehicleObj.fuel_type || prev.fuelType || '',
          transmission: vehicleObj.transmission || prev.transmission || '',
          colour: vehicleObj.colour || vehicleObj.color || prev.colour || '',
          seats: vehicleObj.seats ?? prev.seats ?? 0,
          category: vehicleObj.category || prev.category || '',
          currentMileage: vehicleObj.currentMileage || vehicleObj.current_mileage || prev.currentMileage || 0,
          nextService: vehicleObj.nextService || vehicleObj.next_service || prev.nextService || 0,
          status: vehicleObj.status || prev.status || 'Active',
          branch: vehicleObj.branch || prev.branch || '',
          documents: vehicleObj.documents || prev.documents || [],
        }));
      }

      if (driverData.financial || driverData.statementSummary || driverData.billing) {
        const fin = driverData.financial || driverData.statementSummary || driverData.billing;
        setFinancial((prev) => ({ ...prev, ...fin }));
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
    setDriver(INITIAL_DRIVER);
    setVehicle(INITIAL_VEHICLE);
    setFinancial(INITIAL_FINANCIAL);
    setActivities(INITIAL_ACTIVITIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setProfiles([]);
    setActiveProfile(null);
    setScreenStack(['Login']);
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
