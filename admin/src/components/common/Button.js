import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const buttonStyles = css`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${({ size }) => 
    size === 'small' ? '0.375rem 0.75rem' : 
    size === 'large' ? '0.75rem 1.5rem' : 
    '0.5rem 1rem'};
  border-radius: 8px;
  border: none;
  font-size: ${({ size }) => 
    size === 'small' ? '0.875rem' : 
    size === 'large' ? '1.125rem' : 
    '1rem'};
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ theme, variant }) => 
    variant === 'secondary' ? theme.colors.background.light :
    variant === 'danger' ? theme.colors.danger + '20' :
    theme.colors.accent};
  color: ${({ theme, variant }) => 
    variant === 'secondary' ? theme.colors.text.primary :
    variant === 'danger' ? theme.colors.danger :
    'white'};

  &:hover {
    background: ${({ theme, variant }) => 
      variant === 'secondary' ? theme.colors.background.medium :
      variant === 'danger' ? theme.colors.danger + '30' :
      theme.colors.accent + 'dd'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  ${buttonStyles}
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  background: ${({ theme, active }) => 
    active ? theme.colors.accent + '15' : theme.colors.background.light};
  color: ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: ${({ align }) => align || 'flex-start'};
`;

export { Button, ButtonGroup, IconButton }; 