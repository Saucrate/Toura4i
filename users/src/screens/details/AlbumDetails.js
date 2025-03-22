import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useAudio } from '../../context/AudioContext';

const { width, height } = Dimensions.get('window');

const AlbumDetails = ({ navigation, route }) => {
  const { album } = route.params;
  const { playTrack, currentTrack, isPlaying, togglePlayPause, skipForward, skipBackward } = useAudio();

  const handlePlayPress = (track) => {
    const formattedTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      audio: track.audio,
      image: track.image,
      duration: track.duration,
    };

    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(formattedTrack, album.tracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        audio: t.audio,
        image: t.image,
        duration: t.duration,
      })));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.albumInfo}>
            <Image source={album.image} style={styles.albumImage} />
            <Text style={styles.albumTitle}>{album.title}</Text>
            <Text style={styles.albumDescription}>{album.description}</Text>
          </View>

          <View style={styles.tracksSection}>
            <Text style={styles.sectionTitle}>المقطوعات</Text>
            {album.tracks && album.tracks.map((track) => (
              <View key={track.id} style={styles.trackItem}>
                <Image source={track.image} style={styles.trackImage} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackArtist}>{track.artist}</Text>
                  <Text style={styles.trackDuration}>{track.duration}</Text>
                </View>
                {currentTrack?.id === track.id ? (
                  <View style={styles.playControls}>
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={skipBackward}
                    >
                      <Ionicons
                        name="play-back"
                        size={24}
                        color="#f2f2d3"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => handlePlayPress(track)}
                    >
                      <Ionicons
                        name={isPlaying ? "pause-circle" : "play-circle"}
                        size={40}
                        color="#f2f2d3"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={skipForward}
                    >
                      <Ionicons
                        name="play-forward"
                        size={24}
                        color="#f2f2d3"
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => handlePlayPress(track)}
                  >
                    <Ionicons
                      name="play-circle"
                      size={40}
                      color="#f2f2d3"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {isPlaying && (
          <View style={styles.miniPlayer}>
            <LinearGradient
              colors={['rgba(0,0,0,0.9)', '#000000']}
              style={styles.miniPlayerGradient}
            >
              <Image source={currentTrack?.image} style={styles.miniPlayerImage} />
              <View style={styles.miniPlayerInfo}>
                <Text style={styles.miniPlayerTitle}>
                  {currentTrack?.title || 'Unknown Track'}
                </Text>
                <Text style={styles.miniPlayerArtist}>{currentTrack?.artist}</Text>
              </View>
              <View style={styles.miniPlayerControls}>
                <TouchableOpacity 
                  style={styles.miniPlayerButton}
                  onPress={skipBackward}
                >
                  <Ionicons name="play-back" size={24} color="#f2f2d3" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.miniPlayerButton}
                  onPress={togglePlayPause}
                >
                  <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#f2f2d3" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.miniPlayerButton}
                  onPress={skipForward}
                >
                  <Ionicons name="play-forward" size={24} color="#f2f2d3" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
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
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 15,
  },
  albumInfo: {
    alignItems: 'center',
    padding: 20,
  },
  albumImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 20,
    marginBottom: 20,
  },
  albumTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  albumDescription: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  tracksSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'right',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 15,
  },
  trackTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
  },
  trackDuration: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  playControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipButton: {
    padding: 10,
  },
  playButton: {
    padding: 10,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPlayerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AlbumDetails; 