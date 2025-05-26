import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API URL telefon: 'http://172.20.10.7:5000' dar: 'http://192.168.100.35:5000'  La turkey: http://192.168.100.48:5000' adalya: 'http://192.168.100.40:5000' institue: 'http://10.17.11.6:5000'
const API_URL = 'http://192.168.100.35:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log('Making request to:', config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', config.headers);
    
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى'));
    }

    if (!error.response) {
      return Promise.reject(new Error('اتصال به سرور برقرار نشد. لطفا دوباره تلاش کنید'));
    }

    if (error.response.status === 401) {
      AsyncStorage.removeItem('token');
      return Promise.reject(new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى'));
    }

    return Promise.reject(error);
  }
);

export default api; 