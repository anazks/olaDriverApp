import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';

// In-memory token storage (can be backed by SecureStore/AsyncStorage)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error formatting
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API Response] ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError<{ message?: string; success?: boolean }>) => {
    let friendlyMessage = 'Unable to connect to server. Please check your internet connection.';

    if (error.response?.data?.message) {
      friendlyMessage = error.response.data.message;
    } else if (error.message.includes('Network Error')) {
      friendlyMessage = `Network Error: Cannot connect to ${ENV.API_BASE_URL}`;
    } else if (error.code === 'ECONNABORTED') {
      friendlyMessage = 'Connection timed out. Please try again.';
    }

    if (__DEV__) {
      console.warn(`[API Error] ${error.config?.url}:`, friendlyMessage);
    }

    return Promise.reject(new Error(friendlyMessage));
  }
);

export default apiClient;
