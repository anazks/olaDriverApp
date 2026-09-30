import { Driver, Vehicle, FinancialData, PaymentMethod, Activity, AppNotification } from '../types';

export const INITIAL_DRIVER: Driver = {
  name: 'Carlos Mendoza',
  firstName: 'Carlos',
  lastName: 'Mendoza',
  driverId: 'DRV45892',
  verified: true,
  email: 'carlos@example.com',
  phone: '+507 6000-1234',
  address: 'Calle 50, Plaza Real, Suite 402, Panama City',
  emergencyContact: '+507 6222-9876 (Maria Mendoza - Spouse)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
};

export const INITIAL_VEHICLE: Vehicle = {
  make: 'Toyota',
  model: 'Corolla',
  variant: 'LX',
  year: 2023,
  plateNumber: '8AC-342',
  vin: 'JTDB4MEE5PJ123456',
  fuelType: 'Petrol',
  currentMileage: 12450,
  nextService: 20000,
  status: 'Active',
  imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
};

export const INITIAL_FINANCIAL: FinancialData = {
  totalEarnings: 1245.0,
  monthlyGrowth: 12,
  currentDue: 320.0,
  baseRental: 250.0,
  insurance: 50.0,
  serviceFee: 20.0,
  paymentDueDate: 'September 30, 2026',
};

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    last4: '4242',
    cardBrand: 'visa',
    isDefault: true,
  },
  {
    id: 'pm_2',
    type: 'paypal',
    email: 'carlos@example.com',
    isDefault: false,
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act_1',
    title: 'Payment Successful',
    description: 'Weekly vehicle rental payment',
    amount: '$320.00',
    timestamp: 'Sep 20, 2026 · 10:24 AM',
    category: 'Payments',
    iconName: 'check-circle',
    colorType: 'green',
  },
  {
    id: 'act_2',
    title: 'Vehicle Service Updated',
    description: 'Next service at 20,000 km',
    timestamp: 'Sep 18, 2026 · 02:15 PM',
    category: 'Vehicle',
    iconName: 'car',
    colorType: 'purple',
  },
  {
    id: 'act_3',
    title: 'Profile Updated',
    description: 'Contact details changed',
    timestamp: 'Sep 15, 2026 · 11:30 AM',
    category: 'Account',
    iconName: 'user',
    colorType: 'pink',
  },
  {
    id: 'act_4',
    title: 'Payment Method Added',
    description: 'Visa **** 4242',
    timestamp: 'Sep 10, 2026 · 09:20 AM',
    category: 'Payments',
    iconName: 'credit-card',
    colorType: 'purple',
  },
  {
    id: 'act_5',
    title: 'Login',
    description: 'New device login',
    timestamp: 'Sep 08, 2026 · 08:45 AM',
    category: 'Account',
    iconName: 'log-in',
    colorType: 'orange',
  },
  {
    id: 'act_6',
    title: 'Payment Successful',
    description: 'Weekly rental payment',
    amount: '$280.00',
    timestamp: 'Aug 30, 2026 · 04:10 PM',
    category: 'Payments',
    iconName: 'check-circle',
    colorType: 'green',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: 'Payment Due Reminder',
    message: 'Your $320 payment is due on Sep 30.',
    time: '2 hours ago',
    unread: true,
    type: 'payment',
  },
  {
    id: 'notif_2',
    title: 'Vehicle Service Reminder',
    message: 'Your vehicle service is approaching at 20,000 km.',
    time: '1 day ago',
    unread: true,
    type: 'service',
  },
  {
    id: 'notif_3',
    title: 'Payment Successful',
    message: 'Your recent payment of $320.00 was successfully processed.',
    time: '6 days ago',
    unread: false,
    type: 'payment',
  },
];
