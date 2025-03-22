import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useAudio } from '../../context/AudioContext';

const { width, height } = Dimensions.get('window');

const TalatDetails = ({ navigation, route }) => {
  const { talat } = route.params;
  const { playTrack } = useAudio();

  const handlePlayPress = () => {
    if (!talat.hasAudio) return;
    
    const formattedTrack = {
      id: talat.id,
      title: talat.title,
      artist: talat.performer,
      audio: talat.audio,
      image: talat.image,
    };
    playTrack(formattedTrack);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الطلعة</Text>
        </View>

        <ScrollView style={styles.content}>
          <Image source={talat.image} style={styles.image} />
          
          {talat.hasAudio && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPress}
            >
              <Ionicons name="play-circle" size={60} color="#f2f2d3" />
            </TouchableOpacity>
          )}

          <View style={styles.details}>
            <Text style={styles.title}>{talat.title}</Text>
            {talat.performer && (
              <Text style={styles.performer}>{talat.performer}</Text>
            )}
            <Text style={styles.poet}>الشاعر: {talat.poet}</Text>
            <Text style={styles.description}>{talat.description}</Text>
            
            <View style={styles.lyricsContainer}>
              <Text style={styles.lyricsTitle}>الكلمات:</Text>
              <Text style={styles.lyrics}>{talat.lyrics}</Text>
            </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  image: {
    width: width,
    height: height * 0.3,
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: height * 0.3 - 30,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    padding: 20,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  performer: {
    color: '#f2f2d3',
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 5,
    textAlign: 'right',
  },
  poet: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 15,
    textAlign: 'right',
  },
  description: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.6,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'right',
  },
  lyricsContainer: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  lyricsTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  lyrics: {
    color: '#f2f2d3',
    fontSize: 16,
    lineHeight: 26,
    opacity: 0.8,
    textAlign: 'right',
  },
});

export default TalatDetails; 