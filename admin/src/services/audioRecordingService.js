import api from './api';

const audioRecordingService = {
  getAllRecordings: async (params = {}) => {
    try {
      const response = await api.get('/audio-recordings', { params });
      console.log('Get all recordings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllRecordings:', error.response?.data || error.message);
      throw error;
    }
  },

  getFeaturedRecordings: async () => {
    try {
      const response = await api.get('/audio-recordings/featured');
      return response.data;
    } catch (error) {
      console.error('Error in getFeaturedRecordings:', error.response?.data || error.message);
      throw error;
    }
  },

  getRecordingsByCatalog: async (catalog) => {
    try {
      const response = await api.get(`/audio-recordings/catalog/${catalog}`);
      return response.data;
    } catch (error) {
      console.error('Error in getRecordingsByCatalog:', error.response?.data || error.message);
      throw error;
    }
  },

  getRecordingById: async (id) => {
    try {
      const response = await api.get(`/audio-recordings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getRecordingById:', error.response?.data || error.message);
      throw error;
    }
  },

  createRecording: async (formData) => {
    try {
      console.log('Creating recording with formData:', {
        title: formData.get('title'),
        performer: formData.get('performer'),
        catalog: formData.get('catalog'),
        hasImage: formData.has('image'),
        hasFile: formData.has('file'),
        duration: formData.get('duration')
      });

      const response = await api.post('/audio-recordings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000, // 5 dakika
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });
      console.log('Create recording response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createRecording:', error);
      throw error;
    }
  },

  updateRecording: async (id, formData) => {
    try {
      console.log('Updating recording with formData:', {
        title: formData.get('title'),
        performer: formData.get('performer'),
        catalog: formData.get('catalog'),
        hasImage: formData.has('image'),
        hasFile: formData.has('file')
      });

      const response = await api.put(`/audio-recordings/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000, // 5 minutes
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });
      console.log('Update recording response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updateRecording:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteRecording: async (id) => {
    try {
      const response = await api.delete(`/audio-recordings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteRecording:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default audioRecordingService; 