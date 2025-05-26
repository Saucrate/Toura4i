import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Success from '../components/Success';

const VerifyEmailScreen = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [email, setEmail] = useState('');
  const route = useRoute();
  const navigation = useNavigation();
  const { verifyEmail, resendVerification } = useAuth();

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params]);

  const handleVerifyEmail = async () => {
    if (!code) {
      setError('الرجاء إدخال رمز التحقق');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const result = await verifyEmail(code, email);
      
      if (result.success) {
        setSuccess('تم التحقق من بريدك الإلكتروني بنجاح');
        setTimeout(() => {
          navigation.replace('Login');
        }, 2000);
      }
    } catch (error) {
      setError(error.message || 'فشل التحقق من البريد الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const result = await resendVerification(email);
      
      if (result.success) {
        setSuccess('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني');
      }
    } catch (error) {
      setError(error.message || 'فشل إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Success
        title="جاري التحميل"
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
        buttonText="متابعة"
        onPress={() => {
          if (success.includes('تم التحقق')) {
            navigation.replace('Login');
          } else {
            setSuccess(null);
          }
        }}
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
            <Text style={styles.title}>التحقق من البريد الإلكتروني</Text>
            <Text style={styles.subtitle}>
              الرجاء إدخال رمز التحقق المرسل إلى {email}
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
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyEmail}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'جاري التحقق...' : 'تحقق'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendVerification}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>إرسال رمز جديد</Text>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#f2f2d3',
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
  resendButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#f2f2d3',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default VerifyEmailScreen; 