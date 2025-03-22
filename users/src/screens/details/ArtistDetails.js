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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAudio } from '../../context/AudioContext';

const { width, height } = Dimensions.get('window');

const ArtistDetails = ({ navigation, route }) => {
  const { artist } = route.params;
  const { playTrack, currentTrack, isPlaying, togglePlayPause, skipForward, skipBackward } = useAudio();
  const [activeTab, setActiveTab] = useState('tracks');

  const handlePlayPress = (track) => {
    const formattedTrack = {
      id: track.id,
      title: track.title,
      artist: artist.name,
      audio: track.audio,
      image: track.image,
      duration: track.duration,
    };

    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(formattedTrack, artist.tracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: artist.name,
        audio: t.audio,
        image: t.image,
        duration: t.duration,
      })));
    }
  };

  const renderTrack = ({ item, index }) => (
    <View key={item.id} style={styles.trackItem}>
      <Image source={item.image} style={styles.trackImage} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <Text style={styles.trackDuration}>{item.duration}</Text>
      </View>
      {currentTrack?.id === item.id ? (
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
            onPress={() => handlePlayPress(item)}
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
          onPress={() => handlePlayPress(item)}
        >
          <Ionicons
            name="play-circle"
            size={40}
            color="#f2f2d3"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAlbum = ({ item, index }) => (
    <TouchableOpacity 
      key={`album-${item.id}-${index}`}
      style={styles.albumCard}
      onPress={() => navigation.navigate('AlbumDetails', { album: item })}
    >
      <Image source={item.cover} style={styles.albumCover} />
      <Text style={styles.albumTitle}>{item.title}</Text>
      <Text style={styles.albumYear}>{item.year}</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <View style={styles.heroSection}>
        <Image source={artist.image} style={styles.artistImage} />
        <LinearGradient
          colors={['transparent', '#000000']}
          style={styles.imageGradient}
        />
        <View style={styles.artistInfo}>
          <Text style={styles.name}>{artist.name}</Text>
          <Text style={styles.description}>{artist.description}</Text>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{artist.tracksCount || '0'}</Text>
              <Text style={styles.statLabel}>مقطع</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{artist.albumsCount || '0'}</Text>
              <Text style={styles.statLabel}>ألبوم</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.tabGradient}>
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'tracks' && styles.activeTab]}
              onPress={() => setActiveTab('tracks')}
            >
              <Text style={styles.tabText}>المقاطع</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'albums' && styles.activeTab]}
              onPress={() => setActiveTab('albums')}
            >
              <Text style={styles.tabText}>الألبومات</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
              onPress={() => setActiveTab('about')}
            >
              <Text style={styles.tabText}>نبذة</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tracks':
        return (
          <FlatList
            data={artist.tracks}
            renderItem={renderTrack}
            keyExtractor={(item, index) => `track-${item.id}-${index}`}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.content}
          />
        );
      case 'albums':
        return (
          <FlatList
            data={artist.albums}
            renderItem={renderAlbum}
            keyExtractor={(item, index) => `album-${item.id}-${index}`}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.content}
          />
        );
      case 'about':
        return (
          <FlatList
            data={[{ id: 'about', content: artist.biography || 'سيتم إضافة السيرة الذاتية قريباً' }]}
            renderItem={({ item }) => (
              <View style={styles.aboutContainer}>
                <Text style={styles.biography}>{item.content}</Text>
              </View>
            )}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.content}
          />
        );
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
          <TouchableOpacity style={styles.shareButton}>
            <MaterialIcons name="share" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        {renderContent()}

        {isPlaying && (
          <View style={styles.miniPlayer}>
            <LinearGradient
              colors={['rgba(0,0,0,0.9)', '#000000']}
              style={styles.miniPlayerGradient}
            >
              <Image source={currentTrack?.image || artist.image} style={styles.miniPlayerImage} />
              <View style={styles.miniPlayerInfo}>
                <Text style={styles.miniPlayerTitle}>
                  {currentTrack?.title || 'Unknown Track'}
                </Text>
                <Text style={styles.miniPlayerArtist}>{artist.name}</Text>
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    height: height * 0.5,
    position: 'relative',
  },
  artistImage: {
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
  artistInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  name: {
    color: '#f2f2d3',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
  },
  description: {
    color: '#f2f2d3',
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'right',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  statItem: {
    marginLeft: 20,
    alignItems: 'center',
  },
  statNumber: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
  },
  tabContainer: {
    backgroundColor: '#000000',
  },
  tabGradient: {
    padding: 10,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 25,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    padding: 5,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(242, 242, 211, 0.2)',
  },
  tabText: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    marginBottom: 10,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackNumber: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.6,
    marginRight: 15,
  },
  trackTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: '600',
  },
  trackDuration: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
  },
  albumsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  albumCard: {
    width: width * 0.43,
    marginBottom: 20,
  },
  albumCover: {
    width: '100%',
    height: width * 0.43,
    borderRadius: 10,
    marginBottom: 10,
  },
  albumTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  albumYear: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
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
  trackImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  aboutContainer: {
    padding: 20,
  },
  biography: {
    color: '#f2f2d3',
    fontSize: 18,
    textAlign: 'right',
  },
});

export default ArtistDetails; 