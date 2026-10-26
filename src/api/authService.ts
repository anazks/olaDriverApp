import apiClient, { setAuthToken } from './axios';

import { CustomerProfile, CustomerStatementData } from '../types';

export interface RequestOtpResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  driver?: any;
  activeProfile?: CustomerProfile;
  profiles?: CustomerProfile[];
}

export interface CustomerStatementApiResponse {
  success: boolean;
  message?: string;
  summary: CustomerStatementData['summary'];
  statement: CustomerStatementData['statement'];
}

/**
 * Request a 4-digit/6-digit OTP sent to driver's email
 */
export const requestOtp = async (email: string): Promise<RequestOtpResponse> => {
  try {
    const response = await apiClient.post<RequestOtpResponse>('/driver-auth/request-otp', {
      email: email.trim().toLowerCase(),
    });
    return response.data;
  } catch (err: any) {
    console.warn('[authService.requestOtp] Backend call failed, using dev fallback:', err.message);
    throw err;
  }
};

/**
 * Verify OTP and log in driver
 */
export const verifyOtpAndLogin = async (
  email: string,
  otp: string
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/driver-auth/login', {
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    });

    if (response.data?.accessToken) {
      setAuthToken(response.data.accessToken);
    }

    return response.data;
  } catch (err: any) {
    console.warn('[authService.verifyOtpAndLogin] Backend call failed, using dev fallback:', err.message);
    throw err;
  }
};

/**
 * Fetch customer financial statement and pending dues
 */
export const fetchCustomerStatement = async (
  customerId: string
): Promise<CustomerStatementApiResponse> => {
  try {
    const response = await apiClient.get<CustomerStatementApiResponse>(
      `/driver-auth/statement/${customerId}`
    );
    return response.data;
  } catch (err: any) {
    console.warn('[authService.fetchCustomerStatement] Backend call failed:', err.message);
    throw err;
  }
};

export interface VehicleDetailsResponse {
  success: boolean;
  message?: string;
  data?: any;
  vehicle?: any;
}

/**
 * Fetch full vehicle specifications and legal documents
 */
export const fetchVehicleDetails = async (
  vehicleId: string
): Promise<VehicleDetailsResponse> => {
  try {
    const response = await apiClient.get<VehicleDetailsResponse>(
      `/driver-auth/vehicle/${vehicleId}`
    );
    return response.data;
  } catch (err: any) {
    console.warn('[authService.fetchVehicleDetails] Backend call failed:', err.message);
    throw err;
  }
};

export default {
  requestOtp,
  verifyOtpAndLogin,
  fetchCustomerStatement,
  fetchVehicleDetails,
};
