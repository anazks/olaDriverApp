/**
 * Environment configuration
 * Automatically reads from EXPO_PUBLIC_ environment variables in SDK 49+
 */

export const ENV = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    'http://192.168.29.18:3000/api',
  TIMEOUT_MS: 15000,
};

export default ENV;
