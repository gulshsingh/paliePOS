import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: 'https://palie-backend.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach token ─────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth error codes that should trigger logout ───────────
const AUTH_ERROR_CODES = [
  'AUTH_TOKEN_MISSING',
  'AUTH_TOKEN_INVALID',
  'AUTH_TOKEN_EXPIRED',
  'TOKEN_EXPIRED',
  'UNAUTHORIZED',
];

// Callback set by AppNavigator to trigger signOut
let _onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  _onUnauthorized = handler;
};

const triggerLogout = async () => {
  await AsyncStorage.clear();
  _onUnauthorized?.();
};

// ── Response: handle auth errors ─────────────────────────
api.interceptors.response.use(
  (res) => {
    // Check success=false + AUTH error code in 2xx responses
    const data = res.data as any;
    if (
      data?.success === false &&
      AUTH_ERROR_CODES.includes(data?.error_code)
    ) {
      triggerLogout();
    }
    return res;
  },
  (error) => {
    const status    = error.response?.status;
    const errorCode = error.response?.data?.error_code;

    // 401 HTTP status
    if (status === 401) {
      triggerLogout();
      return Promise.reject(error);
    }

    // Any other status with auth error code
    if (errorCode && AUTH_ERROR_CODES.includes(errorCode)) {
      triggerLogout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
