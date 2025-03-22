import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';

const { width, height } = Dimensions.get('window');

const PlayerScreen = ({ navigation, route }) => {
  const { track, playlist = [] } = route.params;
  const {
    isPlaying,
    playTrack,
    togglePlayPause,
    toggleFavorite,
    favorites,
    currentTrack,
    position,
    duration,
    isRepeat,
    isShuffle,
    seekTo,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle: toggleShuffleAudio,
    playlists,
    addToPlaylist,
  } = useAudio();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  useEffect(() => {
    setIsFavorite(favorites.some(f => f.id === track.id));
  }, [favorites, track]);

  useEffect(() => {
    const loadTrack = async () => {
      setIsLoading(true);
      try {
        await playTrack(track, playlist);
      } catch (error) {
        console.log('Error loading track:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrack();
  }, []);

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value) => {
    seekTo(value);
  };

  const renderOptionsModal = () => (
    <Modal
      visible={showOptions}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowOptions(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowOptions(false)}
      >
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              toggleFavorite(track);
              setShowOptions(false);
            }}
          >
            <AntDesign 
              name={isFavorite ? "heart" : "hearto"} 
              size={24} 
              color="#f2f2d3" 
            />
            <Text style={styles.optionText}>
              {isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              setShowPlaylistModal(true);
              setShowOptions(false);
            }}
          >
            <MaterialIcons name="playlist-add" size={24} color="#f2f2d3" />
            <Text style={styles.optionText}>إضافة إلى قائمة تشغيل</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderPlaylistModal = () => (
    <Modal
      visible={showPlaylistModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPlaylistModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPlaylistModal(false)}
      >
        <View style={styles.playlistsContainer}>
          <Text style={styles.modalTitle}>اختر قائمة التشغيل</Text>
          {playlists.map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              style={styles.playlistItem}
              onPress={() => {
                addToPlaylist(playlist.id, track);
                setShowPlaylistModal(false);
              }}
            >
              <Text style={styles.playlistName}>{playlist.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="down" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => setShowOptions(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <View style={styles.artwork}>
          <Image source={track.image} style={styles.artworkImage} />
        </View>

        <View style={styles.info}>
          <Text style={styles.title}>{track.title || track.name}</Text>
          <Text style={styles.artist}>{track.artist || track.poet}</Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.progressBar}>
            <TouchableOpacity
              style={styles.progressTouch}
              onPress={(event) => {
                const width = event.nativeEvent.locationX;
                const percentage = width / styles.progressBar.width;
                handleSeek(percentage * duration);
              }}
            >
              <View 
                style={[
                  styles.progress, 
                  { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }
                ]} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.timeInfo}>
            <Text style={styles.time}>{formatTime(position)}</Text>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.mainControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleShuffleAudio}
            >
              <Ionicons
                name="shuffle"
                size={24}
                color={isShuffle ? '#f2f2d3' : 'rgba(242, 242, 211, 0.5)'}
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={playPrevious}
            >
              <Ionicons name="play-skip-back" size={24} color="#f2f2d3" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#f2f2d3" size="large" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="#f2f2d3"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={playNext}
            >
              <Ionicons name="play-skip-forward" size={24} color="#f2f2d3" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleRepeat}
            >
              <Ionicons
                name="repeat"
                size={24}
                color={isRepeat ? '#f2f2d3' : 'rgba(242, 242, 211, 0.5)'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {renderOptionsModal()}
        {renderPlaylistModal()}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  artwork: {
    alignItems: 'center',
    marginTop: 40,
  },
  artworkImage: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
  },
  info: {
    alignItems: 'center',
    marginTop: 30,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artist: {
    color: '#f2f2d3',
    fontSize: 18,
    opacity: 0.7,
    marginTop: 5,
  },
  controls: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(242, 242, 211, 0.3)',
    borderRadius: 2,
    width: '100%',
    marginVertical: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#f2f2d3',
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  time: {
    color: '#f2f2d3',
    opacity: 0.7,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTouch: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
  optionsButton: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 211, 0.1)',
  },
  optionText: {
    color: '#f2f2d3',
    fontSize: 16,
    marginRight: 15,
    textAlign: 'right',
  },
  playlistsContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playlistItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 211, 0.1)',
  },
  playlistName: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'right',
  },
});

export default PlayerScreen; 