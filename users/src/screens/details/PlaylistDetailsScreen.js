import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAudio } from '../../context/AudioContext';

const { width } = Dimensions.get('window');

const PlaylistDetailsScreen = ({ route }) => {
  const { playlist } = route.params;
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();
  
  // Add these states for image viewer
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Format images for the viewer
  const images = playlist.tracks.map(track => ({
    url: Image.resolveAssetSource(track.image).uri
  }));

  const renderTrackItem = ({ item, index }) => {
    const isCurrentTrack = currentTrack && currentTrack.id === item.id;

    const handlePlayPress = () => {
      if (isCurrentTrack) {
        togglePlayPause();
      } else {
        playTrack(item);
      }
    };

    return (
      <TouchableOpacity 
        style={styles.trackItem}
        onPress={handlePlayPress}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          onPress={() => {
            setCurrentImageIndex(index);
            setImageViewerVisible(true);
          }}
        >
          <Image source={item.image} style={styles.trackImage} />
        </TouchableOpacity>
        
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{item.title}</Text>
          <Text style={styles.trackArtist}>{item.artist}</Text>
        </View>

        <View style={styles.playButton}>
          <Ionicons 
            name={isCurrentTrack && isPlaying ? "pause-circle" : "play-circle"} 
            size={40} 
            color="#f2f2d3" 
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.playlistName}>{playlist.name}</Text>
          <Text style={styles.trackCount}>
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'مقطع' : 'مقاطع'}
          </Text>
        </View>

        <FlatList
          data={playlist.tracks}
          keyExtractor={(item, index) => `track-${item.id}-${index}`}
          renderItem={renderTrackItem}
          contentContainerStyle={styles.listContent}
        />

        <Modal visible={imageViewerVisible} transparent={true}>
          <ImageViewer
            imageUrls={images}
            index={currentImageIndex}
            onSwipeDown={() => setImageViewerVisible(false)}
            enableSwipeDown={true}
            onCancel={() => setImageViewerVisible(false)}
            enableImageZoom={true}
            backgroundColor="rgba(0,0,0,0.95)"
          />
        </Modal>
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
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  playlistName: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  trackCount: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'right',
  },
  listContent: {
    padding: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    borderRadius: 10,
    padding: 15,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginHorizontal: 15,
  },
  trackTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'right',
  },
  trackArtist: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'right',
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlaylistDetailsScreen; 