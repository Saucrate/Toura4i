import React, { createContext, useState, useContext, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

export const AudioContext = createContext();

const BACKGROUND_AUDIO_TASK = 'BACKGROUND_AUDIO_TASK';

TaskManager.defineTask(BACKGROUND_AUDIO_TASK, async () => {
  try {
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const AudioProvider = ({ children }) => {
  const [sound, setSound] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const createPlaylist = async (name) => {
    const newPlaylist = { id: Date.now().toString(), name, tracks: [] };
    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
  };

  const addToPlaylist = async (playlistId, track) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          tracks: [...playlist.tracks, track]
        };
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
    await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
  };

  const clearCurrentTrack = () => {
    if (sound) {
      sound.unloadAsync();
    }
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  // Update position and duration periodically
  useEffect(() => {
    let interval;
    if (sound && isPlaying) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        console.log('Setting up audio...');
        await Audio.setIsEnabledAsync(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: 1,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false,
        });

        console.log('Audio setup complete');
      } catch (error) {
        console.log('Error setting up audio:', error);
      }
    };

    setupAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playTrack = async (track, tracks = []) => {
    try {
      if (!track || !track.audio) {
        console.log('No track or audio provided:', track);
        Alert.alert('خطأ', 'عذراً، هذا المقطع غير متوفر حالياً');
        return;
      }

      // Unload previous sound if exists
      if (sound) {
        console.log('Unloading previous sound');
        await sound.unloadAsync();
        setSound(null);
      }

      console.log('Loading audio:', track.audio);
      
      // Create and load the new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        track.audio,
        { 
          shouldPlay: true,
          staysActiveInBackground: true,
          isLooping: isRepeat,
          progressUpdateIntervalMillis: 1000,
          positionMillis: 0,
          volume: 1.0,
        },
        onPlaybackStatusUpdate
      );

      console.log('Audio loaded successfully');
      
      setSound(newSound);
      setCurrentTrack(track);
      setIsPlaying(true);
      setPlaylist(tracks);

    } catch (error) {
      console.log('Error playing track:', error);
      Alert.alert(
        'خطأ',
        'عذراً، حدث خطأ أثناء تشغيل المقطع. الرجاء المحاولة مرة أخرى'
      );
      setIsPlaying(false);
      setCurrentTrack(null);
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      
      if (status.didJustFinish) {
        if (isRepeat) {
          sound.replayAsync();
        } else {
          playNext();
        }
      }
    }
  };

  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = async (millis) => {
    if (sound) {
      await sound.setPositionAsync(millis);
    }
  };

  const playNext = async () => {
    if (!playlist || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    let nextIndex;
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    await playTrack(playlist[nextIndex], playlist);
  };

  const playPrevious = async () => {
    if (!playlist || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    let prevIndex;
    
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }
    
    await playTrack(playlist[prevIndex], playlist);
  };

  const toggleRepeat = () => setIsRepeat(!isRepeat);
  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const toggleFavorite = async (track) => {
    let newFavorites;
    if (favorites.find(f => f.id === track.id)) {
      newFavorites = favorites.filter(f => f.id !== track.id);
    } else {
      newFavorites = [...favorites, track];
    }
    setFavorites(newFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const skipForward = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      const newPosition = status.positionMillis + 15000; // 15 seconds forward
      await sound.setPositionAsync(Math.min(newPosition, status.durationMillis));
    }
  };

  const skipBackward = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      const newPosition = status.positionMillis - 15000; // 15 seconds backward
      await sound.setPositionAsync(Math.max(0, newPosition));
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        favorites,
        position,
        duration,
        isRepeat,
        isShuffle,
        playlists,
        playlist,
        playTrack,
        togglePlayPause,
        toggleFavorite,
        seekTo,
        playNext,
        playPrevious,
        toggleRepeat,
        toggleShuffle,
        createPlaylist,
        addToPlaylist,
        clearCurrentTrack,
        skipForward,
        skipBackward,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext); 