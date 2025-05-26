import styled from 'styled-components';
import { motion } from 'framer-motion';

const ContentCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  overflow: hidden;
`;

export default ContentCard; 