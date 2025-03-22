import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const VideoPlayer = ({ navigation, route }) => {
  const { video } = route.params;
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});

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
          <Text style={styles.headerTitle}>{video.title}</Text>
        </View>

        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={video.videoUrl}
            useNativeControls
            resizeMode="contain"
            isLooping
            onPlaybackStatusUpdate={setStatus}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.title}>{video.title}</Text>
          <Text style={styles.performer}>{video.performer}</Text>
          <Text style={styles.description}>{video.description}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => videoRef.current?.playFromPositionAsync(0)}
          >
            <Ionicons name="reload" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>
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
  videoContainer: {
    width: width,
    height: width * 0.6,
    backgroundColor: '#000',
    marginTop: 20,
  },
  video: {
    width: '100%',
    height: '100%',
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
    marginBottom: 15,
    textAlign: 'right',
  },
  description: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.6,
    lineHeight: 24,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
  controlButton: {
    padding: 10,
  },
});

export default VideoPlayer; 