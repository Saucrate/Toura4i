import api from './api';

const playlistService = {
  getAllPlaylists: async (params = {}) => {
    const response = await api.get('/playlists', { params });
    return response.data;
  },

  getPlaylistById: async (id) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  createPlaylist: async (playlistData) => {
    const formData = new FormData();
    Object.keys(playlistData).forEach(key => {
      if (key === 'image' && playlistData[key]) {
        formData.append('image', playlistData[key]);
      } else {
        formData.append(key, playlistData[key]);
      }
    });

    const response = await api.post('/playlists', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePlaylist: async (id, playlistData) => {
    const formData = new FormData();
    Object.keys(playlistData).forEach(key => {
      if (key === 'image' && playlistData[key]) {
        formData.append('image', playlistData[key]);
      } else {
        formData.append(key, playlistData[key]);
      }
    });

    const response = await api.put(`/playlists/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePlaylist: async (id) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },

  addTrack: async (id, trackId) => {
    const response = await api.post(`/playlists/${id}/tracks`, { trackId });
    return response.data;
  },

  removeTrack: async (id, trackId) => {
    const response = await api.delete(`/playlists/${id}/tracks`, { data: { trackId } });
    return response.data;
  }
};

export default playlistService; 