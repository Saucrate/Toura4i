import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAudio } from '../../context/AudioContext';

const { width, height } = Dimensions.get('window');

const PoemDetails = ({ navigation, route }) => {
  const { poem } = route.params;
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();
  const [isFavorite, setIsFavorite] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const handlePlayPress = () => {
    const track = {
      id: poem.id,
      title: poem.title,
      artist: poem.poet,
      duration: poem.duration || '0:00',
      audio: poem.audio,
      image: poem.image,
      artwork: poem.image,
    };

    if (currentTrack?.id === poem.id) {
      togglePlayPause();
    } else {
      playTrack(track, [track]); // Pass as single-track playlist
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
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <AntDesign 
                name={isFavorite ? "heart" : "hearto"} 
                size={24} 
                color="#f2f2d3" 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="share" size={24} color="#f2f2d3" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Image source={poem.image} style={styles.poemImage} />
            <LinearGradient
              colors={['transparent', '#000000']}
              style={styles.imageGradient}
            />
            <View style={styles.poemInfo}>
              <Text style={styles.title}>{poem.title}</Text>
              <Text style={styles.poet}>{poem.poet}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.audioPlayer}>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlayPress}
              >
                <Ionicons 
                  name={currentTrack?.id === poem.id && isPlaying ? "pause-circle" : "play-circle"} 
                  size={64} 
                  color="#f2f2d3" 
                />
              </TouchableOpacity>
              <Text style={styles.audioText}>
                استمع إلى القصيدة بصوت الشاعر
              </Text>
            </View>

            <View style={styles.textControls}>
              <TouchableOpacity 
                style={styles.fontButton}
                onPress={() => setFontSize(prev => Math.min(prev + 2, 24))}
              >
                <FontAwesome5 name="plus" size={16} color="#f2f2d3" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.fontButton}
                onPress={() => setFontSize(prev => Math.max(prev - 2, 14))}
              >
                <FontAwesome5 name="minus" size={16} color="#f2f2d3" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.poemText, { fontSize }]}>
              {poem.text || 'سيتم إضافة نص القصيدة قريباً'}
            </Text>

            {poem.explanation && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>شرح القصيدة</Text>
                <Text style={styles.explanationText}>
                  {poem.explanation}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {isPlaying && (
          <View style={styles.miniPlayer}>
            <LinearGradient
              colors={['rgba(0,0,0,0.9)', '#000000']}
              style={styles.miniPlayerGradient}
            >
              <View style={styles.miniPlayerInfo}>
                <Text style={styles.miniPlayerTitle}>{poem.title}</Text>
                <Text style={styles.miniPlayerPoet}>{poem.poet}</Text>
              </View>
              <TouchableOpacity 
                style={styles.miniPlayerButton}
                onPress={() => togglePlayPause()}
              >
                <Ionicons name="pause" size={24} color="#f2f2d3" />
              </TouchableOpacity>
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
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  heroSection: {
    height: height * 0.4,
    position: 'relative',
  },
  poemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  poemInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
  },
  poet: {
    color: '#f2f2d3',
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'right',
  },
  content: {
    padding: 20,
  },
  audioPlayer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  playButton: {
    marginBottom: 10,
  },
  audioText: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
  },
  textControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  fontButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  poemText: {
    color: '#f2f2d3',
    lineHeight: 36,
    textAlign: 'right',
    marginBottom: 30,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 15,
  },
  explanationText: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 24,
    textAlign: 'right',
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
  miniPlayerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  miniPlayerTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: '600',
  },
  miniPlayerPoet: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
  },
  miniPlayerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
});

export default PoemDetails; 