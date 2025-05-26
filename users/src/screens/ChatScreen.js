import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const defaultAvatar = require('../../assets/images/png-transparent-default-avatar-thumbnail.png');

const ChatScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ChatDetail', { userId: item.user._id, userName: item.user.name, userAvatar: item.user.avatar })}
      activeOpacity={0.8}
    >
      <Image
        source={item.user.avatar ? { uri: item.user.avatar } : defaultAvatar}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{item.user.name}</Text>
          <Text style={styles.time}>{item.lastMessage ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage || 'لا توجد رسائل بعد'}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#232526', '#414345']} style={styles.container}>
      <Text style={styles.header}>الرسائل</Text>
      {loading ? (
        <ActivityIndicator color="#f2f2d3" />
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={60} color="#aaa" style={{ marginBottom: 10 }} />
          <Text style={styles.emptyText}>لا توجد محادثات بعد</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.user._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    color: '#f2f2d3',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242,242,211,0.08)',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#f2f2d3',
    backgroundColor: '#222',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  time: {
    color: '#aaa',
    fontSize: 13,
    marginLeft: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    color: '#f2f2d3',
    opacity: 0.8,
    fontSize: 15,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    minWidth: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 10,
    shadowColor: '#ff3b30',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChatScreen; 