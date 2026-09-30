import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OtpVerificationScreen } from '../screens/OtpVerificationScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { VehicleStatusScreen } from '../screens/VehicleStatusScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { MakePaymentScreen } from '../screens/MakePaymentScreen';
import { ActivityHistoryScreen } from '../screens/ActivityHistoryScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SideMenu } from '../components/SideMenu';
import { Toast } from '../components/Toast';

export const AppNavigator: React.FC = () => {
  const { currentScreen, toastMessage } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen />;
      case 'Login':
        return <LoginScreen />;
      case 'OtpVerification':
        return <OtpVerificationScreen />;
      case 'ForgotPassword':
        return <ForgotPasswordScreen />;
      case 'Dashboard':
        return <DashboardScreen />;
      case 'Profile':
        return <ProfileScreen />;
      case 'EditProfile':
        return <EditProfileScreen />;
      case 'VehicleStatus':
        return <VehicleStatusScreen />;
      case 'Payments':
        return <PaymentsScreen />;
      case 'MakePayment':
        return <MakePaymentScreen />;
      case 'ActivityHistory':
        return <ActivityHistoryScreen />;
      case 'Notifications':
        return <NotificationsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <SideMenu />
      <Toast message={toastMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
