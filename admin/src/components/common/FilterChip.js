import styled from 'styled-components';
import { motion } from 'framer-motion';

const FilterChip = styled(motion.button)`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.border.light};
  background: ${({ theme, active }) => 
    active ? theme.colors.accent + '20' : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export default FilterChip; 