import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const menuItems = [
    {
      id: '1',
      title: 'قوائم التشغيل',
      icon: 'playlist-play',
      iconFamily: 'MaterialIcons',
      onPress: () => navigation.navigate('Playlists'),
    },
    {
      id: '2',
      title: 'الإعدادات',
      icon: 'settings',
      iconFamily: 'Ionicons',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: '3',
      title: 'تسجيل الخروج',
      icon: 'log-out',
      iconFamily: 'Ionicons',
      onPress: () => setShowLogoutAlert(true),
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#f2f2d3" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>الملف الشخصي</Text>
          </View>

          <View style={styles.profileSection}>
            <Image 
              source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }} 
              style={styles.profileImage} 
            />
            <Text style={styles.userName}>{user?.name || 'زائر'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>

          <View style={styles.menuSection}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  {item.iconFamily === 'Ionicons' ? (
                    <Ionicons name={item.icon} size={24} color="#f2f2d3" />
                  ) : (
                    <MaterialIcons name={item.icon} size={24} color="#f2f2d3" />
                  )}
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#f2f2d3" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <CustomAlert
          visible={showLogoutAlert}
          title="تسجيل الخروج"
          message="هل أنت متأكد من تسجيل الخروج؟"
          confirmText="تسجيل الخروج"
          cancelText="إلغاء"
          type="warning"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutAlert(false)}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#f2f2d3',
    marginBottom: 15,
  },
  userName: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.7,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 211, 0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: '#f2f2d3',
    fontSize: 18,
    marginRight: 15,
  },
});

export default ProfileScreen; 