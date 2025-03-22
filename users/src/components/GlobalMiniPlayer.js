import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const GlobalMiniPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    skipForward, 
    skipBackward,
    playNext,
    playPrevious,
    clearCurrentTrack,
    toggleFavorite,
    favorites,
    playlists,
    addToPlaylist,
    toggleShuffle,
    isShuffle,
    toggleRepeat,
    isRepeat,
    createPlaylist,
  } = useAudio();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = React.useState(false);
  const isFavorite = currentTrack ? favorites.some(f => f.id === currentTrack.id) : false;
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const navigation = useNavigation();

  useEffect(() => {
    let isMounted = true;
    
    const updateProgress = async () => {
      if (currentTrack && currentTrack.sound) {
        try {
          const status = await currentTrack.sound.getStatusAsync();
          if (status.isLoaded && isMounted) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
          }
        } catch (error) {
          console.log('Error updating progress:', error);
        }
      }
    };

    const interval = setInterval(updateProgress, 100);
    updateProgress();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentTrack, isPlaying]);

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = async (value) => {
    if (currentTrack && currentTrack.sound) {
      try {
        await currentTrack.sound.setPositionAsync(Math.floor(value));
        setPosition(value);
        if (isPlaying) {
          await currentTrack.sound.playAsync();
        }
      } catch (error) {
        console.log('Error seeking:', error);
      }
    }
  };

  if (!currentTrack) return null;

  const handlePlaylistButtonPress = () => {
    setModalVisible(false);
    
    navigation.navigate('Playlists', { 
      addTrack: currentTrack,
      onReturn: () => {
        setModalVisible(true);
      }
    });
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.miniPlayer}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', '#000000']}
          style={styles.miniPlayerGradient}
        >
          <TouchableOpacity 
            style={styles.closeButtonMini}
            onPress={clearCurrentTrack}
          >
            <AntDesign name="close" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Image source={currentTrack.image} style={styles.miniPlayerImage} />
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle}>
              {currentTrack.title}
            </Text>
            <Text style={styles.miniPlayerArtist}>{currentTrack.artist}</Text>
          </View>
          <TouchableOpacity 
            style={styles.miniPlayerButton}
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            <Ionicons 
              name={isPlaying ? "pause-circle" : "play-circle"} 
              size={40} 
              color="#f2f2d3" 
            />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1a1a1a', '#000000']}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <AntDesign name="down" size={24} color="#f2f2d3" />
                </TouchableOpacity>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
                    onPress={() => toggleFavorite(currentTrack)}
                  >
                    <AntDesign 
                      name={isFavorite ? "heart" : "hearto"} 
                      size={24} 
                      color="#f2f2d3" 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handlePlaylistButtonPress}
                  >
                    <MaterialIcons name="playlist-add" size={24} color="#f2f2d3" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.artworkContainer}>
                <Image source={currentTrack.image} style={styles.artwork} />
              </View>

              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{currentTrack.title}</Text>
                <Text style={styles.artistName}>{currentTrack.artist}</Text>
              </View>

              <View style={styles.progressContainer}>
                <Slider
                  style={styles.slider}
                  value={position}
                  minimumValue={0}
                  maximumValue={duration}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor="#f2f2d3"
                  maximumTrackTintColor="rgba(242, 242, 211, 0.1)"
                  thumbTintColor="#f2f2d3"
                  step={1}
                />
                <View style={styles.timeInfo}>
                  <Text style={styles.timeText}>{formatTime(position)}</Text>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity onPress={toggleShuffle}>
                  <Ionicons
                    name="shuffle"
                    size={24}
                    color={isShuffle ? "#f2f2d3" : "rgba(242, 242, 211, 0.5)"}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={skipBackward}>
                  <Ionicons name="play-back" size={24} color="#f2f2d3" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
                  <Ionicons
                    name={isPlaying ? "pause-circle" : "play-circle"}
                    size={70}
                    color="#f2f2d3"
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={skipForward}>
                  <Ionicons name="play-forward" size={24} color="#f2f2d3" />
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleRepeat}>
                  <Ionicons
                    name="repeat"
                    size={24}
                    color={isRepeat ? "#f2f2d3" : "rgba(242, 242, 211, 0.5)"}
                  />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      <DropdownNotification 
        visible={showNotification}
        message="تمت إضافة المقطع إلى قائمة التشغيل"
        onHide={() => setShowNotification(false)}
      />
    </>
  );
};

const DropdownNotification = ({ visible, message, onHide }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 2000); // Auto hide after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.notificationContainer}>
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={styles.notificationContent}
      >
        <MaterialIcons name="done" size={24} color="#f2f2d3" />
        <Text style={styles.notificationText}>{message}</Text>
      </LinearGradient>
    </View>
  );
};

const Dropdown = ({ visible, anchor, onClose, children }) => {
  if (!visible) return null;

  return (
    <View style={[styles.dropdownContainer, { top: anchor.y, left: anchor.x }]}>
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={styles.dropdownContent}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  miniPlayerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  miniPlayerImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 15,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: '600',
  },
  miniPlayerArtist: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
  },
  miniPlayerButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(242, 242, 211, 0.2)',
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  artwork: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  trackTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  artistName: {
    color: '#f2f2d3',
    fontSize: 18,
    opacity: 0.7,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  playPauseButton: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    position: 'absolute',
    width: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  dropdownContent: {
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
    borderRadius: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 211, 0.1)',
  },
  dropdownText: {
    color: '#f2f2d3',
    fontSize: 16,
    marginLeft: 10,
  },
  closeButtonMini: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  notificationContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
    elevation: 25,
    gap: 10,
  },
  notificationText: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GlobalMiniPlayer; 