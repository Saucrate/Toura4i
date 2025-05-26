import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const sortOptions = [
  { label: 'الأحدث', value: 'newest', icon: 'access-time' },
  { label: 'الأكثر إعجاباً', value: 'mostLiked', icon: 'favorite' },
  { label: 'الأكثر تعليقاً', value: 'mostCommented', icon: 'comment' },
  { label: 'الأكثر مشاهدة', value: 'mostViewed', icon: 'visibility' },
];

const HistoricalPlacesScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { showSaved: routeShowSaved } = route.params || {};
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSaved, setShowSaved] = useState(routeShowSaved || false);

  useEffect(() => {
    if (routeShowSaved !== undefined) {
      setShowSaved(routeShowSaved);
    }
  }, [routeShowSaved]);

  useEffect(() => {
    loadPlaces();
  }, [showSaved, user]);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      let response;
      
      if (showSaved && user) {
        response = await api.get(`/api/users/users/${user._id}/saved-places`);
        const placesData = response.data.places || [];
        setPlaces(placesData);
      } else {
        response = await api.get('/api/places');
        const placesData = response.data.places || response.data;
        
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(placesData.map(place => place.type))];
        setCategories(uniqueCategories);
        
        // Process places to include isSaved status
        const processedPlaces = placesData.map(place => ({
          ...place,
          isSaved: place.savedBy?.includes(user?._id) || false
        }));
        
        setPlaces(processedPlaces);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading places:', err);
      setError('حدث خطأ أثناء تحميل الأماكن');
    } finally {
      setLoading(false);
    }
  };

  const applySort = (places) => {
    const sortedPlaces = [...places];
    switch (sortBy) {
      case 'mostLiked':
        return sortedPlaces.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      case 'mostCommented':
        return sortedPlaces.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      case 'mostViewed':
        return sortedPlaces.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'newest':
      default:
        return sortedPlaces.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const filteredAndSortedPlaces = applySort(
    places.filter(place => {
      const matchesSearch = 
        place.name.toLowerCase().includes(search.toLowerCase()) ||
        place.location.toLowerCase().includes(search.toLowerCase()) ||
        place.type.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || place.type === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
  );

  const renderSortMenu = () => (
    <View style={styles.sortMenuContainer}>
      {sortOptions.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.sortMenuItem,
            sortBy === option.value && styles.sortMenuItemActive
          ]}
          onPress={() => {
            setSortBy(option.value);
            setShowSortMenu(false);
          }}
        >
          <MaterialIcons 
            name={option.icon} 
            size={20} 
            color={sortBy === option.value ? '#000' : '#f2f2d3'} 
          />
          <Text style={[
            styles.sortMenuItemText,
            sortBy === option.value && styles.sortMenuItemTextActive
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPlaceItem = ({ item }) => {
    // Find the first image in media array, or use the first media item if no image is found
    const firstMedia = item.media?.find(m => m.type === 'image') || item.media?.[0];
    
    return (
      <TouchableOpacity
        style={styles.placeCard}
        onPress={() => navigation.navigate('PlaceDetails', { placeId: item._id })}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: firstMedia?.url }}
          style={styles.placeImage}
          defaultSource={require('../../assets/images/png-transparent-default-avatar-thumbnail.png')}
        />
        {firstMedia?.type === 'video' && (
          <View style={styles.videoIndicator}>
            <MaterialIcons name="play-circle-filled" size={24} color="#f2f2d3" />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        >
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{item.name}</Text>
            <Text style={styles.placeLocation}>{item.location}</Text>
            <Text style={styles.placeYear}>{item.year}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <AntDesign name="heart" size={14} color="#e74c3c" />
                <Text style={styles.statText}>{item.likesCount || 0}</Text>
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
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.categoryButtonTextActive
      ]}>
        {category === 'all' ? 'الكل' : category}
      </Text>
    </TouchableOpacity>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadPlaces}>
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
          <Text style={styles.headerTitle}>
            {showSaved ? 'الأماكن المحفوظة' : 'الأماكن التاريخية'}
          </Text>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(renderCategoryButton)}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <MaterialIcons name="sort" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          
          {showSortMenu && renderSortMenu()}
        </View>

        <View style={styles.searchContainer}>
          <AntDesign name="search1" size={18} color="#f2f2d3" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن مكان..."
            placeholderTextColor="#f2f2d3"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredAndSortedPlaces}
          renderItem={renderPlaceItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>لا توجد أماكن مطابقة</Text>
          }
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingRight: 10,
  },
  categoryButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
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
  sortButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  sortMenuContainer: {
    position: 'absolute',
    top: 50,
    right: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    zIndex: 1000,
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  sortMenuItemActive: {
    backgroundColor: '#f2f2d3',
  },
  sortMenuItemText: {
    color: '#f2f2d3',
    fontSize: 14,
    marginLeft: 10,
  },
  sortMenuItemTextActive: {
    color: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 16,
    paddingVertical: 10,
    textAlign: 'right',
  },
  list: {
    padding: 15,
  },
  placeCard: {
    height: 210,
    borderRadius: 18,
    marginBottom: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(242, 242, 211, 0.08)',
    elevation: 2,
  },
  placeImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  placeInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  placeName: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  placeLocation: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 4,
    textAlign: 'right',
  },
  placeYear: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#f2f2d3',
    fontSize: 13,
    opacity: 0.8,
  },
  emptyText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#f2f2d3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  videoIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
});

export default HistoricalPlacesScreen; 