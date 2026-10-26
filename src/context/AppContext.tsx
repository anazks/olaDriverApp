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
import { fetchCurrentDriver } from '../api/authService';

export const isAccountActive = (status?: string, isActive?: boolean): boolean => {
  if (isActive === false) return false;
  if (status) {
    const s = status.toUpperCase().trim();
    if (s === 'INACTIVE' || s === 'SUSPENDED' || s === 'REJECTED') {
      return false;
    }
    if (s === 'ACTIVE' || s === 'APPROVED' || s === 'VERIFIED') {
      return true;
    }
  }
  return true;
};

export const normalizeVehicleData = (raw: any): Vehicle => {
  if (!raw || typeof raw !== 'object' || (!raw._id && !raw.id && !raw.basicDetails && !raw.make && !raw.model)) {
    return INITIAL_VEHICLE;
  }
  const basic = raw.basicDetails || {};
  const legal = raw.legalDocs || {};

  const make = basic.make || raw.make || raw.brand || '';
  const model = basic.model || raw.model || '';
  const variant = raw.variant || '';
  const year = Number(basic.year || raw.year || new Date().getFullYear());
  const plateNumber =
    legal.registrationNumber ||
    raw.plateNumber ||
    raw.plate_number ||
    raw.licensePlate ||
    raw.registrationNumber ||
    '';
  const fleetNumber = basic.fleetNumber || raw.fleetNumber || raw.fleet_number || '';
  const vin = basic.vin || raw.vin || raw.chassisNumber || '';
  const engineNumber = basic.engineNumber || raw.engineNumber || '';
  const fuelType = basic.fuelType || raw.fuelType || raw.fuel_type || '';
  const transmission = basic.transmission || raw.transmission || '';
  const colour = basic.colour || raw.colour || raw.color || '';
  const seats = basic.seats ?? raw.seats ?? 0;
  const category = basic.category || raw.category || '';
  const currentMileage = Number(basic.odometer || raw.currentMileage || raw.current_mileage || 0);
  const nextService = Number(raw.nextService || raw.next_service || (currentMileage > 0 ? currentMileage + 5000 : 0));
  const weeklyRent = Number(basic.weeklyRent || raw.weeklyRent || 0);
  const status = raw.status || 'Active';
  const id = String(raw._id || raw.id || raw.vehicleId || '');

  return {
    ...INITIAL_VEHICLE,
    id,
    _id: id,
    vehicleId: raw.vehicleId || id,
    make,
    model,
    variant,
    year,
    plateNumber,
    fleetNumber,
    vin,
    engineNumber,
    fuelType,
    transmission,
    colour,
    seats,
    category,
    currentMileage,
    nextService,
    lastServiceMileage: 0,
    status,
    weeklyRent,
    imageUrl: raw.imageUrl || '',
    branch: (typeof raw.branch === 'object' ? raw.branch?.name : raw.branch) || '',
    documents: raw.documents || [],
    basicDetails: basic,
    legalDocs: legal,
    raw,
  };
};

