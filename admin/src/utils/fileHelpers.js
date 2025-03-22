export const uploadFile = async (file, type) => {
  // Simulate file upload - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return mock URL based on file type
      const url = type === 'photo' ? '/photo1.jpg' : 
                 type === 'video' ? '/video2.mp4' : '/track1.mp3';
      resolve(url);
    }, 1500);
  });
}; 