const loadAudioDetails = async (audioId) => {
  try {
    const response = await api.get(`/api/audio-recordings/${audioId}`);
    console.log('API Response:', response.data); // Debug log
    if (response.data) {
      setCurrentAudio(response.data);
    }
  } catch (err) {
    console.error('Error loading audio details:', err);
  }
}; 