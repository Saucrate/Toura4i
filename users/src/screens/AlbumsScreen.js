import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const GRID_WIDTH = width * 0.45;

const AlbumsScreen = ({ navigation, route }) => {
  const { user, token } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artists, setArtists] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const flatListRef = useRef(null);
  const showSaved = route?.params?.showSaved;

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'popular', label: 'الأكثر شعبية' },
    { id: 'recent', label: 'الأحدث' },
    { id: 'oldest', label: 'الأقدم' },
  ];

  const loadAlbums = async () => {
    try {
      setLoading(true);
      let response;
      
      console.log('Loading albums with showSaved:', showSaved);
      
      // Eğer showSaved true ise, sadece kaydedilmiş albümleri getir
      if (showSaved) {
        console.log('Fetching saved albums from /api/albums/saved-albums');
        response = await api.get('/api/albums/saved-albums');
      } else if (route.params?.poetId) {
        // Eğer poetId varsa, şairin albümlerini getir
        console.log('Fetching albums for poet:', route.params.poetId);
        response = await api.get(`/api/albums/poet/${route.params.poetId}`);
      } else {
        // Değilse tüm albümleri getir
        console.log('Fetching all albums from /api/albums');
        response = await api.get('/api/albums');
      }
      
      console.log('Albums API response:', response.data);
      
      // API yanıtından albümleri al
      const albumsData = response.data?.albums || [];
      
      // Her albüm için toplam süreyi hesapla ve isSaved durumunu belirle
      const albumsWithDuration = albumsData.map(album => {
          let totalDuration = 0;
          if (album.tracks && album.tracks.length > 0) {
            totalDuration = album.tracks.reduce((total, track) => total + (track.duration || 0), 0);
          }
          return {
            ...album,
          totalDuration,
            isSaved: user ? user.savedAlbums?.some(id => id.toString() === album._id.toString()) : false,
            poetImage: album.artist?.image || 'https://via.placeholder.com/40'
          };
        });
        
        setAlbums(albumsWithDuration);
        setFilteredAlbums(albumsWithDuration);
    } catch (error) {
      console.error('Error loading albums:', error);
      setError('حدث خطأ أثناء تحميل الألبومات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadArtists = async () => {
    try {
      const response = await api.get('/api/poets');
      console.log('Artists response:', response.data);
      
      if (response.data && response.data.poets) {
        setArtists(response.data.poets);
      } else {
        setArtists([]);
      }
    } catch (err) {
      console.error('Error loading artists:', err);
    }
  };

  useEffect(() => {
    loadAlbums();
    loadArtists();
  }, [showSaved]);

  useEffect(() => {
    filterAlbums();
  }, [searchQuery, selectedFilter, selectedArtist]);

  const filterAlbums = () => {
    let filtered = [...albums];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(album =>
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Artist filter
    if (selectedArtist) {
      filtered = filtered.filter(album => album.artist?._id === selectedArtist);
    }

    // Sort filter
    switch (selectedFilter) {
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
        break;
    }

    setFilteredAlbums(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlbums();
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate('AlbumDetails', { albumId: item._id })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300' }}
        style={styles.gridImage}
      />
      <View style={styles.gridOverlay}>
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gridArtist}>{item.artist?.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AlbumDetails', { albumId: item._id })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.artistInfo}>
          <Image 
            source={{ uri: item.artist?.image || 'https://via.placeholder.com/40' }}
            style={styles.artistImage}
          />
        <Text style={styles.artist}>{item.artist?.name}</Text>
        </View>
        <Text style={styles.releaseDate}>{new Date(item.releaseDate).toLocaleDateString('ar-EG')}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.tracks?.length || 0}</Text>
            <Text style={styles.statLabel}>مقاطع</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatDuration(item.totalDuration || 0)}</Text>
            <Text style={styles.statLabel}>المدة</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f2f2d3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAlbums}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>الألبومات</Text>
          <TouchableOpacity style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#f2f2d3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن ألبوم..."
              placeholderTextColor="#f2f2d3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="filter-list" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.filtersScroll, { marginBottom: 35 }]}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.selectedFilterChip
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter.id && styles.selectedFilterChipText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          ref={flatListRef}
          data={filteredAlbums}
          renderItem={renderListItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد ألبومات متاحة</Text>
            </View>
          }
        />

        <Modal
          visible={showFilters}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>تصفية الألبومات</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <AntDesign name="close" size={24} color="#f2f2d3" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <Text style={styles.filterSectionTitle}>الفنانون</Text>
                {artists.map(artist => (
                  <TouchableOpacity 
                    key={artist._id}
                    style={[
                      styles.artistFilterItem,
                      selectedArtist === artist._id && styles.selectedArtistFilterItem
                    ]}
                    onPress={() => {
                      setSelectedArtist(selectedArtist === artist._id ? null : artist._id);
                    }}
                  >
                    <Text style={[
                      styles.artistFilterText,
                      selectedArtist === artist._id && styles.selectedArtistFilterText
                    ]}>
                      {artist.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => {
                    setShowFilters(false);
                    filterAlbums();
                  }}
                >
                  <Text style={styles.applyButtonText}>تطبيق</Text>
                </TouchableOpacity>
              </View>
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
  menuButton: {
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 16,
    paddingVertical: 10,
  },
  filterButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersScroll: {
    maxHeight: 60,
    marginBottom: 35,
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterChip: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',
  },
  selectedFilterChip: {
    backgroundColor: '#f2f2d3',
  },
  filterChipText: {
    color: '#f2f2d3',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedFilterChipText: {
    color: '#000000',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: 100,
    margin: 15,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  artistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  artistImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 8,
  },
  artist: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
    textAlign: 'right',
  },
  releaseDate: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    textAlign: 'right',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.8,
  },
  gridList: {
    padding: 1,
  },
  gridItem: {
    width: width,
    height: width,
    marginBottom: 2,
    backgroundColor: '#1f1f1f',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  gridTitle: {
    color: '#f2f2d3',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  gridArtist: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'right',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#f2f2d3',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  filterSectionTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  artistFilterItem: {
    padding: 10,
  },
  selectedArtistFilterItem: {
    backgroundColor: '#f2f2d3',
  },
  artistFilterText: {
    color: '#f2f2d3',
    fontSize: 14,
  },
  selectedArtistFilterText: {
    color: '#000000',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  applyButton: {
    backgroundColor: '#f2f2d3',
    padding: 10,
    borderRadius: 5,
  },
  applyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AlbumsScreen; 