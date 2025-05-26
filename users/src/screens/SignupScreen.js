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
import Error from '../components/Error';
import Success from '../components/Success';

const SignupScreen = ({ navigation }) => {
  const { signup, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSignup = async () => {
    setLocalError(null);
    clearError();
    setSuccess(null);

    if (!name || !username || !email || !password || !confirmPassword) {
      setLocalError({
        title: 'خطأ',
        message: 'الرجاء ملء جميع الحقول المطلوبة'
      });
      return;
    }

    if (password !== confirmPassword) {
      setLocalError({
        title: 'خطأ',
        message: 'كلمات المرور غير متطابقة'
      });
      return;
    }

    if (password.length < 6) {
      setLocalError({
        title: 'خطأ',
        message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'
      });
      return;
    }

    if (phone && phone.length < 10) {
      setLocalError({
        title: 'خطأ',
        message: 'يرجى إدخال رقم هاتف صحيح'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await signup({
        username,
        name,
        email,
        phoneNumber: phone,
        password
      });

      if (result && result.message) {
        setSuccess({
          title: 'تم التسجيل بنجاح',
          message: result.message,
          onPress: () => navigation.replace('VerifyEmail', { email })
        });
      } else {
        setSuccess({
          title: 'تم التسجيل بنجاح',
          message: 'تم إرسال رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.',
          onPress: () => navigation.replace('VerifyEmail', { email })
        });
      }
    } catch (error) {
      setLocalError({
        title: 'خطأ',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (localError) {
    return (
      <Error
        title={localError.title}
        message={localError.message}
        buttonText="حسناً"
        onPress={() => setLocalError(null)}
      />
    );
  }

  if (error) {
    return (
      <Error
        title="حدث خطأ"
        message={error.message}
        buttonText="حسناً"
        onPress={clearError}
      />
    );
  }

  if (success) {
    return (
      <Success
        title={success.title}
        message={success.message}
        buttonText="حسناً"
        onPress={success.onPress}
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
            <Text style={styles.title}>إنشاء حساب جديد</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={24} color="#f2f2d3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="الاسم الكامل"
                placeholderTextColor="#f2f2d3"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="at" size={24} color="#f2f2d3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="اسم المستخدم"
                placeholderTextColor="#f2f2d3"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={24} color="#f2f2d3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="البريد الإلكتروني"
                placeholderTextColor="#f2f2d3"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={24} color="#f2f2d3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="رقم الهاتف (اختياري)"
                placeholderTextColor="#f2f2d3"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
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

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#f2f2d3" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="تأكيد كلمة المرور"
                placeholderTextColor="#f2f2d3"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#f2f2d3"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>لديك حساب بالفعل؟</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>تسجيل الدخول</Text>
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#f2f2d3',
    fontSize: 16,
    marginRight: 5,
  },
  loginLink: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen; 