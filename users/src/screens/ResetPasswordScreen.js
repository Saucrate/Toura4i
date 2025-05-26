import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '@react-navigation/native';
import Success from '../components/Success';

const ResetPasswordScreen = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const route = useRoute();
  const { email } = route.params;
  
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await resetPassword(email, code, newPassword);
      setSuccess('تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Success
        title="جاري التغيير"
        message="الرجاء الانتظار..."
        showLogo={false}
      />
    );
  }

  if (error) {
    return (
      <Success
        title="خطأ"
        message={error}
        buttonText="حاول مرة أخرى"
        onPress={() => setError(null)}
        icon="alert-circle"
        iconColor="#ff3b30"
        showLogo={false}
      />
    );
  }

  if (success) {
    return (
      <Success
        title="تم التغيير"
        message={success}
        buttonText="تسجيل الدخول"
        onPress={() => navigation.navigate('Login')}
        icon="checkmark-circle"
        iconColor="#4CAF50"
        showLogo={false}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>إعادة تعيين كلمة المرور</Text>
            <Text style={styles.subtitle}>
              أدخل رمز التحقق وكلمة المرور الجديدة
            </Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={24} color="#f2f2d3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="رمز التحقق"
                placeholderTextColor="#f2f2d3"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#f2f2d3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="كلمة المرور الجديدة"
                placeholderTextColor="#f2f2d3"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#f2f2d3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="تأكيد كلمة المرور"
                placeholderTextColor="#f2f2d3"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#f2f2d3" />
              <Text style={styles.backButtonText}>العودة</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f2f2d3',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#f2f2d3',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#f2f2d3',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#f2f2d3',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#f2f2d3',
    fontSize: 16,
    marginRight: 5,
  },
});

export default ResetPasswordScreen; 