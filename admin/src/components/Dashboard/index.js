import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLogOut, FiHome, FiUsers, FiMusic, FiBook, 
  FiImage, FiVideo, FiMenu, FiX 
} from 'react-icons/fi';

const colors = {
  primary: '#2C3E50',
  secondary: '#E67E22',
  background: '#1a1a1a',
  text: '#ECF0F1',
  accent: '#3498DB',
  border: 'rgba(236, 240, 241, 0.1)'
};

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.background} 100%);
  direction: rtl;
`;

const Sidebar = styled(motion.div)`
  width: 280px;
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${colors.border};
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    transform: translateX(${props => props.isOpen ? '0' : '100%'});
    transition: transform 0.3s ease;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  margin-right: ${props => props.isMobile ? '0' : '280px'};
  transition: margin 0.3s ease;
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
  margin: 0 auto 2rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
`;

const MenuItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 1rem;
  color: ${colors.text};
  cursor: pointer;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-5px);
  }
  
  svg {
    margin-left: 1rem;
    font-size: 1.2rem;
  }

  &.active {
    background: linear-gradient(45deg, ${colors.secondary}, ${colors.accent});
    box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
  }
`;

const MenuButton = styled(motion.button)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  color: ${colors.text};
  cursor: pointer;
  z-index: 101;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const menuItems = [
  { icon: FiHome, label: 'الرئيسية', id: 'home' },
  { icon: FiUsers, label: 'المستخدمين', id: 'users' },
  { icon: FiBook, label: 'القصائد', id: 'poems' },
  { icon: FiMusic, label: 'الأغاني', id: 'songs' },
  { icon: FiImage, label: 'الصور', id: 'images' },
  { icon: FiVideo, label: 'الفيديوهات', id: 'videos' }
];

const Dashboard = ({ onLogout }) => {
  const [activeItem, setActiveItem] = useState('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DashboardContainer>
      {isMobile && (
        <MenuButton
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </MenuButton>
      )}

      <Sidebar
        isOpen={isMenuOpen}
        initial={false}
        animate={isMobile ? { x: isMenuOpen ? 0 : '100%' } : {}}
      >
        <Logo src="/logo.png" alt="تراثي" />
        
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            className={activeItem === item.id ? 'active' : ''}
            onClick={() => {
              setActiveItem(item.id);
              if (isMobile) setIsMenuOpen(false);
            }}
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </MenuItem>
        ))}
        
        <MenuItem 
          onClick={onLogout}
          style={{ marginTop: 'auto' }}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiLogOut size={20} />
          <span>تسجيل الخروج</span>
        </MenuItem>
      </Sidebar>
      
      <Content isMobile={isMobile}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 style={{ color: colors.text, marginBottom: '2rem', fontSize: '2rem' }}>
              {menuItems.find(item => item.id === activeItem)?.label}
            </h1>
            {/* Add your dashboard content here */}
          </motion.div>
        </AnimatePresence>
      </Content>
    </DashboardContainer>
  );
};

export default Dashboard; 