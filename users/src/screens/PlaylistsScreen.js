import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';

const { width, height } = Dimensions.get('window');

const PlaylistsScreen = ({ navigation, route }) => {
  const { playlists, createPlaylist, addToPlaylist } = useAudio();
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { addTrack, onReturn } = route.params || {};

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setModalVisible(false);
    } else {
      Alert.alert('تنبيه', 'الرجاء إدخال اسم للقائمة');
    }
  };

  const handlePlaylistSelect = (playlist) => {
    if (addTrack) {
      addToPlaylist(playlist.id, addTrack);
      Alert.alert('تم', 'تمت إضافة المقطع إلى قائمة التشغيل');
      navigation.goBack();
      onReturn?.();
    } else {
      navigation.navigate('PlaylistDetails', { playlist });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
              onReturn?.();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {addTrack ? 'اختر قائمة التشغيل' : 'قوائم التشغيل'}
          </Text>
          {!addTrack && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#f2f2d3" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content}>
          {playlists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="queue-music" size={80} color="#f2f2d3" />
              <Text style={styles.emptyText}>لا توجد قوائم تشغيل</Text>
              <TouchableOpacity 
                style={styles.createFirstButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.createFirstButtonText}>إنشاء قائمة جديدة</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.playlistsGrid}>
              {playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistCard}
                  onPress={() => handlePlaylistSelect(playlist)}
                >
                  <LinearGradient
                    colors={['#1a1a1a', '#000000']}
                    style={styles.playlistGradient}
                  >
                    <View style={styles.playlistIcon}>
                      <MaterialIcons name="queue-music" size={32} color="#f2f2d3" />
                    </View>
                    <Text style={styles.playlistName}>{playlist.name}</Text>
                    <Text style={styles.trackCount}>
                      {playlist.tracks.length} {playlist.tracks.length === 1 ? 'مقطع' : 'مقاطع'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={['#1a1a1a', '#000000']}
            style={styles.fabGradient}
          >
            <MaterialIcons name="playlist-add" size={30} color="#f2f2d3" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Create Playlist Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={styles.modalContent}
              >
                <Text style={styles.modalTitle}>إنشاء قائمة تشغيل جديدة</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="اسم القائمة"
                  placeholderTextColor="rgba(242, 242, 211, 0.5)"
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  autoFocus={true}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setModalVisible(false);
                      setNewPlaylistName('');
                    }}
                  >
                    <Text style={styles.buttonText}>إلغاء</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.createButton]}
                    onPress={async () => {
                      await handleCreatePlaylist();
                      if (addTrack) {
                        // If we're adding a track, add it to the new playlist
                        const newPlaylist = playlists[playlists.length - 1];
                        handlePlaylistSelect(newPlaylist);
                      }
                    }}
                  >
                    <Text style={styles.buttonText}>إنشاء</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f2f2d3',
  },
  backButton: {
    padding: 10,
  },
  addButton: {
    padding: 10,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.2,
  },
  emptyText: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.7,
    marginTop: 10,
  },
  playlistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
  },
  playlistCard: {
    width: width * 0.44,
    height: 160,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  playlistGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  playlistIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistName: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  trackCount: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#f2f2d3',
    marginBottom: 20,
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
  },
  createButton: {
    backgroundColor: '#f2f2d3',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  createFirstButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  createFirstButtonText: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  successAlertText: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default PlaylistsScreen; 