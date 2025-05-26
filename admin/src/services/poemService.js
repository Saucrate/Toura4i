import api from './api';

const poemService = {
  // Get all poems
  getAllPoems: async () => {
    try {
      const response = await api.get('/poems');
      console.log('Get all poems response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error in getAllPoems:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a single poem by ID
  getPoemById: async (id) => {
    try {
      const response = await api.get(`/poems/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getPoemById:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create a new poem
  createPoem: async (formData) => {
    try {
      console.log('Creating poem with formData:', {
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
        poet: formData.get('poet'),
        hasImage: formData.has('image'),
        hasAudio: formData.has('audio')
      });

      // FormData içeriğini kontrol et
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1]);
      }

      const response = await api.post('/poems', formData, {
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Create poem response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createPoem:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update a poem
  updatePoem: async (id, formData) => {
    try {
      console.log('Updating poem with formData:', {
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
        poet: formData.get('poet'),
        hasImage: formData.has('image'),
        hasAudio: formData.has('audio')
      });

      const response = await api.put(`/poems/${id}`, formData);
      console.log('Update poem response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updatePoem:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a poem
  deletePoem: async (id) => {
    try {
      if (!id) {
        throw new Error('Poem ID is required');
      }
      const response = await api.delete(`/poems/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deletePoem:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get poems by category
  getPoemsByCategory: async (category) => {
    try {
      const response = await api.get(`/poems/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error in getPoemsByCategory:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get poems by poet
  getPoemsByPoet: async (poetId) => {
    try {
      const response = await api.get(`/poems/poet/${poetId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getPoemsByPoet:', error.response?.data || error.message);
      throw error;
    }
  },

  // Search poems
  searchPoems: async (query) => {
    try {
      const response = await api.get(`/poems/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error in searchPoems:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get featured poems
  getFeaturedPoems: async () => {
    try {
      const response = await api.get('/poems/featured');
      return response.data;
    } catch (error) {
      console.error('Error in getFeaturedPoems:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update poem views
  updatePoemViews: async (id) => {
    try {
      const response = await api.put(`/poems/${id}/views`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Like/Unlike poem
  togglePoemLike: async (id) => {
    try {
      const response = await api.put(`/poems/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default poemService;
