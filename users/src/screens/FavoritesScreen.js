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

const FavoritesScreen = ({ navigation }) => {
  const { favorites, playTrack, currentTrack, isPlaying } = useAudio();

  const renderFavorite = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => navigation.navigate('PlayerScreen', { track: item })}
    >
      <Image source={item.image} style={styles.thumbnail} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title || item.name}</Text>
        <Text style={styles.itemArtist}>{item.artist || item.poet}</Text>
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
          <Text style={styles.headerTitle}>المفضلة</Text>
        </View>

        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد مقاطع في المفضلة</Text>
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
  listContent: {
    padding: 20,
  },
  favoriteItem: {
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
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: '600',
  },
  itemArtist: {
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

export default FavoritesScreen; 