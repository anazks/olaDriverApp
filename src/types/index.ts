export interface Driver {
  name: string;
  firstName: string;
  lastName: string;
  driverId: string;
  verified: boolean;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  avatarUrl: string;
}

export interface Vehicle {
  make: string;
  model: string;
  variant: string;
  year: number;
  plateNumber: string;
  vin: string;
  fuelType: string;
  currentMileage: number;
  nextService: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
  imageUrl: string;
}

export interface FinancialData {
  totalEarnings: number;
  monthlyGrowth: number;
  currentDue: number;
  baseRental: number;
  insurance: number;
  serviceFee: number;
  paymentDueDate: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  cardBrand?: 'visa' | 'mastercard';
  isDefault: boolean;
  email?: string;
}

export type ActivityCategory = 'Payments' | 'Vehicle' | 'Account';

export interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: ActivityCategory;
  amount?: string;
  iconName: 'check-circle' | 'car' | 'user' | 'credit-card' | 'log-in';
  colorType: 'green' | 'purple' | 'pink' | 'orange' | 'blue';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'payment' | 'service' | 'system';
}

export type RootScreen =
  | 'Splash'
  | 'Login'
  | 'OtpVerification'
  | 'ForgotPassword'
  | 'Dashboard'
  | 'Profile'
  | 'EditProfile'
  | 'VehicleStatus'
  | 'Payments'
  | 'MakePayment'
  | 'ActivityHistory'
  | 'Notifications';

export type BottomTabKey = 'Home' | 'Payments' | 'Vehicle' | 'Settings';
