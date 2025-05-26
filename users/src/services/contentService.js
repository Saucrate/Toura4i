import api from './api';

// المحتوى المميز
export const getFeatured = async () => {
  try {
    console.log('Fetching featured content...');
    const response = await api.get('/api/featured');
    console.log('Featured content response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error loading featured content:', error);
    throw error;
  }
};

// الألبومات
export const getAlbums = async () => {
  try {
    console.log('Fetching albums...');
    const response = await api.get('/api/albums');
    console.log('Albums response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error loading albums:', error);
    throw error;
  }
};

// الشعراء
export const getPoets = async () => {
  try {
    console.log('Fetching poets...');
    const response = await api.get('/api/poets');
    console.log('Poets response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error loading poets:', error);
    throw error;
  }
}; 