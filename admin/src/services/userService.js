import api from './api';

const userService = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error in getUsers:', error.response?.data || error.message);
      throw error;
    }
  },

  // Toggle user block status
  toggleUserBlock: async (userId) => {
    try {
      const response = await api.put(`/users/${userId}/toggle-block`);
      return response.data;
    } catch (error) {
      console.error('Error in toggleUserBlock:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteUser:', error.response?.data || error.message);
      throw error;
    }
  },

  // Send notification to users
  sendNotification: async (userIds, message) => {
    try {
      const response = await api.post('/users/send-notification', {
        userIds,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error in sendNotification:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default userService; 