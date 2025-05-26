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
import api from '../services/api';

const { width, height } = Dimensions.get('window');

const categories = [
  {
    id: 'historical',
    title: 'الأماكن التاريخية',
    icon: 'location',
    iconFamily: 'Ionicons',
    screen: 'HistoricalPlaces',
  },
  {
    id: '2',
    title: 'القصائد',
    icon: 'book',
    iconFamily: 'Ionicons',
    screen: 'Poems',
  },
  {
    id: '3',
    title: 'الألبومات',
    icon: 'albums',
    iconFamily: 'Ionicons',
    screen: 'Albums',
  },
  {
    id: '4',
    title: 'الصور',
    icon: 'images',
    iconFamily: 'Ionicons',
    screen: 'Photos',
  },
  {
    id: '5',
    title: 'الفيديوهات',
    icon: 'videocam',
    iconFamily: 'Ionicons',
    screen: 'Videos',
  },
  {
    id: '6',
    title: 'التسجيلات الصوتية',
    icon: 'musical-notes',
    iconFamily: 'Ionicons',
    screen: 'AudioRecordings',
  },
];

const renderIcon = (iconName, family) => {
  switch (family) {
    case 'Ionicons':
      return <Ionicons name={iconName} size={32} color="#f2f2d3" />;
    case 'MaterialIcons':
      return <MaterialIcons name={iconName} size={32} color="#f2f2d3" />;
    default:
      return null;
  }
};

const PlaylistsScreen = ({ navigation, route }) => {
  const { playlists, createPlaylist, addToPlaylist } = useAudio();
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { addTrack, onReturn } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleCategoryPress = (category) => {
    if (category.id === 'historical') {
      navigation.navigate('HistoricalPlaces', { showSaved: true });
    } else if (category.id === '2') {
      navigation.navigate('Poems', { showSaved: true });
    } else if (category.id === '3') {
      navigation.navigate('Albums', { showSaved: true });
    } else if (category.id === '4') {
      navigation.navigate('Photos', { showSaved: true });
    } else if (category.id === '5') {
      navigation.navigate('Videos', { showSaved: true });
    } else if (category.id === '6') {
      navigation.navigate('AudioRecordings', { showSaved: true });
    } else {
      navigation.navigate(category.screen);
    }
  };

  const loadPlaylists = async () => {
    try {
      setError(null);
      const response = await api.get('/api/playlists');
      console.log('API Response:', response.data); // Debug log
      if (response.data && response.data.playlists) {
        // Sadece kayıtlı albümleri filtrele
        const savedPlaylists = response.data.playlists.filter(playlist => 
          playlist.isSaved || (user && user.savedPlaylists && user.savedPlaylists.includes(playlist._id))
        );
        setPlaylists(savedPlaylists);
      } else {
        setPlaylists([]);
      }
    } catch (err) {
      console.error('Error loading playlists:', err);
      setError('حدث خطأ أثناء تحميل قوائم التشغيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
        </View>

        <ScrollView style={styles.content}>
          {playlists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>اختر تصنيفًا للبدء</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() => handleCategoryPress(category)}
                  >
                    {renderIcon(category.icon, category.iconFamily)}
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  categoryCard: {
    width: width * 0.43,
    height: 110,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  categoryTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
});

export default PlaylistsScreen; 