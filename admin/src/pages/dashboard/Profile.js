import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUpload, FiLock, FiImage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../components/common/Notification';
import api from '../../services/api';
import { useLogo } from '../../context/LogoContext';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.medium};
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.light};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.gradients.accent};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: fit-content;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LogoPreview = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
  border: 1px solid ${({ theme }) => theme.colors.border.light};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { show } = useNotification();
  const { updateLogo } = useLogo();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        show('كلمات المرور غير متطابقة', 'error');
        return;
      }

      const response = await api.put('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      show('تم تغيير كلمة المرور بنجاح', 'success');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      show(error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.put('/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      updateLogo(response.data.settings.logo);
      show('تم تحديث الشعار بنجاح', 'success');
    } catch (error) {
      show(error.response?.data?.message || 'حدث خطأ أثناء تحديث الشعار', 'error');
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>تغيير كلمة المرور</Title>
        <Form onSubmit={handlePasswordChange}>
          <FormGroup>
            <Label>كلمة المرور الحالية</Label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>كلمة المرور الجديدة</Label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>تأكيد كلمة المرور الجديدة</Label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </FormGroup>
          <Button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiLock />
            تغيير كلمة المرور
          </Button>
        </Form>
      </Card>

      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Title>تغيير شعار التطبيق</Title>
        <FormGroup>
          <Label>اختر صورة جديدة</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
        </FormGroup>
        {logoPreview && (
          <LogoPreview>
            <img src={logoPreview} alt="Logo preview" />
          </LogoPreview>
        )}
        <Button
          as="label"
          htmlFor="logo-upload"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiImage />
          رفع شعار جديد
        </Button>
        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          style={{ display: 'none' }}
        />
      </Card>
    </Container>
  );
};

export default Profile; 