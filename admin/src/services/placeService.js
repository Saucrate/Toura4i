import api from './api';

const placeService = {
  getAllPlaces: async (filters = {}) => {
    try {
      const response = await api.get('/places', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error in getAllPlaces:', error);
      throw error;
    }
  },

  getPlaceById: async (id) => {
    try {
      const response = await api.get(`/places/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getPlaceById:', error);
      throw error;
    }
  },

  createPlace: async (placeData) => {
    try {
      let formData;
      
      if (placeData instanceof FormData) {
        formData = placeData;
      } else {
        formData = new FormData();
        
        // Log the incoming placeData
        console.log('Incoming placeData:', placeData);
        
        // Append all fields to FormData
        Object.keys(placeData).forEach(key => {
          if (key === 'media' && placeData[key]) {
            console.log('Appending media:', placeData[key]);
            formData.append('media', placeData[key]);
          } else {
            console.log(`Appending ${key}:`, placeData[key]);
            formData.append(key, placeData[key]);
          }
        });
      }

      // Log the FormData contents
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1]);
      }

      const response = await api.post('/places', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in createPlace:', error.response?.data || error);
      throw error;
    }
  },

  updatePlace: async (id, placeData) => {
    try {
      let formData;
      
      if (placeData instanceof FormData) {
        formData = placeData;
      } else {
        formData = new FormData();
        
        // Append all fields to FormData
        Object.keys(placeData).forEach(key => {
          if (key === 'image' && placeData[key]) {
            formData.append('image', placeData[key]);
          } else {
            formData.append(key, placeData[key]);
          }
        });
      }

      const response = await api.put(`/places/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in updatePlace:', error);
      throw error;
    }
  },

  deletePlace: async (id) => {
    try {
      const response = await api.delete(`/places/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deletePlace:', error);
      throw error;
    }
  },

  incrementViews: async (id) => {
    try {
      const response = await api.post(`/places/${id}/views`);
      return response.data;
    } catch (error) {
      console.error('Error in incrementViews:', error);
      throw error;
    }
  }
};

export default placeService; 