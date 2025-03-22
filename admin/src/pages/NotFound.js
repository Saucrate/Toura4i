import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Button } from '../components/common/Button';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const Content = styled(motion.div)`
  max-width: 400px;
  
  h1 {
    font-size: 8rem;
    color: ${({ theme }) => theme.colors.accent};
    margin-bottom: 1rem;
  }
  
  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 1rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 2rem;
  }
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Content
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>404</h1>
        <h2>الصفحة غير موجودة</h2>
        <p>عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Button onClick={() => navigate('/')}>
          <FiArrowLeft />
          العودة للرئيسية
        </Button>
      </Content>
    </Container>
  );
};

export default NotFound; 