import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiBook, FiMusic, FiImage, 
  FiVideo, FiUsers, FiLogOut, 
  FiMic, FiDisc 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const SidebarContainer = styled(motion.aside)`
  width: 280px;
  background: ${({ theme }) => theme.colors.background.medium};
  border-left: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: 2rem;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    transform: translateX(${props => props.isOpen ? '0' : '100%'});
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.dark};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.light};
    border-radius: 4px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  img {
    width: 120px;
    height: auto;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const NavSection = styled.div`
  margin-bottom: 2rem;

  h3 {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
    margin-bottom: 1rem;
    padding: 0 1rem;
  }
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 1rem;
  color: ${({ theme, active }) => 
    active ? theme.colors.text.primary : theme.colors.text.secondary};
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: ${({ theme, active }) => 
    active ? theme.colors.background.light : 'transparent'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  svg {
    margin-left: 1rem;
    font-size: 1.25rem;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background.light};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateX(-4px);
  }

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: ${({ theme, active }) => 
      active ? theme.colors.accent : 'transparent'};
    border-radius: 0 4px 4px 0;
  }
`;

const Badge = styled(motion.span)`
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-right: auto;
`;

const LogoutButton = styled(motion.button)`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.error};
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: auto;
  transition: all 0.3s ease;

  svg {
    margin-left: 1rem;
    font-size: 1.25rem;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.error}20;
    transform: translateX(-4px);
  }
`;

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const mainMenuItems = [
    { icon: FiHome, label: 'الرئيسية', path: '/' },
    { icon: FiBook, label: 'القصائد', path: '/poems', badge: '12' },
    { icon: FiUsers, label: 'الشعراء', path: '/poets' },
    { icon: FiMusic, label: 'الألبومات', path: '/albums' },
  ];

  const mediaMenuItems = [
    { icon: FiMic, label: 'الطلعات', path: '/talat', badge: 'جديد' },
    { icon: FiImage, label: 'الصور', path: '/photos' },
    { icon: FiVideo, label: 'الفيديوهات', path: '/videos' },
  ];

  const menuItems = [
    ...mainMenuItems,
    ...mediaMenuItems
  ];

  return (
    <AnimatePresence>
      {(isOpen || window.innerWidth > 768) && (
        <SidebarContainer
          isOpen={isOpen}
          initial={{ x: 280 }}
          animate={{ x: 0 }}
          exit={{ x: 280 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Logo>
            <motion.img 
              src="/logo.png" 
              alt="الهلال" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Logo>

          <NavSection>
            <h3>القائمة الرئيسية</h3>
            {mainMenuItems.map((item) => (
              <MenuItem
                key={item.path}
                to={item.path}
                active={location.pathname === item.path ? 1 : 0}
                onClick={() => window.innerWidth <= 768 && setIsOpen(false)}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    {item.badge}
                  </Badge>
                )}
              </MenuItem>
            ))}
          </NavSection>

          <NavSection>
            <h3>الوسائط</h3>
            {mediaMenuItems.map((item) => (
              <MenuItem
                key={item.path}
                to={item.path}
                active={location.pathname === item.path ? 1 : 0}
                onClick={() => window.innerWidth <= 768 && setIsOpen(false)}
              >
                <item.icon />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    {item.badge}
                  </Badge>
                )}
              </MenuItem>
            ))}
          </NavSection>

          {user?.role === 'admin' && (
            <NavSection>
              <h3>الإدارة</h3>
              <MenuItem
                to="/users"
                active={location.pathname === '/users' ? 1 : 0}
              >
                <FiUsers />
                <span>المستخدمين</span>
              </MenuItem>
            </NavSection>
          )}

          <LogoutButton
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiLogOut />
            <span>تسجيل الخروج</span>
          </LogoutButton>
        </SidebarContainer>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;