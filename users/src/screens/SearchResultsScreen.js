import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import defaultAvatar from '../../assets/images/png-transparent-default-avatar-thumbnail.png';

const { width } = Dimensions.get('window');

const SearchResultsScreen = ({ route, navigation }) => {
  const { query } = route.params;
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    users: [],
    poets: [],
    poems: [],
    books: [],
    places: [],
    albums: [],
    videos: [],
    audioRecordings: [],
    photos: [],
  });
  const [activeCategory, setActiveCategory] = useState('poets');
  const [searchText, setSearchText] = useState(query);

  const categories = [
    { id: 'users', title: 'المستخدمين', icon: 'people' },
    { id: 'poets', title: 'الأشخاص المميزون', icon: 'person' },
    { id: 'poems', title: 'القصائد', icon: 'book' },
    { id: 'books', title: 'الكتب', icon: 'library' },
    { id: 'places', title: 'الأماكن', icon: 'location' },
    { id: 'albums', title: 'الألبومات', icon: 'albums' },
    { id: 'videos', title: 'الفيديوهات', icon: 'videocam' },
    { id: 'audioRecordings', title: 'التسجيلات', icon: 'musical-notes' },
    { id: 'photos', title: 'الصور', icon: 'images' },
  ];

  useEffect(() => {
    performSearch(query);
  }, [query]);

  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      console.log('Performing search for:', searchQuery);
      const response = await api.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      
      // Populate missing data for poems and photos
      const populatedData = {
        ...response.data,
        poems: response.data.poems?.map(poem => ({
          ...poem,
          poet: poem.poet ? {
            _id: poem.poet._id || poem.poet,
            name: poem.poet.name || 'شاعر غير معروف',
            image: poem.poet.image || 'https://via.placeholder.com/40'
          } : null,
          likes: poem.likes || [],
          comments: poem.comments || [],
          views: poem.views || 0,
          createdAt: poem.createdAt || new Date().toISOString()
        })) || [],
        photos: response.data.photos?.map(photo => ({
          ...photo,
          person: photo.person ? {
            _id: photo.person._id || photo.person,
            name: photo.person.name || 'بدون اسم',
            image: photo.person.image || 'https://via.placeholder.com/40'
          } : null,
          likes: photo.likes || [],
          comments: photo.comments || [],
          createdAt: photo.createdAt || new Date().toISOString()
        })) || []
      };

      console.log('Search response:', {
        status: response.status,
        data: {
          audioRecordings: populatedData.audioRecordings?.length || 0,
          videos: populatedData.videos?.length || 0,
          albums: populatedData.albums?.length || 0,
          poems: populatedData.poems?.length || 0,
          photos: populatedData.photos?.length || 0,
          rawData: populatedData
        }
      });
      
      setResults(populatedData);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      performSearch(searchText);
    }
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="بحث..."
        placeholderTextColor="rgba(242, 242, 211, 0.5)"
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Ionicons name="search" size={24} color="#f2f2d3" />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryHeader = () => (
    <View style={styles.categoryHeader}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              activeCategory === item.id && styles.activeCategoryButton,
            ]}
            onPress={() => setActiveCategory(item.id)}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={activeCategory === item.id ? '#000' : '#f2f2d3'}
            />
            <Text
              style={[
                styles.categoryButtonText,
                activeCategory === item.id && styles.activeCategoryButtonText,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderResults = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#f2f2d3" />
        </View>
      );
    }

    const activeResults = results[activeCategory] || [];
    console.log('Active category:', activeCategory, 'Results:', {
      length: activeResults.length,
      results: activeResults
    });

    if (activeResults.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>لا توجد نتائج</Text>
        </View>
      );
    }

    const renderItem = ({ item }) => {
      switch (activeCategory) {
        case 'users':
          return (
            <TouchableOpacity
              style={[styles.card, { flexDirection: 'row', padding: 15 }]}
              onPress={() => navigation.navigate('UserDetails', { userId: item._id })}
            >
              <Image
                source={item.avatar ? { uri: item.avatar } : defaultAvatar}
                style={[styles.image, { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#f2c94c' }]}
                resizeMode="cover"
              />
              <View style={[styles.content, { marginLeft: 15, justifyContent: 'center' }]}>
                <Text style={[styles.title, { marginBottom: 4 }]}>{item.name}</Text>
                <Text style={[styles.username, { marginBottom: 8 }]}>@{item.username}</Text>
                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Ionicons name="people" size={16} color="#f2c94c" style={{ marginRight: 4 }} />
                    <Text style={styles.statValue}>{formatFollowers(item.followers || 0)}</Text>
                    <Text style={styles.statLabel}>{getFollowersText(item.followers || 0)}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="person-add" size={16} color="#f2c94c" style={{ marginRight: 4 }} />
                    <Text style={styles.statValue}>{formatFollowers(item.following || 0)}</Text>
                    <Text style={styles.statLabel}>يتابع</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );

        case 'poets':
          return (
            <TouchableOpacity
              style={[styles.card, { flexDirection: 'row', padding: 15 }]}
              onPress={() => navigation.navigate('PoetDetails', { poetId: item._id })}
            >
              <Image
                source={{ uri: item.image }}
                style={[styles.image, { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#f2c94c' }]}
                resizeMode="cover"
              />
              <View style={[styles.content, { marginLeft: 15, justifyContent: 'center' }]}>
                <Text style={[styles.title, { marginBottom: 4 }]}>{item.name}</Text>
                <Text style={[styles.period, { marginBottom: 8 }]}>{item.period}</Text>
                <Text style={[styles.bio, { marginBottom: 8, lineHeight: 20 }]} numberOfLines={2}>
                  {item.biography}
                    </Text>
                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Ionicons name="people" size={16} color="#f2c94c" style={{ marginRight: 4 }} />
                    <Text style={styles.statValue}>{formatFollowers(item.followers || 0)}</Text>
                    <Text style={styles.statLabel}>{getFollowersText(item.followers || 0)}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );

        case 'poems':
          return (
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

        case 'books':
          return (
            <TouchableOpacity
              style={styles.bookCard}
              onPress={() => navigation.navigate('BookDetails', { bookId: item._id })}
            >
              <Image
                source={{ uri: item.cover }}
                style={styles.bookCover}
                defaultSource={require('../../assets/images/png-transparent-default-avatar-thumbnail.png')}
              />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.title}</Text>
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
                <Text style={styles.bookYear}>{item.year}</Text>
                <Text style={styles.bookCategory}>{item.category}</Text>
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

        case 'places':
          return (
            <TouchableOpacity
              style={styles.placeCard}
              onPress={() => navigation.navigate('PlaceDetails', { placeId: item._id })}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: item.media?.[0]?.url || 'https://via.placeholder.com/300' }}
                style={styles.placeImage}
                defaultSource={require('../../assets/images/png-transparent-default-avatar-thumbnail.png')}
              />
              {item.media?.[0]?.type === 'video' && (
                <View style={styles.videoIndicator}>
                  <MaterialIcons name="play-circle-filled" size={24} color="#f2f2d3" />
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.cardGradient}
              >
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{item.name || 'موقع غير معروف'}</Text>
                  <Text style={styles.placeLocation}>{item.location || 'موقع غير معروف'}</Text>
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

        case 'albums':
          return (
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

        case 'videos':
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('VideoPlayer', { 
                videoId: item._id,
                presentation: 'modal',
                animation: 'slide_from_bottom'
              })}
            >
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: item.thumbnail || 'https://via.placeholder.com/300' }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.playIconContainer}>
                  <Ionicons name="play-circle" size={50} color="#f2f2d3" />
                </View>
              </View>
              <View style={styles.content}>
                <View style={styles.poetInfo}>
                  <View style={styles.poetImageContainer}>
                    <Image 
                      source={{ uri: item.person?.image || 'https://via.placeholder.com/40' }} 
                      style={styles.poetImage}
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
                  <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}</Text>
                  <Text style={styles.metaText}>{item.category}</Text>
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

        case 'audioRecordings':
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('AudioRecordingDetails', { 
                recordingId: item._id,
                presentation: 'modal',
                animation: 'slide_from_bottom'
              })}
            >
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: item.image || item.thumbnail || 'https://via.placeholder.com/300' }}
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
                    <Text style={styles.statText}>{item.views || 0}</Text>
                  </View>
                  <Text style={styles.category}>{item.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );

        case 'photos':
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('PhotoDetails', { photoId: item._id })}
            >
              <View style={styles.cardHeader}>
                {item.person && (
                  <TouchableOpacity 
                    style={styles.poetInfo}
                    onPress={() => navigation.navigate('PoetDetails', { poetId: item.person._id })}
                  >
                    <View style={styles.poetImageContainer}>
                      <Image 
                        source={{ uri: item.person.image || 'https://via.placeholder.com/40' }} 
                        style={styles.poetImage}
                      />
                    </View>
                    <View style={styles.poetDetails}>
                      <Text style={styles.poetName}>{item.person.name || 'بدون اسم'}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.mediaContainer}
              >
                {item.images?.map((image) => (
                  <View
                    key={image._id}
                    style={[styles.mediaContainer, { width }]}
                  >
                    <Image
                      source={{ uri: image.url }}
                      style={[styles.photo, { width, height: 400 }]}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>

              <View style={styles.postActions}>
                <View style={styles.leftActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <AntDesign name="heart" size={24} color="#f2f2d3" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <AntDesign name="message1" size={24} color="#f2f2d3" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Feather name="users" size={24} color="#f2f2d3" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Feather name="share" size={24} color="#f2f2d3" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="bookmark-outline" size={22} color="#f2f2d3" />
                </TouchableOpacity>
              </View>

              <View style={styles.postInfo}>
                <Text style={styles.likesCount}>{item.likes?.length || 0} إعجاب</Text>
                <Text style={styles.content} numberOfLines={2}>{item.description}</Text>
                <TouchableOpacity style={styles.commentsButton}>
                  <Text style={styles.viewComments}>
                    عرض التعليقات ({item.comments?.length || 0})
                  </Text>
                </TouchableOpacity>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                </Text>
              </View>
            </TouchableOpacity>
          );

        default:
          return null;
      }
    };

    return (
      <View style={styles.contentSection}>
        <FlatList
          data={activeResults}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  };

  const StatItem = ({ icon, value }) => (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={14} color="#f2f2d3" />
      <Text style={styles.statText}>{value || 0}</Text>
    </View>
  );

  const ActionButton = ({ icon }) => (
    <TouchableOpacity style={styles.actionButton}>
      <Ionicons name={icon} size={24} color="#f2f2d3" />
    </TouchableOpacity>
  );

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

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

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        {renderSearchBar()}
        {renderCategoryHeader()}
        {renderResults()}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 60,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#f2f2d3',
    marginRight: 10,
    textAlign: 'right',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryHeader: {
    paddingVertical: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
  },
  activeCategoryButton: {
    backgroundColor: '#f2f2d3',
  },
  categoryButtonText: {
    color: '#f2f2d3',
    marginLeft: 5,
    fontSize: 14,
  },
  activeCategoryButtonText: {
    color: '#000000',
  },
  emptyText: {
    color: '#f2f2d3',
    fontSize: 16,
  },
  contentSection: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
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
  bookCard: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 10,
    margin: 15,
  },
  bookInfo: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  bookTitle: {
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
  bookYear: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
    textAlign: 'right',
  },
  bookCategory: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    textAlign: 'right',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 2,
  },
  iconBtn: {
    padding: 2,
  },
  postInfo: {
    paddingHorizontal: 15,
    paddingBottom: 12,
  },
  likesCount: {
    color: '#f2f2d3',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  content: {
    color: '#f2f2d3',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
    marginBottom: 6,
  },
  commentsButton: {
    marginBottom: 6,
  },
  viewComments: {
    color: '#8e8e8e',
    fontSize: 13,
  },
  date: {
    color: '#8e8e8e',
    fontSize: 11,
  },
  durationContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  duration: {
    color: '#f2f2d3',
    fontSize: 14,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  subtitle: {
    color: '#f2f2d3',
    opacity: 0.7,
    fontSize: 14,
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
  videoIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
});

export default SearchResultsScreen; 