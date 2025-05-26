import api from './api';

const photoService = {
  getAllPhotos: async (filters = {}) => {
    try {
      const response = await api.get('/photos', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error in getAllPhotos:', error);
      throw error;
    }
  },

  getFeaturedPhotos: async () => {
    try {
      const response = await api.get('/photos/featured');
      return response.data;
    } catch (error) {
      console.error('Error in getFeaturedPhotos:', error.response?.data || error.message);
      throw error;
    }
  },

  getPhotoById: async (id) => {
    try {
      const response = await api.get(`/photos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getPhotoById:', error);
      throw error;
    }
  },

  createPhoto: async (photoData) => {
    try {
      let formData;
      
      // If photoData is already a FormData object, use it directly
      if (photoData instanceof FormData) {
        formData = photoData;
      } else {
        // Otherwise create a new FormData and append the data
        formData = new FormData();
        
        // Log the incoming photoData
        console.log('Creating photo with data:', {
          body: photoData,
          files: photoData.images ? Array.from(photoData.images).map(f => ({
            name: f.name,
            type: f.type,
            size: f.size
          })) : null
        });
        
        // Append all fields to FormData
        Object.keys(photoData).forEach(key => {
          if (key === 'images' && photoData[key]) {
            // Handle multiple images
            if (Array.isArray(photoData[key])) {
              photoData[key].forEach((image, index) => {
                if (image instanceof File) {
                  console.log(`Appending image ${index}:`, {
                    name: image.name,
                    type: image.type,
                    size: image.size
                  });
                  formData.append('images', image);
                }
              });
            } else if (photoData[key] instanceof File) {
              console.log('Appending single image file:', {
                name: photoData[key].name,
                type: photoData[key].type,
                size: photoData[key].size
              });
              formData.append('images', photoData[key]);
            }
          } else if (key === 'tags' && photoData[key]) {
            console.log('Appending tags:', photoData[key]);
            formData.append('tags', JSON.stringify(photoData[key]));
          } else if (photoData[key] !== undefined && photoData[key] !== null) {
            console.log(`Appending ${key}:`, photoData[key]);
            formData.append(key, photoData[key]);
          }
        });
      }

      // Log the FormData contents
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], {
            name: pair[1].name,
            type: pair[1].type,
            size: pair[1].size
          });
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      // Send request without Content-Type header (let browser set it)
      const response = await api.post('/photos', formData, {
        headers: {
          // Remove Content-Type header to let browser set it with boundary
          'Accept': 'application/json'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept all status codes less than 500
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      if (response.status >= 400) {
        console.error('Server error response:', response.data);
        throw new Error(response.data.message || 'Error creating photo');
      }

      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createPhoto:', error.response?.data || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  updatePhoto: async (id, photoData) => {
    try {
      let formData;
      
      // If photoData is already a FormData object, use it directly
      if (photoData instanceof FormData) {
        formData = photoData;
      } else {
        // Otherwise create a new FormData and append the data
        formData = new FormData();
        
        // Log the incoming photoData
        console.log('Updating photo with data:', photoData);
        
        // Append all fields to FormData
        Object.keys(photoData).forEach(key => {
          if (key === 'images' && photoData[key]) {
            // Handle multiple images
            if (Array.isArray(photoData[key])) {
              photoData[key].forEach((image, index) => {
                console.log(`Appending image ${index}:`, image);
                if (image instanceof File) {
                  formData.append('images', image);
                } else if (image.file) {
                  formData.append('images', image.file);
                }
              });
            } else if (photoData[key] instanceof File) {
              console.log('Appending single image file:', photoData[key]);
              formData.append('images', photoData[key]);
            } else if (photoData[key].file) {
              console.log('Appending single image from object:', photoData[key]);
              formData.append('images', photoData[key].file);
            }
          } else if (key === 'tags' && photoData[key]) {
            console.log('Appending tags:', photoData[key]);
            formData.append('tags', JSON.stringify(photoData[key]));
          } else if (key === 'deleteImages' && photoData[key]) {
            console.log('Appending images to delete:', photoData[key]);
            formData.append('deleteImages', JSON.stringify(photoData[key]));
          } else if (key === 'imageOrder' && photoData[key]) {
            console.log('Appending image order:', photoData[key]);
            formData.append('imageOrder', JSON.stringify(photoData[key]));
          } else if (key === 'replaceAllImages') {
            console.log('Appending replaceAllImages flag:', photoData[key]);
            formData.append('replaceAllImages', photoData[key]);
          } else if (photoData[key] !== undefined && photoData[key] !== null) {
            console.log(`Appending ${key}:`, photoData[key]);
            formData.append(key, photoData[key]);
          }
        });
      }

      // Log the FormData contents
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await api.put(`/photos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept all status codes less than 500
        }
      });

      if (response.status >= 400) {
        console.error('Server error response:', response.data);
        throw new Error(response.data.message || 'Error updating photo');
      }

      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updatePhoto:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  deletePhoto: async (id) => {
    try {
      if (!id) {
        throw new Error('Photo ID is required');
      }
      const response = await api.delete(`/photos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deletePhoto:', error.response?.data || error.message);
      throw error;
    }
  },

  toggleLike: async (id) => {
    try {
      const response = await api.post(`/photos/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('Error in toggleLike:', error);
      throw error;
    }
  }
};

export default photoService;