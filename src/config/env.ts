/**
 * Environment configuration
 * Automatically reads from EXPO_PUBLIC_ environment variables in SDK 49+
 */

export const ENV = {
  API_BASE_URL: (() => {
    const raw =
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      process.env.REACT_APP_API_URL ||
      'https://olacars.byteboot.in/api';
    const trimmed = raw.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  })(),
  TIMEOUT_MS: 15000,
};

export default ENV;
