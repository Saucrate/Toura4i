import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMenu } from 'react-icons/fi';

const HeaderContainer = styled.header`
  height: 70px;
  background: ${({ theme }) => theme.colors.background.light};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  display: flex;
  align-items: center;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 90;
`;

const MenuButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.background.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: none;

  @media (max-width: 768px) {
    display: flex;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background.dark};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Header = () => {
  return null;
};

export default Header; 