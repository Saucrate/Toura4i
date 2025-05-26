import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const { width } = Dimensions.get('window');

const NotificationDetailsScreen = ({ route, navigation }) => {
  const { notification } = route.params;

  useEffect(() => {
    markAsRead();
  }, []);

  const markAsRead = async () => {
    try {
      await api.put(`/api/users/notifications/${notification._id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الإشعار</Text>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notificationCard}>
            <LinearGradient
              colors={['rgba(242, 242, 211, 0.1)', 'rgba(242, 242, 211, 0.05)']}
              style={styles.cardGradient}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                  <Ionicons 
                    name={notification.type === 'system' ? 'notifications' : 'chatbubble'} 
                    size={24} 
                    color="#f2f2d3" 
                  />
                </View>
                <Text style={styles.notificationDate}>
                  {formatDate(notification.createdAt)}
                </Text>
              </View>

              <Text style={styles.notificationTitle}>
                {notification.title}
              </Text>

              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>

              {notification.data && (
                <View style={styles.additionalData}>
                  {Object.entries(notification.data).map(([key, value]) => (
                    <View key={key} style={styles.dataItem}>
                      <Text style={styles.dataLabel}>{key}:</Text>
                      <Text style={styles.dataValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f2f2d3',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notificationCard: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.1)',
  },
  cardGradient: {
    padding: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDate: {
    color: '#f2f2d3',
    opacity: 0.7,
    fontSize: 14,
  },
  notificationTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  notificationMessage: {
    color: '#f2f2d3',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  additionalData: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(242, 242, 211, 0.1)',
  },
  dataItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dataLabel: {
    color: '#f2f2d3',
    opacity: 0.7,
    fontSize: 14,
    marginRight: 10,
  },
  dataValue: {
    color: '#f2f2d3',
    fontSize: 14,
    flex: 1,
  },
});

export default NotificationDetailsScreen; 