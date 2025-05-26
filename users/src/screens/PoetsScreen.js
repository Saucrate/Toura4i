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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const { width } = Dimensions.get('window');

const PoetsScreen = ({ navigation }) => {
  const [poets, setPoets] = useState([]);
  const [filteredPoets, setFilteredPoets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('followers'); // 'followers', 'poems', 'awards'

  const loadPoets = async () => {
    try {
      setError(null);
      const response = await api.get('/api/poets');
      console.log('API Response:', response.data);
      if (response.data && response.data.poets) {
        const poetsWithStats = response.data.poets.map(poet => ({
          ...poet,
          poemsCount: poet.poems?.length || 0,
          albumsCount: poet.albums?.length || 0,
          videosCount: poet.videos?.length || 0,
          audioRecordingsCount: poet.audioRecordings?.length || 0,
          photosCount: poet.photos?.length || 0,
          booksCount: poet.books?.length || 0,
          followersCount: poet.followers || 0
        }));
        setPoets(poetsWithStats);
        setFilteredPoets(poetsWithStats);
      } else {
        setPoets([]);
        setFilteredPoets([]);
      }
    } catch (err) {
      console.error('Error loading poets:', err);
      setError('حدث خطأ أثناء تحميل الأشخاص. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPoets();
  };

  useEffect(() => {
    loadPoets();
  }, []);

  useEffect(() => {
    filterAndSortPoets();
  }, [searchQuery, sortBy, poets]);

  const filterAndSortPoets = () => {
    let filtered = [...poets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(poet =>
        poet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poet.biography.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'poems':
          return b.poemsCount - a.poemsCount;
        case 'albums':
          return b.albumsCount - a.albumsCount;
        case 'videos':
          return b.videosCount - a.videosCount;
        case 'audioRecordings':
          return b.audioRecordingsCount - a.audioRecordingsCount;
        case 'photos':
          return b.photosCount - a.photosCount;
        case 'books':
          return b.booksCount - a.booksCount;
        default:
          return 0;
      }
    });

    setFilteredPoets(filtered);
  };

  const renderSortButton = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === value && styles.sortButtonSelected]}
      onPress={() => setSortBy(value)}
    >
      <Text style={[styles.sortButtonText, sortBy === value && styles.sortButtonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Helper to format numbers (e.g., 1.2K)
  const formatFollowers = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  const getFollowersText = (count) => {
    if (count === 0) return 'متابع';
    if (count === 1) return 'متابع';
    if (count === 2) return 'متابعان';
    if (count >= 3 && count <= 10) return 'متابعين';
    return 'متابع';
  };

  const renderPoet = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PoetDetails', { poetId: item._id })}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.followersContainer}>
            <Ionicons name="people" size={18} color="#f2c94c" style={{ marginRight: 2 }} />
            <Text style={styles.followersCount}>
              {formatFollowers(item.followersCount || 0)} {getFollowersText(item.followersCount || 0)}
            </Text>
          </View>
        </View>
        <Text style={styles.period}>{item.period}</Text>
        <Text style={styles.bio} numberOfLines={2}>
          {item.biography}
        </Text>
      </View>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadPoets}>
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
          <Text style={styles.headerTitle}>الأشخاص</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#f2f2d3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن شخص..."
              placeholderTextColor="#f2f2d3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
          style={styles.sortScrollView}
        >
          {renderSortButton({ label: 'القصائد', value: 'poems' })}
          {renderSortButton({ label: 'الألبومات', value: 'albums' })}
          {renderSortButton({ label: 'الفيديوهات', value: 'videos' })}
          {renderSortButton({ label: 'التسجيلات', value: 'audioRecordings' })}
          {renderSortButton({ label: 'الصور', value: 'photos' })}
          {renderSortButton({ label: 'الكتب', value: 'books' })}
        </ScrollView>

        <FlatList
          data={filteredPoets}
          renderItem={renderPoet}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا يوجد شعراء متاحين</Text>
            </View>
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
  sortScrollView: {
    maxHeight: 50,
    marginBottom: 10,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    alignItems: 'center',
  },
  sortButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.1)',
  },
  sortButtonSelected: {
    backgroundColor: '#f2f2d3',
    borderColor: '#f2f2d3',
  },
  sortButtonText: {
    color: '#f2f2d3',
    fontSize: 14,
  },
  sortButtonTextSelected: {
    color: '#000000',
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
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.1)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 15,
    borderWidth: 2,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  content: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
  followersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 201, 76, 0.15)', // gold-ish highlight
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    shadowColor: '#f2c94c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(242, 201, 76, 0.3)',
  },
  followersCount: {
    color: '#f2c94c',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  period: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    textAlign: 'right',
  },
  bio: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'right',
    lineHeight: 20,
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
});

export default PoetsScreen; 