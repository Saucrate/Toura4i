import api from './api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (apiCall, retries = MAX_RETRIES) => {
  try {
    return await apiCall();
  } catch (error) {
    if (retries > 0 && error.response?.status === 500) {
      console.warn(`Retrying API call... ${retries} attempts remaining`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(apiCall, retries - 1);
    }
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await fetchWithRetry(() => api.get('/dashboard/stats'));
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default stats object instead of throwing
    return {
      stats: {
        users: 0,
        poems: 0,
        poets: 0,
        albums: 0,
        audioRecordings: 0,
        photos: 0,
        videos: 0,
        books: 0,
        places: 0,
        totalViews: 0,
        totalLikes: 0
      }
    };
  }
};

export const getRecentActivity = async () => {
  try {
    const response = await fetchWithRetry(() => api.get('/dashboard/recent-activity'));
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    // Return empty activities array instead of throwing
    return { activities: [] };
  }
}; 