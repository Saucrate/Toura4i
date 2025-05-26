import api from './api';

const handleTokenExpired = async (error) => {
  if (error.response?.status === 401 && error.response?.data?.error === 'Token expired') {
    // Token süresi dolmuş, kullanıcıyı login sayfasına yönlendir
    window.location.href = '/login';
    return Promise.reject(error);
  }
  return Promise.reject(error);
};

const bookService = {
  getAllBooks: async (filters = {}) => {
    try {
      const response = await api.get('/books', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error in getAllBooks:', error);
      return handleTokenExpired(error);
    }
  },

  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getBookById:', error);
      return handleTokenExpired(error);
    }
  },

  createBook: async (bookData) => {
    try {
      let formData;
      
      if (bookData instanceof FormData) {
        formData = bookData;
      } else {
        formData = new FormData();
        
        // Log the incoming bookData
        console.log('Incoming bookData:', bookData);
        
        // Append all fields to FormData
        Object.keys(bookData).forEach(key => {
          if (key === 'cover' && bookData[key]) {
            console.log('Appending cover:', bookData[key]);
            formData.append('cover', bookData[key], bookData[key].name);
          } else {
            console.log(`Appending ${key}:`, bookData[key]);
            formData.append(key, bookData[key]);
          }
        });
      }

      // Log the FormData contents
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1]);
      }

      const response = await api.post('/books', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in createBook:', error);
      return handleTokenExpired(error);
    }
  },

  updateBook: async (id, bookData) => {
    try {
      let formData;
      
      if (bookData instanceof FormData) {
        formData = bookData;
      } else {
        formData = new FormData();
        
        // Append all fields to FormData
        Object.keys(bookData).forEach(key => {
          if (key === 'cover' && bookData[key]) {
            formData.append('cover', bookData[key]);
          } else {
            formData.append(key, bookData[key]);
          }
        });
      }

      const response = await api.put(`/books/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateBook:', error);
      return handleTokenExpired(error);
    }
  },

  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteBook:', error);
      return handleTokenExpired(error);
    }
  },

  incrementViews: async (id) => {
    try {
      const response = await api.post(`/books/${id}/views`);
      return response.data;
    } catch (error) {
      console.error('Error in incrementViews:', error);
      return handleTokenExpired(error);
    }
  }
};

export default bookService; 