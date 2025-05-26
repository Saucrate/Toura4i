import { Share, Clipboard, Alert } from 'react-native';
import api from '../services/api';

export const shareWithFollowers = async (contentType, contentId, title, description) => {
  try {
    const response = await api.post('/api/messages/share', {
      contentType,
      contentId,
      title,
      description
    });

    if (response.data.success) {
      Alert.alert('تم', 'تم المشاركة بنجاح مع المتابعين');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sharing with followers:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء المشاركة مع المتابعين');
    return false;
  }
};

export const shareExternally = async (contentType, contentId, title, description) => {
  try {
    // Generate shareable link
    const shareableLink = `https://toura4i.com/${contentType}/${contentId}`;
    
    // Share options
    const shareOptions = {
      message: `${title}\n\n${description}\n\n${shareableLink}`,
      title: title
    };

    // Show share dialog
    const result = await Share.share(shareOptions);

    if (result.action === Share.sharedAction) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sharing externally:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء المشاركة');
    return false;
  }
};

export const copyShareLink = async (contentType, contentId) => {
  try {
    const shareableLink = `https://toura4i.com/${contentType}/${contentId}`;
    await Clipboard.setString(shareableLink);
    Alert.alert('تم', 'تم نسخ الرابط بنجاح');
    return true;
  } catch (error) {
    console.error('Error copying link:', error);
    Alert.alert('خطأ', 'حدث خطأ أثناء نسخ الرابط');
    return false;
  }
}; 