import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';

const OptionsMenu = ({ isVisible, onClose, track }) => {
  const { playlists, addToPlaylist, toggleFavorite, favorites } = useAudio();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const isFavorite = favorites.some(f => f.id === track.id);

  const handleAddToPlaylist = (playlistId) => {
    addToPlaylist(playlistId, track);
    setShowPlaylists(false);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => toggleFavorite(track)}
          >
            <AntDesign
              name={isFavorite ? "heart" : "hearto"}
              size={24}
              color="#f2f2d3"
            />
            <Text style={styles.optionText}>
              {isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setShowPlaylists(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#f2f2d3" />
            <Text style={styles.optionText}>إضافة إلى قائمة تشغيل</Text>
          </TouchableOpacity>

          {showPlaylists && (
            <View style={styles.playlistsContainer}>
              <FlatList
                data={playlists}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.playlistItem}
                    onPress={() => handleAddToPlaylist(item.id)}
                  >
                    <Text style={styles.playlistName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 211, 0.1)',
  },
  optionText: {
    color: '#f2f2d3',
    fontSize: 16,
    marginLeft: 15,
  },
  playlistsContainer: {
    marginTop: 10,
  },
  playlistItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 211, 0.1)',
  },
  playlistName: {
    color: '#f2f2d3',
    fontSize: 16,
  },
});

export default OptionsMenu; 