import React, { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'khutbah', label: 'خطب' },
  { id: 'lectures', label: 'محاضرات' },
  { id: 'poetry', label: 'شعر' },
  { id: 'speeches', label: 'خطابات' },
  { id: 'interviews', label: 'مقابلات' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'الأحدث' },
  { id: 'oldest', label: 'الأقدم' },
  { id: 'mostViewed', label: 'الأكثر مشاهدة' },
];

const AudioRecordingsScreen = ({ navigation, route }) => {
  const { playTrack } = useAudio();
  const { user, isAuthenticated } = useAuth();
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { showSaved } = route.params || {};

  const loadRecordings = async () => {
    try {
      setError(null);
      let response;
      
      // Get token from API headers
      const token = api.defaults.headers.common['authorization']?.split(' ')[1];
      console.log('Token from API headers:', token ? 'exists' : 'not found');

      if (showSaved) {
        response = await api.get(`/api/users/users/${user?._id}/saved-audios`);
        if (response.data) {
          setRecordings(response.data.audios || []);
          applyFilters(response.data.audios || []);
        } else {
          setRecordings([]);
          setFilteredRecordings([]);
        }
      } else {
        response = await api.get('/api/audio-recordings');
        if (response.data && Array.isArray(response.data)) {
          setRecordings(response.data);
          applyFilters(response.data);
        } else {
          setRecordings([]);
          setFilteredRecordings([]);
        }
      }
    } catch (err) {
      console.error('Error loading recordings:', err);
      if (err.response?.status === 401) {
        setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
        // Clear token and redirect to login
        api.defaults.headers.common['authorization'] = '';
        navigation.navigate('Login');
      } else {
        setError('حدث خطأ أثناء تحميل التسجيلات. يرجى المحاولة مرة أخرى.');
      }
      setRecordings([]);
      setFilteredRecordings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = [...data];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.performer.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'mostViewed':
        filtered.sort((a, b) => b.views - a.views);
        break;
    }

    setFilteredRecordings(filtered);
  };

  useEffect(() => {
    loadRecordings();
  }, [showSaved]);

  useEffect(() => {
    applyFilters(recordings);
  }, [searchQuery, selectedCategory, selectedSort]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecordings();
  };

  const handlePlayPress = (recording) => {
    if (!recording.file || !recording.image) {
      console.error('Invalid recording data:', recording);
      return;
    }
    
    const formattedTrack = {
      id: recording._id,
      title: recording.title,
      artist: recording.performer,
      audio: recording.file,
      image: recording.image,
    };
    playTrack(formattedTrack, [formattedTrack]);
  };

  const renderRecording = ({ item }) => {
    if (!item.image || !item.file) {
      return null;
    }
    
    return (
      <TouchableOpacity
        key={item._id}
        style={styles.card}
        onPress={() => navigation.navigate('AudioRecordingDetails', { recordingId: item._id })}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.playIconContainer}>
            <Ionicons name="play-circle" size={50} color="#f2f2d3" />
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          {item.performer && (
            <TouchableOpacity 
              style={styles.performerContainer}
              onPress={() => navigation.navigate('PoetDetails', { poetId: item.performer._id })}
            >
              <View style={styles.performerImageContainer}>
                <Image 
                  source={{ uri: item.performer.image || 'https://via.placeholder.com/32' }} 
                  style={styles.performerImage}
                />
              </View>
              <Text style={styles.performer}>{item.performer.name || 'بدون اسم'}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color="#f2f2d3" />
              <Text style={styles.statText}>{item.views}</Text>
            </View>
            <Text style={styles.category}>{CATEGORIES.find(c => c.id === item.category)?.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تصفية وترتيب</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#f2f2d3" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>التصنيف</Text>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.selectedCategory
                  ]}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setShowFilters(false);
                  }}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.selectedCategoryText
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>الترتيب</Text>
            <View style={styles.sortContainer}>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sortButton,
                    selectedSort === option.id && styles.selectedSort
                  ]}
                  onPress={() => {
                    setSelectedSort(option.id);
                    setShowFilters(false);
                  }}
                >
                  <Text style={[
                    styles.sortButtonText,
                    selectedSort === option.id && styles.selectedSortText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadRecordings}>
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
          <Text style={styles.headerTitle}>التسجيلات الصوتية</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="filter-list" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#f2f2d3" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن تسجيل..."
            placeholderTextColor="#f2f2d3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#f2f2d3" />
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={filteredRecordings}
          renderItem={renderRecording}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد تسجيلات متاحة</Text>
            </View>
          }
        />

        {renderFilterModal()}
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
  filterButton: {
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'right',
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
  performerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  performerImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 8,
    backgroundColor: '#2a2a2a',
  },
  performerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  performer: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#f2f2d3',
    fontSize: 14,
    marginLeft: 5,
  },
  category: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
  },
  selectedCategory: {
    backgroundColor: '#f2f2d3',
  },
  categoryButtonText: {
    color: '#f2f2d3',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#000000',
  },
  sortContainer: {
    gap: 10,
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
  },
  selectedSort: {
    backgroundColor: '#f2f2d3',
  },
  sortButtonText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'right',
  },
  selectedSortText: {
    color: '#000000',
  },
});

export default AudioRecordingsScreen; 