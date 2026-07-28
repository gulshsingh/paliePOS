import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: 'https://palie-backend.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`\n🌐 API REQ: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log(`\n✅ API RES: ${res.config.method?.toUpperCase()} ${res.config.baseURL}${res.config.url}`);
    console.log('STATUS:', res.status);
    console.log('BODY:', JSON.stringify(res.data, null, 2));
    return res;
  },
  (error) => {
    console.log(`\n❌ API ERR: ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`);
    console.log('STATUS:', error.response?.status);
    console.log('BODY:', JSON.stringify(error.response?.data, null, 2));
    console.log('MESSAGE:', error.message);
    if (error.response?.status === 401) {
      AsyncStorage.clear();
    }
    return Promise.reject(error);
  },
);
