import api from './api';

const artistService = {
  getAllArtists: async (params = {}) => {
    const response = await api.get('/artists', { params });
    return response.data;
  },

  getFeaturedArtists: async () => {
    const response = await api.get('/artists/featured');
    return response.data;
  },

  getArtistById: async (id) => {
    const response = await api.get(`/artists/${id}`);
    return response.data;
  },

  createArtist: async (artistData) => {
    const formData = new FormData();
    Object.keys(artistData).forEach(key => {
      if (key === 'image' && artistData[key]) {
        formData.append('image', artistData[key]);
      } else {
        formData.append(key, artistData[key]);
      }
    });

    const response = await api.post('/artists', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateArtist: async (id, artistData) => {
    const formData = new FormData();
    Object.keys(artistData).forEach(key => {
      if (key === 'image' && artistData[key]) {
        formData.append('image', artistData[key]);
      } else {
        formData.append(key, artistData[key]);
      }
    });

    const response = await api.put(`/artists/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteArtist: async (id) => {
    const response = await api.delete(`/artists/${id}`);
    return response.data;
  }
};

export default artistService; 