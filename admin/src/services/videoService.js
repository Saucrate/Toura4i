import api from './api';

const videoService = {
  // Get all videos with optional filtering
  getAllVideos: async (filters = {}) => {
    try {
      const response = await api.get('/videos', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  // Get featured videos
  getFeaturedVideos: async () => {
    try {
      const response = await api.get('/videos/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured videos:', error);
      throw error;
    }
  },

  // Get a single video by ID
  getVideoById: async (id) => {
    try {
      if (!id) {
        throw new Error('Video ID is required');
      }
      const response = await api.get(`/videos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  // Create a new video
  createVideo: async (videoData) => {
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('title', videoData.title);
      formData.append('description', videoData.description);
      formData.append('category', videoData.category);
      formData.append('date', videoData.date);
      formData.append('isFeatured', videoData.isFeatured);
      
      // Append tags if they exist
      if (videoData.tags) {
        formData.append('tags', videoData.tags);
      }

      // Append person if selected
      if (videoData.person) {
        formData.append('person', videoData.person);
      }

      // Append files
      if (videoData.video) {
        formData.append('video', videoData.video);
      }
      if (videoData.thumbnail) {
        formData.append('thumbnail', videoData.thumbnail);
      }

      const response = await api.post('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },

  // Update a video
  updateVideo: async (id, videoData) => {
    try {
      const formData = new FormData();
      
      // Append all fields from videoData
      Object.keys(videoData).forEach(key => {
        if (key === 'tags') {
          formData.append(key, videoData[key]);
        } else if (key === 'person') {
          formData.append(key, videoData[key] || '');
        } else if (key !== 'video' && key !== 'thumbnail') {
          formData.append(key, videoData[key]);
        }
      });

      // Append files if they exist
      if (videoData.video) {
        formData.append('video', videoData.video);
      }
      if (videoData.thumbnail) {
        formData.append('thumbnail', videoData.thumbnail);
      }

      const response = await api.put(`/videos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },

  // Delete a video
  deleteVideo: async (id) => {
    try {
      const response = await api.delete(`/videos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  // Toggle like on a video
  toggleLike: async (id) => {
    try {
      const response = await api.post(`/videos/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }
};

export default videoService; 