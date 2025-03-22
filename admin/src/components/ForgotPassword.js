import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';
import {
  AuthContainer,
  AuthCard,
  Form,
  Button,
  Link,
  LogoImage,
  InputWrapper,
  Input,
  FormTitle,
  FormDescription,
  ErrorMessage,
  SuccessMessage,
  VerificationContainer,
  VerificationInput,
  StepIndicator,
  Step
} from '../styles/AuthStyles';

const ForgotPassword = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (step === 2) {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email) {
      setSuccess('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 1500);
    }
    setIsLoading(false);
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 800));

    if (verificationCode.join('') === '000111') {
      setSuccess('تم التحقق من الرمز بنجاح');
      setTimeout(() => {
        setStep(3);
        setSuccess('');
      }, 1500);
    } else {
      setError('رمز التحقق غير صحيح');
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 800));

    if (newPassword === confirmPassword) {
      setSuccess('تم تغيير كلمة المرور بنجاح');
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } else {
      setError('كلمات المرور غير متطابقة');
    }
    setIsLoading(false);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FormTitle>إعادة تعيين كلمة المرور</FormTitle>
            <FormDescription>
              أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
            </FormDescription>
            
            <Form onSubmit={handleEmailSubmit}>
              <InputWrapper>
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FiMail size={20} />
              </InputWrapper>
              
              <Button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </Button>
            </Form>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FormTitle>أدخل رمز التحقق</FormTitle>
            <FormDescription>
              تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني
            </FormDescription>

            <Form onSubmit={handleCodeSubmit}>
              <VerificationContainer>
                {verificationCode.map((digit, index) => (
                  <VerificationInput
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </VerificationContainer>

              <Button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
              </Button>
            </Form>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FormTitle>كلمة المرور الجديدة</FormTitle>
            <FormDescription>
              قم بإدخال كلمة المرور الجديدة
            </FormDescription>

            <Form onSubmit={handlePasswordSubmit}>
              <InputWrapper>
                <Input
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <FiLock size={20} />
              </InputWrapper>

              <InputWrapper>
                <Input
                  type="password"
                  placeholder="تأكيد كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <FiLock size={20} />
              </InputWrapper>

              <Button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </Button>
            </Form>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthContainer>
      <AuthCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <LogoImage src="/logo.png" alt="تراثي" />
        </motion.div>

        <StepIndicator>
          <Step active={step >= 1} />
          <Step active={step >= 2} />
          <Step active={step >= 3} />
        </StepIndicator>

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </ErrorMessage>
        )}

        {success && (
          <SuccessMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {success}
          </SuccessMessage>
        )}

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <Link 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            onSwitchToLogin();
          }}
        >
          <FiArrowLeft style={{ marginLeft: '8px' }} />
          العودة إلى تسجيل الدخول
        </Link>
      </AuthCard>
    </AuthContainer>
  );
};

export default ForgotPassword; 