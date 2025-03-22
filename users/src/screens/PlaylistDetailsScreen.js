import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';

const PlaylistDetailsScreen = ({ navigation, route }) => {
  const { playlist } = route.params;
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const renderTrack = ({ item }) => (
    <TouchableOpacity
      style={styles.trackItem}
      
    >
      <Image source={item.image} style={styles.thumbnail} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title || item.name}</Text>
        <Text style={styles.trackArtist}>{item.artist || item.poet}</Text>
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => playTrack(item)}
      >
        <Ionicons
          name={currentTrack?.id === item.id && isPlaying ? 'pause' : 'play'}
          size={24}
          color="#f2f2d3"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>{playlist.name}</Text>
        </View>

        <View style={styles.playlistInfo}>
          <Text style={styles.trackCount}>
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'مقطع' : 'مقاطع'}
          </Text>
          <TouchableOpacity
            style={styles.playAllButton}
            onPress={() => {
              if (playlist.tracks.length > 0) {
                playTrack(playlist.tracks[0]);
              }
            }}
          >
            <Text style={styles.playAllText}>تشغيل الكل</Text>
            <Ionicons name="play-circle" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={playlist.tracks}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد مقاطع في هذه القائمة</Text>
            </View>
          )}
        />
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
  headerTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playlistInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  trackCount: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.7,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playAllText: {
    color: '#f2f2d3',
    marginRight: 10,
  },
  listContent: {
    padding: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
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
    opacity: 0.7,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.7,
  },
});

export default PlaylistDetailsScreen; 