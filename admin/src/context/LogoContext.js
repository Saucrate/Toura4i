import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LogoContext = createContext();

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

export const LogoProvider = ({ children }) => {
  const [logo, setLogo] = useState('/logo.png'); // Default logo
  const [loading, setLoading] = useState(true);

  const fetchLogo = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data?.logo) {
        setLogo(response.data.logo);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  const updateLogo = (newLogo) => {
    setLogo(newLogo);
  };

  return (
    <LogoContext.Provider value={{ logo, loading, updateLogo, refreshLogo: fetchLogo }}>
      {children}
    </LogoContext.Provider>
  );
}; 