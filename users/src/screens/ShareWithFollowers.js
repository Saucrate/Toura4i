import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const defaultAvatar = require('../../assets/images/png-transparent-default-avatar-thumbnail.png');

const ShareWithFollowers = ({ route, navigation }) => {
  const { contentType, contentId, title, description } = route.params;
  const { user } = useAuth();
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadFollowedUsers();
  }, []);

  const loadFollowedUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/following');
      
      if (response.data && response.data.status === 'success') {
        setFollowedUsers(response.data.data || []);
      } else {
        console.error('Invalid response format:', response.data);
        Alert.alert('خطأ', 'حدث خطأ أثناء تحميل المتابعين');
      }
    } catch (error) {
      console.error('Error loading followed users:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تحميل المتابعين';
      Alert.alert('خطأ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    console.log('Toggling selection for user:', userId);
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('تنبيه', 'الرجاء اختيار مستخدم واحد على الأقل');
      return;
    }

    try {
      setSending(true);
      console.log('Sharing with users:', selectedUsers);
      
      const shareData = {
        recipients: selectedUsers,
        contentType,
        contentId,
        contentTitle: title,
        contentDescription: description,
        content: message.trim() || `${title} - ${description}`
      };
      
      console.log('Share data:', shareData);
      
      const response = await api.post('/api/messages/share', shareData);

      if (response.data && response.data.success) {
        Alert.alert('نجاح', 'تمت المشاركة بنجاح');
        navigation.goBack();
      } else {
        throw new Error(response.data?.message || 'حدث خطأ أثناء المشاركة');
      }
    } catch (error) {
      console.error('Error sharing content:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء المشاركة';
      Alert.alert('خطأ', errorMessage);
    } finally {
      setSending(false);
    }
  };

  const renderContentPreview = () => {
    if (contentType === 'audio-recording') {
      return (
        <View style={styles.contentPreview}>
          <Ionicons name="musical-notes" size={24} color="#f2f2d3" />
          <View style={styles.contentPreviewText}>
            <Text style={styles.contentPreviewTitle}>{title}</Text>
            <Text style={styles.contentPreviewDescription}>{description}</Text>
          </View>
        </View>
      );
    }

    if (contentType === 'book') {
      return (
        <View style={styles.contentPreview}>
          <Ionicons name="book" size={24} color="#f2f2d3" />
          <View style={styles.contentPreviewText}>
            <Text style={styles.contentPreviewTitle}>{title}</Text>
            <Text style={styles.contentPreviewDescription}>{description}</Text>
          </View>
        </View>
      );
    }

    if (contentType === 'place') {
      return (
        <View style={styles.contentPreview}>
          <Ionicons name="location" size={24} color="#f2f2d3" />
          <View style={styles.contentPreviewText}>
            <Text style={styles.contentPreviewTitle}>{title}</Text>
            <Text style={styles.contentPreviewDescription}>{description}</Text>
          </View>
        </View>
      );
    }

    if (contentType === 'video') {
      return (
        <View style={styles.contentPreview}>
          <Ionicons name="videocam" size={24} color="#f2f2d3" />
          <View style={styles.contentPreviewText}>
            <Text style={styles.contentPreviewTitle}>{title}</Text>
            <Text style={styles.contentPreviewDescription}>{description}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.includes(item._id);

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => toggleUserSelection(item._id)}
      >
        <Image
          source={item.photo ? { uri: item.photo } : defaultAvatar}
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={20} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#f2f2d3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مشاركة مع المتابعين</Text>
      </View>

      {renderContentPreview()}

      <TextInput
        style={styles.messageInput}
        placeholder="أضف رسالة (اختياري)..."
        placeholderTextColor="#aaa"
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={500}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#f2f2d3" style={styles.loader} />
      ) : (
        <FlatList
          data={followedUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.userList}
        />
      )}

      <TouchableOpacity
        style={[styles.shareButton, selectedUsers.length === 0 && styles.shareButtonDisabled]}
        onPress={handleShare}
        disabled={selectedUsers.length === 0 || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.shareButtonText}>
            مشاركة مع {selectedUsers.length} مستخدم
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentInfo: {
    padding: 16,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  contentTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentDescription: {
    color: '#aaa',
    fontSize: 14,
  },
  messageInput: {
    backgroundColor: '#1E1E1E',
    color: '#f2f2d3',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  userList: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedUserItem: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userUsername: {
    color: '#aaa',
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f2f2d3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  shareButton: {
    backgroundColor: '#1DB954',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonDisabled: {
    backgroundColor: '#666',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  contentPreviewText: {
    flex: 1,
    marginLeft: 12,
  },
  contentPreviewTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contentPreviewDescription: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default ShareWithFollowers; 