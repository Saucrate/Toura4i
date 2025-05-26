import api from './api';

const poetService = {
  getAllPoets: async (params = {}) => {
    try {
      const response = await api.get('/poets', { params });
      // Ensure we're returning the poets array from the response
      return response.data.poets || response.data;
    } catch (error) {
      console.error('Error fetching poets:', error);
      throw error;
    }
  },

  getFeaturedPoets: async () => {
    const response = await api.get('/poets/featured');
    return response.data;
  },

  getPoetById: async (id) => {
    const response = await api.get(`/poets/${id}`);
    return response.data;
  },

  createPoet: async (formData) => {
    try {
      console.log('Creating poet with formData:', {
        name: formData.get('name'),
        bio: formData.get('bio'),
        period: formData.get('period'),
        location: formData.get('location'),
        website: formData.get('website'),
        awards: formData.get('awards'),
        hasImage: formData.has('image')
      });

      const response = await api.post('/poets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in createPoet:', error.response?.data || error.message);
      throw error;
    }
  },

  updatePoet: async (id, formData) => {
    try {
      console.log('Updating poet with formData:', {
        name: formData.get('name'),
        bio: formData.get('bio'),
        period: formData.get('period'),
        location: formData.get('location'),
        website: formData.get('website'),
        awards: formData.get('awards'),
        hasImage: formData.has('image')
      });

      const response = await api.put(`/poets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in updatePoet:', error.response?.data || error.message);
      throw error;
    }
  },

  deletePoet: async (id) => {
    try {
      if (!id) {
        throw new Error('Poet ID is required');
      }
      const response = await api.delete(`/poets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deletePoet:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default poetService; 