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
  Video,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PoemItem from '../components/PoemItem';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const GRID_WIDTH = width * 0.45;

const PoemsScreen = ({ navigation, route }) => {
  const { user, token } = useAuth();
  const [poems, setPoems] = useState([]);
  const [filteredPoems, setFilteredPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPoet, setSelectedPoet] = useState(null);
  const [poets, setPoets] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [visiblePoemId, setVisiblePoemId] = useState(null);
  const flatListRef = useRef(null);
  const showSaved = route?.params?.showSaved;

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'popular', label: 'الأكثر شعبية' },
    { id: 'recent', label: 'الأحدث' },
    { id: 'oldest', label: 'الأقدم' },
  ];

  const loadPoems = async () => {
    try {
      setLoading(true);
      let response;
      
      if (showSaved) {
        if (!user?._id) {
          console.log('User not logged in, cannot load saved poems');
          setError('يجب تسجيل الدخول لعرض القصائد المحفوظة');
          setPoems([]);
          setFilteredPoems([]);
          return;
        }
        
        console.log('Loading saved poems for user:', user._id);
        response = await api.get(`/api/users/users/${user._id}/saved-poems`);
        console.log('Saved poems response:', response.data);
        
        if (response.data && response.data.poems) {
          const savedPoems = response.data.poems.map(poem => ({
            ...poem,
            isLiked: user ? poem.likes?.includes(user._id) : false,
            isSaved: true
          }));
          console.log('Processed saved poems:', savedPoems.length);
          setPoems(savedPoems);
          setFilteredPoems(savedPoems);
        } else {
          console.log('No saved poems found in response');
          setPoems([]);
          setFilteredPoems([]);
        }
      } else {
        console.log('Loading all poems');
        response = await api.get('/api/poems');
        console.log('All poems response:', response.data);
      
      if (response.data && response.data.poems) {
          const poemsWithLikesAndSaved = response.data.poems.map(poem => ({
          ...poem,
          isLiked: user ? poem.likes?.includes(user._id) : false,
            isSaved: user?.savedPoems?.some(savedId => 
              (typeof savedId === 'string' ? savedId : savedId._id) === poem._id
            ) || false
          }));
          console.log('Processed all poems:', poemsWithLikesAndSaved.length);
        setPoems(poemsWithLikesAndSaved);
        setFilteredPoems(poemsWithLikesAndSaved);
      } else {
        console.log('No poems found in response');
        setPoems([]);
        setFilteredPoems([]);
        }
      }
    } catch (error) {
      console.error('Error loading poems:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('حدث خطأ أثناء تحميل القصائد');
      setPoems([]);
      setFilteredPoems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPoets = async () => {
    try {
      const response = await api.get('/api/poets');
      console.log('Poets response:', response.data);
      
      if (response.data && response.data.poets) {
        console.log('Setting poets:', response.data.poets);
        setPoets(response.data.poets);
    } else {
        console.log('No poets found in response');
        setPoets([]);
      }
    } catch (err) {
      console.error('Error loading poets:', err);
    }
  };

  useEffect(() => {
    loadPoems();
    loadPoets();
  }, [showSaved, user]);

  useEffect(() => {
    filterPoems();
  }, [searchQuery, selectedFilter, selectedPoet]);

  useEffect(() => {
    if (user && poems.length > 0) {
      const updatedPoems = poems.map(poem => ({
        ...poem,
        isSaved: user.savedPoems?.some(id => id.toString() === poem._id.toString()) || false
      }));
      setPoems(updatedPoems);
      setFilteredPoems(updatedPoems);
    }
  }, [user]);

  const filterPoems = () => {
    let filtered = [...poems];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(poem =>
        poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poem.poet?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Poet filter
    if (selectedPoet) {
      filtered = filtered.filter(poem => poem.poet?._id === selectedPoet);
    }

    // Sort filter
    switch (selectedFilter) {
      case 'popular':
        filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
    }

    setFilteredPoems(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPoems();
  };

  const renderPoemCard = ({ item }) => (
    <TouchableOpacity
      style={styles.poemCard}
      onPress={() => navigation.navigate('PoemDetails', { poemId: item._id })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300' }}
        style={styles.poemImage}
        defaultSource={require('../../assets/images/png-transparent-default-avatar-thumbnail.png')}
      />
      <View style={styles.poemInfo}>
        <Text style={styles.poemTitle}>{item.title}</Text>
        
        <TouchableOpacity 
          style={styles.poetContainer}
          onPress={() => navigation.navigate('PoetDetails', { poetId: item.poet._id })}
        >
          <Image
            source={{ uri: item.poet?.image }}
            style={styles.poetImage}
            defaultSource={require('../../assets/images/png-transparent-default-avatar-thumbnail.png')}
          />
          <Text style={styles.poetName}>{item.poet?.name}</Text>
        </TouchableOpacity>

        <Text style={styles.poemCategory}>{item.category}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <AntDesign name="heart" size={14} color="#e74c3c" />
            <Text style={styles.statText}>{item.likes?.length || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <AntDesign name="message1" size={14} color="#f2f2d3" />
            <Text style={styles.statText}>{item.comments?.length || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <AntDesign name="eye" size={14} color="#f2f2d3" />
            <Text style={styles.statText}>{item.views || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      if (visibleItem.item._id !== visiblePoemId) {
        setVisiblePoemId(visibleItem.item._id);
        console.log('Görünür şiir ID:', visibleItem.item._id);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
    waitForInteraction: true
  }).current;

  // İlk şiiri otomatik olarak görünür yap
  useEffect(() => {
    if (filteredPoems.length > 0 && !visiblePoemId) {
      setVisiblePoemId(filteredPoems[0]._id);
    }
  }, [filteredPoems, visiblePoemId]);

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
        <TouchableOpacity style={styles.retryButton} onPress={loadPoems}>
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
          <Text style={styles.headerTitle}>القصائد</Text>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddPoem')}
            >
              <AntDesign name="plus" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#f2f2d3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن قصيدة..."
              placeholderTextColor="#f2f2d3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
          {filters.map(filter => (
              <TouchableOpacity
              key={filter.id}
                style={[
                  styles.categoryButton,
                  selectedFilter === filter.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                  styles.categoryButtonText,
                  selectedFilter === filter.id && styles.categoryButtonTextActive
              ]}>
                {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="filter-list" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredPoems}
          renderItem={renderPoemCard}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#f2f2d3']}
              tintColor="#f2f2d3"
            />
          }
          ListEmptyComponent={
            !loading && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد قصائد متاحة</Text>
        </View>
            ) : null
          }
          ListFooterComponent={
            loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f2f2d3" />
              </View>
            ) : null
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
                <Text style={styles.modalTitle}>تصفية القصائد</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <AntDesign name="close" size={24} color="#f2f2d3" />
                </TouchableOpacity>
                </View>
              
              <ScrollView style={styles.modalBody}>
                <Text style={styles.filterSectionTitle}>الشعراء</Text>
                {poets.map(poet => (
                  <TouchableOpacity 
                    key={poet._id}
                    style={[
                      styles.poetFilterItem,
                      selectedPoet === poet._id && styles.selectedPoetFilterItem
                    ]}
                    onPress={() => {
                      setSelectedPoet(selectedPoet === poet._id ? null : poet._id);
                    }}
                  >
                    <Text style={[
                      styles.poetFilterText,
                      selectedPoet === poet._id && styles.selectedPoetFilterText
                    ]}>
                      {poet.name}
                    </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => {
                    setShowFilters(false);
                    filterPoems();
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
  searchContainer: {
    padding: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  categoriesContainer: {
    flex: 1,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  sortButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  list: {
    padding: 15,
  },
  poemCard: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  poemImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    margin: 15,
  },
  poemInfo: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  poemTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  poetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  poetImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 8,
  },
  poetName: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'right',
  },
  poemCategory: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    color: '#f2f2d3',
    fontSize: 12,
  },
  categoryButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#f2f2d3',
  },
  categoryButtonText: {
    color: '#f2f2d3',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#f2f2d3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 10,
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
    flex: 1,
  },
  filterSectionTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  poetFilterItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedPoetFilterItem: {
    backgroundColor: '#f2f2d3',
  },
  poetFilterText: {
    color: '#f2f2d3',
    fontSize: 14,
  },
  selectedPoetFilterText: {
    color: '#000000',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(242, 242, 211, 0.1)',
  },
  applyButton: {
    backgroundColor: '#f2f2d3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PoemsScreen; 