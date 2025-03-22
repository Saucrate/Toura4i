import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiCoffee } from 'react-icons/fi';
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
  ErrorMessage
} from '../styles/AuthStyles';

const Login = ({ onSwitchToForgotPassword, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    if (formData.email === '23039@supnum.mr' && formData.password === '12344321') {
      onLogin();
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

        <FormTitle>مرحباً بك في لوحة التحكم</FormTitle>
        <FormDescription>
          قم بتسجيل الدخول للوصول إلى لوحة التحكم وإدارة المحتوى
        </FormDescription>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </ErrorMessage>
          )}

          <InputWrapper>
            <Input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <FiUser size={20} />
          </InputWrapper>

          <InputWrapper>
            <Input
              type="password"
              name="password"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
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
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiCoffee size={20} />
              </motion.div>
            ) : (
              'تسجيل الدخول'
            )}
          </Button>

          <Link 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onSwitchToForgotPassword();
            }}
          >
            نسيت كلمة المرور؟
          </Link>
        </Form>
      </AuthCard>
    </AuthContainer>
  );
};

export default Login; 