export const normalizeDriverData = (raw: any, emailFallback: string = '', prevDriver?: Driver): Driver => {
  if (!raw || typeof raw !== 'object') {
    return prevDriver || INITIAL_DRIVER;
  }
  const personal = raw.personalInfo || {};
  const fullName = personal.fullName || raw.name || raw.fullName || raw.customerName || prevDriver?.name || '';
  const parts = fullName.trim().split(' ');
  const firstName = personal.firstName || raw.firstName || parts[0] || prevDriver?.firstName || '';
  const lastName = personal.lastName || raw.lastName || parts.slice(1).join(' ') || prevDriver?.lastName || '';
  const email = personal.email || raw.email || emailFallback || prevDriver?.email || '';
  const phone = personal.phone || raw.phone || raw.mobilePhone || raw.whatsappNumber || prevDriver?.phone || '';

  const driverId =
    raw.driverId ||
    raw.customerId ||
    raw.customerNumber ||
    (raw._id ? String(raw._id) : '') ||
    (raw.id ? String(raw.id) : '') ||
    prevDriver?.driverId ||
    '';

  const rawStatus =
    raw.status ||
    raw.driver?.status ||
    raw.customer?.status ||
    raw.user?.status ||
    raw.data?.status ||
    (raw.isActive === true ? 'ACTIVE' : raw.isActive === false ? 'INACTIVE' : undefined) ||
    (raw.active === true ? 'ACTIVE' : raw.active === false ? 'INACTIVE' : undefined);

  const status = rawStatus
    ? String(rawStatus).toUpperCase().trim()
    : (prevDriver?.status || 'ACTIVE');

  const isActive = isAccountActive(status, raw.isActive ?? raw.active ?? prevDriver?.isActive);
  const verified = isActive || Boolean(raw.verified ?? true);

  const branchName = typeof raw.branch === 'object' ? (raw.branch?.name || '') : (raw.branch || '');
  const branchLocation = typeof raw.branch === 'object' ? (raw.branch?.location || raw.branch?.city || '') : '';

  return {
    ...(prevDriver || INITIAL_DRIVER),
    name: fullName,
    firstName,
    lastName,
    email,
    phone,
    driverId,
    verified,
    status,
    isActive,
    branch: branchName || prevDriver?.branch || '',
    branchLocation: branchLocation || prevDriver?.branchLocation || '',
    address: personal.address || raw.address || prevDriver?.address || '',
    emergencyContact: personal.emergencyContact || raw.emergencyContact || prevDriver?.emergencyContact || '',
    avatarUrl: raw.avatarUrl || raw.avatar || prevDriver?.avatarUrl || '',
    currentVehicle: raw.currentVehicle || raw.assignedVehicle || prevDriver?.currentVehicle,
    assignedVehicle: raw.currentVehicle || raw.assignedVehicle || prevDriver?.assignedVehicle,
    raw,
  };
};

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
  refreshProfile: () => Promise<{ driver: Driver; vehicle: Vehicle } | null>;
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
    const updatedDriver = normalizeDriverData(prof, driver.email, driver);
    setDriver(updatedDriver);

    const userIsActive = isAccountActive(updatedDriver.status, updatedDriver.isActive);

    // Update Vehicle state from API (only if active and vehicle is valid)
    const vehicleObj =
      prof.vehicle ||
      prof.assignedVehicle ||
      prof.currentVehicle ||
      prof.vehicleDetails ||
      prof.assigned_vehicle;

    if (
      userIsActive &&
      vehicleObj &&
      typeof vehicleObj === 'object' &&
      (vehicleObj._id || vehicleObj.basicDetails || vehicleObj.make || vehicleObj.model)
    ) {
      setVehicle(normalizeVehicleData(vehicleObj));
    } else {
      setVehicle(INITIAL_VEHICLE);
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
    else if (screen === 'Payments' || screen === 'Statements') setActiveBottomTab('Statements');
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
      else if (targetScreen === 'Payments' || targetScreen === 'Statements') setActiveBottomTab('Statements');
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

  const refreshProfile = async (): Promise<{ driver: Driver; vehicle: Vehicle } | null> => {
    try {
      const res = await fetchCurrentDriver();
      const rawData = res.data || res.driver;
      if (rawData) {
        const updatedDriver = normalizeDriverData(rawData, driver.email, driver);
        setDriver(updatedDriver);

        const userIsActive = isAccountActive(updatedDriver.status, updatedDriver.isActive);

        const assignedVehRaw = rawData.currentVehicle || rawData.vehicle || rawData.assignedVehicle;
        if (
          userIsActive &&
          assignedVehRaw &&
          typeof assignedVehRaw === 'object' &&
          (assignedVehRaw._id || assignedVehRaw.basicDetails || assignedVehRaw.make || assignedVehRaw.model)
        ) {
          const updatedVehicle = normalizeVehicleData(assignedVehRaw);
          setVehicle(updatedVehicle);
          return { driver: updatedDriver, vehicle: updatedVehicle };
        } else {
          setVehicle(INITIAL_VEHICLE);
          return { driver: updatedDriver, vehicle: INITIAL_VEHICLE };
        }
      }
    } catch (err: any) {
      console.warn('[AppContext.refreshProfile] Error:', err.message);
    }
    return null;
  };

  const login = (email: string, driverData?: any, availableProfiles?: CustomerProfile[]) => {
    setIsAuthenticated(true);
    if (availableProfiles && availableProfiles.length > 0) {
      setProfiles(availableProfiles);
      const primary = driverData?.id 
        ? (availableProfiles.find((p) => p.id === driverData.id) || availableProfiles[0])
        : availableProfiles[0];
      applyProfile(primary);
    } else if (driverData) {
      const updatedDriver = normalizeDriverData(driverData, email, driver);
      setDriver(updatedDriver);

      const userIsActive = isAccountActive(updatedDriver.status, updatedDriver.isActive);

      // Map assigned vehicle from API response
      const vehicleObj =
        driverData.currentVehicle ||
        driverData.vehicle ||
        driverData.assignedVehicle ||
        driverData.vehicleDetails ||
        driverData.assigned_vehicle;

      if (
        userIsActive &&
        vehicleObj &&
        typeof vehicleObj === 'object' &&
        (vehicleObj._id || vehicleObj.basicDetails || vehicleObj.make || vehicleObj.model)
      ) {
        const updatedVehicle = normalizeVehicleData(vehicleObj);
        setVehicle(updatedVehicle);
      } else {
        setVehicle(INITIAL_VEHICLE);
      }

      if (driverData.financial || driverData.statementSummary || driverData.billing) {
        const fin = driverData.financial || driverData.statementSummary || driverData.billing;
        setFinancial((prev) => ({ ...prev, ...fin }));
      }
    } else if (email) {
      setDriver((prev) => ({ ...prev, email }));
    }

    // Always navigate straight to Dashboard (home screen) for all users!
    setScreenStack(['Dashboard']);
    setActiveBottomTab('Home');

    // Proactively refresh latest profile & assigned vehicle from /api/driver/me
    setTimeout(() => {
      refreshProfile();
    }, 150);
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
        refreshProfile,
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
