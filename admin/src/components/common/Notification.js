import React, { createContext, useContext, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

const NotificationContext = createContext();

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NotificationItem = styled(motion.div)`
  background: ${({ theme, type }) => 
    type === 'success' ? theme.colors.success + '20' :
    type === 'error' ? theme.colors.error + '20' :
    theme.colors.warning + '20'};
  color: ${({ theme, type }) => 
    type === 'success' ? theme.colors.success :
    type === 'error' ? theme.colors.error :
    theme.colors.warning};
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 300px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  
  .icon {
    font-size: 1.25rem;
  }
  
  .message {
    flex: 1;
  }
  
  .close {
    cursor: pointer;
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }
`;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const show = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleClose = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ show }}>
      {children}
      <Notification notifications={notifications} onClose={handleClose} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const Notification = ({ notifications, onClose }) => {
  return (
    <NotificationContainer>
      <AnimatePresence>
        {notifications.map(({ id, message, type }) => (
          <NotificationItem
            key={id}
            type={type}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="icon">
              {type === 'success' ? <FiCheck /> :
               type === 'error' ? <FiX /> :
               <FiAlertCircle />}
            </div>
            <div className="message">{message}</div>
            <FiX 
              style={{ cursor: 'pointer' }}
              onClick={() => onClose(id)}
            />
          </NotificationItem>
        ))}
      </AnimatePresence>
    </NotificationContainer>
  );
};

export default Notification; 