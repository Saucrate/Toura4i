import React, { createContext, useContext, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const NotificationContext = createContext();

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1100;
`;

const Notification = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme, type }) => 
    type === 'success' ? theme.colors.success + '15' :
    type === 'error' ? theme.colors.error + '15' :
    theme.colors.accent + '15'};
  border: 1px solid ${({ theme, type }) => 
    type === 'success' ? theme.colors.success :
    type === 'error' ? theme.colors.error :
    theme.colors.accent};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  svg {
    font-size: 1.25rem;
    color: ${({ theme, type }) => 
      type === 'success' ? theme.colors.success :
      type === 'error' ? theme.colors.error :
      theme.colors.accent};
  }
`;

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return <FiCheckCircle />;
    case 'error':
      return <FiXCircle />;
    default:
      return <FiAlertCircle />;
  }
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const show = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ show }}>
      {children}
      <NotificationContainer>
        <AnimatePresence>
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              type={notification.type}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              {getIcon(notification.type)}
              <span>{notification.message}</span>
            </Notification>
          ))}
        </AnimatePresence>
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 