import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import { Video } from 'expo-av';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Video categories based on the Video model
const CATEGORIES = [
  { id: 'all', name: 'الكل' },
  { id: 'manuscripts', name: 'مخطوطة' },
  { id: 'instruments', name: 'الآلات الموسيقية القديمة' },
  { id: 'historical', name: 'الآثار التاريخية' },
  { id: 'mosques', name: 'المساجد' },
  { id: 'architecture', name: 'العمارة' },
  { id: 'artifacts', name: 'القطع الأثرية' },
  { id: 'calligraphy', name: 'الخط العربي' },
  { id: 'cultural', name: 'التراث الثقافي' },
  { id: 'events', name: 'المناسبات' },
  { id: 'people', name: 'الشخصيات' },
  { id: 'landmarks', name: 'المعالم' },
  { id: 'traditions', name: 'التقاليد' },
  { id: 'ceremonies', name: 'الاحتفالات' },
  { id: 'performances', name: 'العروض' },
  { id: 'recitations', name: 'التلاوات' },
  { id: 'lectures', name: 'المحاضرات' },
  { id: 'workshops', name: 'الورش' },
  { id: 'documentaries', name: 'الأفلام الوثائقية' },
  { id: 'other', name: 'أخرى' },
];

// Sorting options
const SORT_OPTIONS = [
  { id: 'newest', name: 'الأحدث' },
  { id: 'oldest', name: 'الأقدم' },
  { id: 'mostViewed', name: 'الأكثر مشاهدة' },
  { id: 'mostLiked', name: 'الأكثر إعجاباً' },
];

const VideosScreen = ({ navigation, route }) => {
  const { showSaved } = route.params || {};
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const { user } = useAuth();

  const loadVideos = async () => {
    try {
      setError(null);
      let response;
      if (showSaved && user) {
        response = await api.get(`/api/users/users/${user._id}/saved-videos`);
        if (response.data && response.data.videos) {
          // Ensure person information is populated
          const videosWithPerson = response.data.videos.map(video => ({
            ...video,
            person: video.person || { name: 'مجهول', image: 'https://via.placeholder.com/40' }
          }));
          setVideos(videosWithPerson);
        } else {
          setVideos([]);
        }
      } else {
        response = await api.get('/api/videos');
        if (response.data && response.data.videos) {
          // Ensure person information is populated
          const videosWithPerson = response.data.videos.map(video => ({
            ...video,
            person: video.person || { name: 'مجهول', image: 'https://via.placeholder.com/40' }
          }));
          setVideos(videosWithPerson);
        } else {
          setVideos([]);
        }
      }
      applyFiltersAndSort(videos, selectedCategory, sortBy, searchQuery);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('حدث خطأ أثناء تحميل الفيديوهات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
  };

  useEffect(() => {
    loadVideos();
  }, [showSaved, user]);

  useEffect(() => {
    applyFiltersAndSort(videos, selectedCategory, sortBy, searchQuery);
  }, [videos, selectedCategory, sortBy, searchQuery]);

  const applyFiltersAndSort = (videosToFilter, category, sort, query) => {
    let result = [...videosToFilter];
    
    // Apply category filter
    if (category !== 'all') {
      result = result.filter(video => video.category === category);
    }
    
    // Apply search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(video => 
        video.title.toLowerCase().includes(lowerQuery) || 
        video.description.toLowerCase().includes(lowerQuery) ||
        (video.tags && video.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    }
    
    // Apply sorting
    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'mostViewed':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'mostLiked':
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        break;
    }
    
    setFilteredVideos(result);
  };

  const handleVideoPress = (video) => {
    navigation.navigate('VideoPlayer', { videoId: video._id });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderVideo = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleVideoPress(item)}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.playIconContainer}>
          <Ionicons name="play-circle" size={50} color="#f2f2d3" />
        </View>
        {/* <View style={styles.durationContainer}>
          <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        </View> */}
      </View>
      <View style={styles.content}>
        <View style={styles.poetInfo}>
          <View style={styles.poetImageContainer}>
            <Image 
              source={{ uri: item.person?.image || 'https://via.placeholder.com/40' }} 
              style={styles.poetImage}
              onError={(e) => console.log('Error loading person image:', e.nativeEvent.error)}
            />
          </View>
          <View style={styles.poetDetails}>
            <Text style={styles.poetName}>{item.person?.name || 'مجهول'}</Text>
          </View>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.metaText}>{item.category ? CATEGORIES.find(cat => cat.id === item.category)?.name || item.category : ''}</Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.views || 0}</Text>
            <Text style={styles.statLabel}>مشاهدات</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Array.isArray(item.likes) ? item.likes.length : 0}</Text>
            <Text style={styles.statLabel}>إعجابات</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تصفية حسب الفئة</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#f2f2d3" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
                {selectedCategory === category.id && (
                  <Ionicons name="checkmark" size={20} color="#f2f2d3" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ترتيب حسب</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color="#f2f2d3" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalScroll}>
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortItem,
                  sortBy === option.id && styles.selectedSort
                ]}
                onPress={() => {
                  setSortBy(option.id);
                  setShowSortModal(false);
                }}
              >
                <Text style={[
                  styles.sortText,
                  sortBy === option.id && styles.selectedSortText
                ]}>
                  {option.name}
                </Text>
                {sortBy === option.id && (
                  <Ionicons name="checkmark" size={20} color="#f2f2d3" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

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
        <TouchableOpacity style={styles.retryButton} onPress={loadVideos}>
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
          <Text style={styles.headerTitle}>الفيديوهات</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#f2f2d3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن فيديو..."
              placeholderTextColor="rgba(242, 242, 211, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#f2f2d3" />
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="filter" size={20} color="#f2f2d3" />
              <Text style={styles.filterButtonText}>
                {selectedCategory === 'all' ? 'الفئة' : CATEGORIES.find(cat => cat.id === selectedCategory)?.name || 'الفئة'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons name="swap-vertical" size={20} color="#f2f2d3" />
              <Text style={styles.filterButtonText}>
                {SORT_OPTIONS.find(opt => opt.id === sortBy)?.name || 'ترتيب'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredVideos}
          renderItem={renderVideo}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد فيديوهات متاحة</Text>
            </View>
          }
        />
      </LinearGradient>

      {renderFilterModal()}
      {renderSortModal()}
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
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#f2f2d3',
    paddingVertical: 12,
    textAlign: 'right',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    width: '48%',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#f2f2d3',
    marginLeft: 8,
    fontSize: 14,
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
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    padding: 15,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  description: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'right',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.7,
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
  durationContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  duration: {
    color: '#f2f2d3',
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stat: {
    flexDirection: 'column',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  modalScroll: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 211, 0.1)',
  },
  selectedCategory: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
  },
  categoryText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'right',
  },
  selectedCategoryText: {
    fontWeight: 'bold',
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 211, 0.1)',
  },
  selectedSort: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
  },
  sortText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'right',
  },
  selectedSortText: {
    fontWeight: 'bold',
  },
  poetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  poetImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    marginRight: 10,
  },
  poetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  poetDetails: {
    flex: 1,
  },
  poetName: {
    color: '#f2f2d3',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default VideosScreen; 