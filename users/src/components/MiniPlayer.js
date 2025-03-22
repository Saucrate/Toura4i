import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';

const { width, height } = Dimensions.get('window');

const ProgressBar = ({ position, duration }) => {
  const progress = duration > 0 ? (position / duration) * 100 : 0;
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill,
            { width: `${progress}%` }
          ]} 
        />
      </View>
      <View style={styles.timeInfo}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const formatTime = (millis) => {
  if (!millis) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const MiniPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause,
    clearCurrentTrack,
    position,
    duration,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
    isRepeat,
    isShuffle
  } = useAudio();
  const [modalVisible, setModalVisible] = useState(false);

  if (!currentTrack) return null;

  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', '#000000']}
          style={styles.gradient}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={clearCurrentTrack}
          >
            <Ionicons name="close-circle" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Image source={currentTrack.image} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.title}>{currentTrack.title}</Text>
            <Text style={styles.artist}>{currentTrack.artist}</Text>
          </View>
          <TouchableOpacity 
            style={styles.playButton}
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
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={['#1a1a1a', '#000000']}
                  style={styles.modalGradient}
                >
                  <View style={styles.modalHeader}>
                    <TouchableOpacity 
                      style={styles.modalCloseButton}
                      onPress={handleClose}
                    >
                      <Ionicons name="chevron-down" size={24} color="#f2f2d3" />
                    </TouchableOpacity>
                  </View>

                  <Image source={currentTrack.image} style={styles.modalImage} />
                  
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalTitle}>{currentTrack.title}</Text>
                    <Text style={styles.modalArtist}>{currentTrack.artist}</Text>
                  </View>

                  <ProgressBar position={position} duration={duration} />

                  <View style={styles.controls}>
                    <TouchableOpacity onPress={toggleShuffle}>
                      <MaterialIcons
                        name="shuffle"
                        size={24}
                        color={isShuffle ? '#f2f2d3' : 'rgba(242, 242, 211, 0.5)'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playPrevious}>
                      <Ionicons name="play-skip-back" size={24} color="#f2f2d3" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalPlayButton}
                      onPress={togglePlayPause}
                    >
                      <Ionicons 
                        name={isPlaying ? "pause-circle" : "play-circle"} 
                        size={60} 
                        color="#f2f2d3" 
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playNext}>
                      <Ionicons name="play-skip-forward" size={24} color="#f2f2d3" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleRepeat}>
                      <MaterialIcons
                        name="repeat"
                        size={24}
                        color={isRepeat ? '#f2f2d3' : 'rgba(242, 242, 211, 0.5)'}
                      />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
  },
  playButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.9,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    marginRight: 5,
  },
  modalCloseButton: {
    padding: 10,
    alignSelf: 'flex-end',
  },
  modalImage: {
    width: width - 80,
    height: width - 80,
    alignSelf: 'center',
    borderRadius: 20,
    marginBottom: 30,
  },
  modalInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  modalTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalArtist: {
    color: '#f2f2d3',
    fontSize: 18,
    opacity: 0.7,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(242, 242, 211, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f2f2d3',
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  modalPlayButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MiniPlayer; 