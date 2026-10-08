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

export interface CustomerProfile {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  branch?: string;
  vehicle: Vehicle;
  financial: FinancialData;
}


export interface VehicleDocument {
  id: string;
  title: string;
  type: 'REGISTRATION' | 'ROAD_TAX' | 'ROADWORTHINESS' | 'INSURANCE' | 'OTHER' | string;
  docNumber?: string;
  expiryDate?: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Pending' | string;
  fileUrl?: string;
  issuer?: string;
}

export interface VehicleInsurance {
  policyNumber: string;
  provider: string;
  coverageType: string;
  expiryDate: string;
  status: 'Active' | 'Expired' | string;
  certificateUrl?: string;
}

export interface Vehicle {
  id?: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  plateNumber: string;
  fleetNumber?: string;
  vin: string;
  engineNumber?: string;
  fuelType: string;
  transmission?: string;
  colour?: string;
  seats?: number;
  category?: string;
  currentMileage: number;
  nextService: number;
  lastServiceMileage?: number;
  status: 'Active' | 'Maintenance' | 'Inactive' | string;
  imageUrl: string;
  branch?: string;
  gpsActive?: boolean;
  gpsSerial?: string;
  insurance?: VehicleInsurance;
  documents?: VehicleDocument[];
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

export interface StatementTransaction {
  id: string;
  date: string;
  type: 'Invoice' | 'Payment' | 'Credit Note' | string;
  refNumber: string;
  description: string;
  debit: number;
  credit: number;
  status: string;
  runningBalance: number;
}

export interface PendingInvoice {
  id: string;
  invoiceNumber: string;
  description: string;
  totalAmount: number;
  amountPaid: number;
  remaining: number;
  dueDate: string;
  status: string;
}

export interface CustomerStatementData {
  summary: {
    pendingAmount: number;
    nextDueDate: string;
    totalInvoiced: number;
    totalPaid: number;
    closingBalance: number;
    breakdown?: {
      baseRental: number;
      insurance: number;
      serviceFee: number;
    };
    pendingInvoices?: PendingInvoice[];
  };
  statement: StatementTransaction[];
}
