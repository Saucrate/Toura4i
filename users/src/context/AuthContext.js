import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Alert } from 'react-native';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const logError = (error, context) => {
    console.error(`[${context}] Error:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    });
    setError(error);
  };

  async function loadStoredData() {
    try {
      const storedUser = await AsyncStorage.getItem('@Toura4i:user');
      const storedToken = await AsyncStorage.getItem('@Toura4i:token');

      if (storedUser && storedToken) {
        api.defaults.headers.authorization = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      logError(error, 'loadStoredData');
    } finally {
      setLoading(false);
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.post('/api/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب');
    }
  };

  const verifyEmail = async (code, email) => {
    try {
      const response = await api.post('/api/auth/verify-email', { code, email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء التحقق من البريد الإلكتروني');
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await api.post('/api/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إعادة إرسال رمز التحقق');
    }
  };

  const login = async (identifier, password, loginType = 'email') => {
    try {
      let response;
      
      const loginData = {
        password,
        [loginType]: identifier
      };

      response = await api.post('/api/auth/login', loginData);

      if (response.data.token) {
        await AsyncStorage.setItem('@Toura4i:user', JSON.stringify(response.data.user));
        await AsyncStorage.setItem('@Toura4i:token', response.data.token);

        api.defaults.headers.common['authorization'] = `Bearer ${response.data.token}`;

        setUser(response.data.user);
        setToken(response.data.token);
        console.log('LOGIN RESPONSE USER:', response.data.user);
        return { success: true, message: 'تم تسجيل الدخول بنجاح' };
      }

      return { success: false, message: 'فشل تسجيل الدخول' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل تسجيل الدخول';
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@Toura4i:token');
      await AsyncStorage.removeItem('@Toura4i:user');
      setUser(null);
      setToken(null);
      delete api.defaults.headers.authorization;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/api/auth/forgot-password', { email });
    } catch (error) {
      logError(error, 'forgotPassword');
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور');
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      await api.post('/api/auth/reset-password', { email, code, newPassword });
    } catch (error) {
      logError(error, 'resetPassword');
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور');
    }
  };

  const updateUser = async (userData) => {
    try {
      setUser(prevUser => ({ ...prevUser, ...userData }));
      await AsyncStorage.setItem('@Toura4i:user', JSON.stringify(userData));
    } catch (error) {
      logError(error, 'updateUser');
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات المستخدم');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const reloadUser = async () => {
    try {
      const response = await api.get('/api/users/profile');
      console.log('PROFILE RESPONSE:', response.data);
      if (response.data) {
        setUser(response.data);
        await AsyncStorage.setItem('@Toura4i:user', JSON.stringify(response.data));
      }
    } catch (error) {
      logError(error, 'reloadUser');
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات المستخدم');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        token,
        loading,
        error,
        clearError,
        signup,
        verifyEmail,
        resendVerification,
        login,
        signOut,
        forgotPassword,
        resetPassword,
        updateUser,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 