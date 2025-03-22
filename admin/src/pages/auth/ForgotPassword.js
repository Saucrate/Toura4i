import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import styled from 'styled-components';
import {
  FormContainer,
  FormGroup,
  Input,
  ErrorMessage
} from '../../components/forms/FormStyles';
import { Button } from '../../components/common/Button';

// Reuse styles from Login component
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: ${({ theme }) => theme.gradients.dark};
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.medium};
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 2rem;
`;

const Step = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ active, theme }) => 
    active ? theme.colors.accent : theme.colors.border.medium};
  transition: background 0.3s ease;
`;

const VerificationInputs = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 2rem 0;
`;

const VerificationInput = styled(Input)`
  width: 40px;
  text-align: center;
  padding: 0.75rem;
  font-size: 1.25rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.light};
  }
`;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStep(2);
    setLoading(false);
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const code = verificationCode.join('');
    if (code === '000111') {
      setStep(3);
    } else {
      setError('رمز التحقق غير صحيح');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/login');
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StepIndicator>
          <Step active={step >= 1} />
          <Step active={step >= 2} />
          <Step active={step >= 3} />
        </StepIndicator>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FormContainer onSubmit={handleEmailSubmit}>
                <FormGroup>
                  <Input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormGroup>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  إرسال رمز التحقق
                </Button>
              </FormContainer>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FormContainer onSubmit={handleCodeSubmit}>
                <VerificationInputs>
                  {verificationCode.map((digit, index) => (
                    <VerificationInput
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      required
                    />
                  ))}
                </VerificationInputs>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  تحقق من الرمز
                </Button>
              </FormContainer>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FormContainer onSubmit={handlePasswordSubmit}>
                <FormGroup>
                  <Input
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    type="password"
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </FormGroup>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  تغيير كلمة المرور
                </Button>
              </FormContainer>
            </motion.div>
          )}
        </AnimatePresence>

        <BackButton onClick={() => navigate('/login')}>
          <FiArrowLeft />
          العودة إلى تسجيل الدخول
        </BackButton>
      </Card>
    </Container>
  );
};

export default ForgotPassword; 