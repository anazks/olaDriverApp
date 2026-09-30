import apiClient, { setAuthToken } from './axios';

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
    // If backend is unreachable in local dev mode, return fallback info
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

export default {
  requestOtp,
  verifyOtpAndLogin,
};
