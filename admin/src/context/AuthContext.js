import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      // You would typically validate the token here
      setUser({
        name: 'مدير النظام',
        email: '23039@supnum.mr',
        role: 'admin'
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (email === '23039@supnum.mr' && password === '12344321') {
      const fakeToken = 'fake_jwt_token';
      localStorage.setItem('auth_token', fakeToken);
      setIsAuthenticated(true);
      setUser({
        name: 'مدير النظام',
        email: '23039@supnum.mr',
        role: 'admin'
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 