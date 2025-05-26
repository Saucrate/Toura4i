import api from './api';

const albumService = {
  getAllAlbums: async (params = {}) => {
    try {
      const response = await api.get('/albums', { params });
      console.log('Get all albums response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllAlbums:', error.response?.data || error.message);
      throw error;
    }
  },

  getFeaturedAlbums: async () => {
    try {
      const response = await api.get('/albums/featured');
      return response.data;
    } catch (error) {
      console.error('Error in getFeaturedAlbums:', error.response?.data || error.message);
      throw error;
    }
  },

  getAlbumById: async (id) => {
    try {
      const response = await api.get(`/albums/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getAlbumById:', error.response?.data || error.message);
      throw error;
    }
  },

  createAlbum: async (formData, onUploadProgress) => {
    try {
      console.log('Creating album with formData:', {
        title: formData.get('title'),
        description: formData.get('description'),
        artist: formData.get('artist'),
        hasImage: formData.has('image')
      });

      const response = await api.post('/albums', formData, {
        onUploadProgress,
        timeout: 30 * 60 * 1000 // 30 dakika
      });
      console.log('Create album response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createAlbum:', error.response?.data || error.message);
      throw error;
    }
  },

  updateAlbum: async (id, formData) => {
    try {
      console.log('Updating album with formData:', {
        title: formData.get('title'),
        description: formData.get('description'),
        artist: formData.get('artist'),
        hasImage: formData.has('image')
      });

      const response = await api.put(`/albums/${id}`, formData);
      console.log('Update album response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updateAlbum:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteAlbum: async (id) => {
    try {
      if (!id) {
        throw new Error('Album ID is required');
      }
      const response = await api.delete(`/albums/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteAlbum:', error.response?.data || error.message);
      throw error;
    }
  },

  uploadTrack: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('track', file);
    const response = await api.post('/albums/upload-track', formData, {
      onUploadProgress,
      timeout: 10 * 60 * 1000
    });
    return response.data;
  }
};

export default albumService; 