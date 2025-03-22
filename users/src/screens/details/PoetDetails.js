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

const PoetDetails = ({ navigation, route }) => {
  const { poet } = route.params;
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

  const handlePlayPress = (poem) => {
    console.log('Playing poem:', poem);
    console.log('From poet:', poet.name);

    const track = {
      id: poem.id,
      title: poem.title,
      artist: poet.name,
      audio: poem.audio,
      image: poem.image,
      duration: poem.duration,
    };

    console.log('Track to play:', track);

    const playlist = poet.poems.map(p => ({
      id: p.id,
      title: p.title,
      artist: poet.name,
      audio: p.audio,
      image: p.image,
      duration: p.duration,
    }));

    console.log('Playlist:', playlist);

    if (currentTrack?.id === poem.id) {
      togglePlayPause();
    } else {
      playTrack(track, playlist);
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
          <View style={styles.poetInfo}>
            <Image source={poet.image} style={styles.poetImage} />
            <Text style={styles.poetName}>{poet.name}</Text>
            <Text style={styles.poetBio}>{poet.bio}</Text>
          </View>

          <View style={styles.poemsSection}>
            <Text style={styles.sectionTitle}>القصائد</Text>
            {poet.poems && poet.poems.map((poem) => (
              <View key={poem.id} style={styles.poemItem}>
                <Image source={poem.image} style={styles.poemImage} />
                <View style={styles.poemInfo}>
                  <Text style={styles.poemTitle}>{poem.title}</Text>
                  <Text style={styles.poemDuration}>{poem.duration}</Text>
                </View>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => handlePlayPress(poem)}
                >
                  <Ionicons
                    name={currentTrack?.id === poem.id && isPlaying ? "pause-circle" : "play-circle"}
                    size={40}
                    color="#f2f2d3"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
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
  poetInfo: {
    alignItems: 'center',
    padding: 20,
  },
  poetImage: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    marginBottom: 20,
  },
  poetName: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  poetBio: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
  },
  poemsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'right',
  },
  poemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  poemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  poemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  poemTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: '600',
  },
  poemDuration: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
  },
  playButton: {
    padding: 10,
  },
});

export default PoetDetails; 