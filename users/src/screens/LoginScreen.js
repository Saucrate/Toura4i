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
import Success from '../components/Success';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('email'); // 'email', 'phone', or 'username'
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('يرجى إدخال بيانات تسجيل الدخول وكلمة المرور');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await login(identifier, password, loginType);
      
      if (result.success) {
        setSuccess('تم تسجيل الدخول بنجاح');
        setTimeout(() => {
          navigation.replace('Main', { screen: 'Home' });
        }, 2000);
      }
    } catch (error) {
      setError(error.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginTypeSelector = () => (
    <View style={styles.loginTypeContainer}>
      <TouchableOpacity
        style={[styles.loginTypeButton, loginType === 'email' && styles.loginTypeButtonActive]}
        onPress={() => setLoginType('email')}
      >
        <Ionicons name="mail-outline" size={20} color={loginType === 'email' ? '#000000' : '#f2f2d3'} />
        <Text style={[styles.loginTypeText, loginType === 'email' && styles.loginTypeTextActive]}>
          البريد الإلكتروني
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginTypeButton, loginType === 'phone' && styles.loginTypeButtonActive]}
        onPress={() => setLoginType('phone')}
      >
        <Ionicons name="call-outline" size={20} color={loginType === 'phone' ? '#000000' : '#f2f2d3'} />
        <Text style={[styles.loginTypeText, loginType === 'phone' && styles.loginTypeTextActive]}>
          رقم الهاتف
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginTypeButton, loginType === 'username' && styles.loginTypeButtonActive]}
        onPress={() => setLoginType('username')}
      >
        <Ionicons name="person-outline" size={20} color={loginType === 'username' ? '#000000' : '#f2f2d3'} />
        <Text style={[styles.loginTypeText, loginType === 'username' && styles.loginTypeTextActive]}>
          اسم المستخدم
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <Success
        title="جاري تسجيل الدخول"
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
        title="نجاح"
        message={success}
        showLogo={false}
        icon="checkmark-circle"
        iconColor="#4CAF50"
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
            <Text style={styles.title}>تسجيل الدخول</Text>
            
            {renderLoginTypeSelector()}
            
            <View style={styles.inputContainer}>
              <Ionicons 
                name={
                  loginType === 'email' ? 'mail-outline' : 
                  loginType === 'phone' ? 'call-outline' : 
                  'person-outline'
                } 
                size={24} 
                color="#f2f2d3" 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder={
                  loginType === 'email' ? 'البريد الإلكتروني' :
                  loginType === 'phone' ? 'رقم الهاتف' :
                  'اسم المستخدم'
                }
                placeholderTextColor="#f2f2d3"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType={loginType === 'phone' ? 'phone-pad' : 'default'}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#f2f2d3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="كلمة المرور"
                placeholderTextColor="#f2f2d3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#f2f2d3"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>نسيت كلمة المرور؟</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>ليس لديك حساب؟</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>إنشاء حساب جديد</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  loginTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  loginTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  loginTypeButtonActive: {
    backgroundColor: '#f2f2d3',
  },
  loginTypeText: {
    color: '#f2f2d3',
    fontSize: 14,
    marginRight: 5,
  },
  loginTypeTextActive: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    marginBottom: 15,
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
  eyeIcon: {
    padding: 10,
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
  forgotPasswordButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#f2f2d3',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#f2f2d3',
    fontSize: 16,
    marginRight: 5,
  },
  signupLink: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen; 