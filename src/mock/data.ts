import { Driver, Vehicle, FinancialData, PaymentMethod, Activity, AppNotification } from '../types';

/**
 * Empty baseline state models for integrated live data.
 * Real data is populated exclusively via backend API responses (/driver-auth).
 */
export const INITIAL_DRIVER: Driver = {
  name: '',
  firstName: '',
  lastName: '',
  driverId: '',
  verified: false,
  status: 'ACTIVE',
  isActive: true,
  email: '',
  phone: '',
  address: '',
  emergencyContact: '',
  avatarUrl: '',
};

export const INITIAL_VEHICLE: Vehicle = {
  id: '',
  make: '',
  model: '',
  variant: '',
  year: new Date().getFullYear(),
  plateNumber: '',
  fleetNumber: '',
  vin: '',
  engineNumber: '',
  fuelType: '',
  transmission: '',
  colour: '',
  seats: 0,
  category: '',
  currentMileage: 0,
  nextService: 0,
  lastServiceMileage: 0,
  status: '',
  imageUrl: '',
  branch: '',
  gpsActive: false,
  gpsSerial: '',
  documents: [],
};

export const INITIAL_FINANCIAL: FinancialData = {
  totalEarnings: 0,
  monthlyGrowth: 0,
  currentDue: 0,
  baseRental: 0,
  insurance: 0,
  serviceFee: 0,
  paymentDueDate: '',
};

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [];

export const INITIAL_ACTIVITIES: Activity[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
