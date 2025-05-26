import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

const categories = [
  {
    id: 'books',
    title: 'الكتب',
    icon: 'book',
    iconFamily: 'Ionicons',
    screen: 'Books',
  },
  {
    id: 'historical',
    title: 'الأماكن التاريخية',
    icon: 'location',
    iconFamily: 'Ionicons',
    screen: 'HistoricalPlaces',
  },
  {
    id: '1',
    title: 'الأشخاص المميزون',
    icon: 'people',
    iconFamily: 'Ionicons',
    screen: 'Poets',
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
  }
];

const HomeScreen = ({ navigation }) => {
  const { playTrack } = useAudio();
  const { signed, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [targetScreen, setTargetScreen] = useState(null);
  const [featuredPoets, setFeaturedPoets] = useState([]);
  const [popularPoems, setPopularPoems] = useState([]);
  const [recentAlbums, setRecentAlbums] = useState([]);
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWidth = useRef(new Animated.Value(0)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [searchText, setSearchText] = useState('');

  const loadContent = async () => {
    try {
      setError(null);
      const [
        poetsResponse,
        poemsResponse,
        albumsResponse,
        videosResponse,
        photosResponse,
      ] = await Promise.all([
        api.get('/api/poets?featured=true'),
        api.get('/api/poems?sort=popular'),
        api.get('/api/albums?sort=recent'),
        api.get('/api/videos?featured=true'),
        api.get('/api/photos?featured=true'),
      ]);

      // API yanıtlarını kontrol et
      console.log('Poets Response:', poetsResponse.data);
      console.log('Poems Response:', poemsResponse.data);
      console.log('Albums Response:', albumsResponse.data);
      console.log('Videos Response:', videosResponse.data);
      console.log('Photos Response:', photosResponse.data);

      // Verileri kontrol ederek state'e kaydet
      setFeaturedPoets(Array.isArray(poetsResponse.data) ? poetsResponse.data : []);
      setPopularPoems(Array.isArray(poemsResponse.data) ? poemsResponse.data : []);
      setRecentAlbums(Array.isArray(albumsResponse.data) ? albumsResponse.data : []);
      setFeaturedPhotos(Array.isArray(photosResponse.data) ? photosResponse.data : []);
      setFeaturedVideos(Array.isArray(videosResponse.data) ? videosResponse.data : []);

    } catch (err) {
      console.error('Error loading content:', err);
      setError('حدث خطأ أثناء تحميل المحتوى. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get('/api/users/notifications/unread');
      setUnreadNotifications(response.data.count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadMessages = async () => {
    if (!user) return;
    try {
      const response = await api.get('/api/messages/unread-count');
      setUnreadMessages(response.data.count);
    } catch (error) {
      setUnreadMessages(0);
    }
  };

  useEffect(() => {
    loadContent();
    if (user) {
      loadNotifications();
      loadUnreadMessages();
    }
  }, [user]);

  const handlePlayTrack = (track) => {
    const formattedTrack = {
      id: track.id,
      title: track.title,
      artist: track.poet,
      audio: track.audio,
      image: track.image,
    };
    playTrack(formattedTrack, [formattedTrack]);
  };

  const handleQuickActionPress = (screen) => {
    if (!signed) {
      setTargetScreen(screen);
      setShowAuthAlert(true);
    } else {
      navigation.navigate(screen);
    }
  };

  const handleAuthAlertConfirm = () => {
    setShowAuthAlert(false);
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleAuthAlertCancel = () => {
    setShowAuthAlert(false);
  };

  const handleAvatarPress = () => {
    if (!user) {
      setShowLoginAlert(true);
    } else {
      navigation.navigate('Profile');
    }
  };

  const renderIcon = (iconName, family) => {
    switch (family) {
      case 'AntDesign':
        return <AntDesign name={iconName} size={32} color="#f2f2d3" />;
      case 'Ionicons':
        return <Ionicons name={iconName} size={32} color="#f2f2d3" />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={32} color="#f2f2d3" />;
      default:
        return null;
    }
  };

  const renderContentSection = (title, data, renderItem, onSeeAll) => {
    // Veri kontrolü ekle
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log(`No data available for section: ${title}`);
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {onSeeAll && (
            <TouchableOpacity onPress={onSeeAll}>
              <Text style={styles.seeAll}>عرض الكل</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data.map((item, index) => {
            // Her bir öğe için null kontrolü
            if (!item) {
              console.log(`Invalid item at index ${index} in section ${title}`);
              return null;
            }
            return renderItem(item);
          })}
        </ScrollView>
      </View>
    );
  };

  const renderFeaturedItem = ({ item }) => {
    // Resim URL'sini kontrol et
    const imageUrl = item.image ? item.image : 'https://via.placeholder.com/200';
    console.log('Image URL:', imageUrl);

    return (
      <TouchableOpacity
        style={styles.featuredItem}
        onPress={() => {
          // ... navigation logic
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.featuredImage}
        />
        {/* ... rest of the component */}
      </TouchableOpacity>
    );
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.parallel([
      Animated.timing(searchWidth, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.parallel([
      Animated.timing(searchWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const handleSearch = () => {
    if (searchText.trim()) {
      navigation.navigate('SearchResults', { query: searchText.trim() });
      setSearchText('');
      handleSearchBlur();
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={loadContent}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                  <Image 
                  source={require('../../assets/logo.png')} 
                  style={styles.headerLogo} 
                />
              </View>
              <View style={styles.headerRight}>
                <View style={styles.searchContainer}>
                  <Animated.View style={[
                    styles.searchBar,
                    {
                      width: searchWidth.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width * 0.3],
                      }),
                      opacity: searchOpacity,
                    },
                  ]}>
                    <TextInput
                      style={styles.searchInput}
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholder="بحث..."
                      placeholderTextColor="rgba(242, 242, 211, 0.5)"
                      onSubmitEditing={handleSearch}
                      returnKeyType="search"
                    />
                  </Animated.View>
                  <Animated.View style={[
                    styles.searchIcon,
                    { transform: [{ rotate: spin }] }
                  ]}>
                    <TouchableOpacity onPress={handleSearchFocus}>
                      <Ionicons name="search" size={24} color="#f2f2d3" />
                </TouchableOpacity>
                  </Animated.View>
              </View>
                <TouchableOpacity 
                  style={styles.headerRight}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Ionicons name="notifications" size={24} color="#f2f2d3" />
                  {unreadNotifications > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Chat')}>
                  <Ionicons name="chatbubble-outline" size={24} color="#f2f2d3" />
                  {unreadMessages > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadMessages > 99 ? '99+' : unreadMessages}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.mainTitle}>التراث الموريتاني</Text>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleAvatarPress}
            >
              <LinearGradient
                colors={['rgba(242, 242, 211, 0.1)', 'rgba(242, 242, 211, 0.05)']}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <Image 
                    source={user?.avatar ? { uri: user.avatar } : require('../../assets/images/png-transparent-default-avatar-thumbnail.png')} 
                    style={styles.quickActionAvatar} 
                  />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>{user?.name || 'زائر'}</Text>
                  <Text style={styles.quickActionSubtitle}>الملف الشخصي</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => handleQuickActionPress('Playlists')}
            >
              <LinearGradient
                colors={['rgba(242, 242, 211, 0.1)', 'rgba(242, 242, 211, 0.05)']}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialIcons name="playlist-play" size={32} color="#f2f2d3" />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>المحفوظات</Text>
                  <Text style={styles.quickActionSubtitle}>المحتوى المحفوظ</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Categories section */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>التصنيفات</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate(category.screen)}
                >
                  {renderIcon(category.icon, category.iconFamily)}
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Featured Poets Section */}
          {renderContentSection(
            'الشعراء المميزون',
            featuredPoets,
            (poet) => (
                <TouchableOpacity
                  key={poet.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('PoetDetails', { poet })}
                >
                <ImageBackground source={{ uri: poet.image }} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.cardTitle}>{poet.name}</Text>
                    <Text style={styles.cardDescription}>{poet.bio}</Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
            ),
            () => navigation.navigate('Poets')
          )}

          {/* Popular Poems Section */}
          {renderContentSection(
            'القصائد المشهورة',
            popularPoems,
            (poem) => (
                <TouchableOpacity
                  key={poem.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('PoemDetails', { poem })}
                >
                <ImageBackground source={{ uri: poem.image }} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.cardTitle}>{poem.title}</Text>
                    <Text style={styles.cardPoet}>{poem.poet?.name}</Text>
                    <Text style={styles.cardDescription}>{poem.content?.substring(0, 100)}...</Text>
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => handlePlayTrack(poem)}
                      >
                        <Ionicons name="play-circle" size={40} color="#f2f2d3" />
                      </TouchableOpacity>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
            ),
            () => navigation.navigate('Poems')
          )}

          {/* Recent Albums Section */}
          {renderContentSection(
            'الألبومات الجديدة',
            recentAlbums,
            (album) => (
                <TouchableOpacity
                key={album.id}
                  style={styles.card}
                onPress={() => navigation.navigate('AlbumDetails', { album })}
                >
                <ImageBackground source={{ uri: album.image }} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                    <Text style={styles.cardTitle}>{album.title}</Text>
                    <Text style={styles.cardPoet}>{album.artist?.name}</Text>
                    <Text style={styles.cardDescription}>{album.description}</Text>
                    </LinearGradient>
                  </ImageBackground>
              </TouchableOpacity>
            ),
            () => navigation.navigate('Albums')
          )}

          {/* Featured Photos Section */}
          {renderContentSection(
            'الصور المميزة',
            featuredPhotos,
            (photo) => (
                <TouchableOpacity
                key={photo.id}
                  style={styles.card}
                onPress={() => navigation.navigate('PhotoDetails', { photo })}
                >
                <ImageBackground source={{ uri: photo.image }} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                    <Text style={styles.cardTitle}>{photo.title}</Text>
                    <Text style={styles.cardDescription}>{photo.description}</Text>
                    </LinearGradient>
                  </ImageBackground>
              </TouchableOpacity>
            ),
            () => navigation.navigate('Photos')
          )}

          {/* Featured Videos Section */}
          {renderContentSection(
            'الفيديوهات المميزة',
            featuredVideos,
            (video) => (
                <TouchableOpacity
                key={video.id}
                  style={styles.card}
                onPress={() => navigation.navigate('VideoDetails', { video })}
                >
                <ImageBackground source={{ uri: video.thumbnail }} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                    <Text style={styles.cardTitle}>{video.title}</Text>
                    <Text style={styles.cardDescription}>{video.description}</Text>
                    <TouchableOpacity style={styles.playButton}>
                      <Ionicons name="play-circle" size={40} color="#f2f2d3" />
                    </TouchableOpacity>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
            ),
            () => navigation.navigate('Videos')
          )}

        </ScrollView>
      </LinearGradient>

      <CustomAlert
        visible={showAuthAlert}
        title="تسجيل الدخول مطلوب"
        message="يجب تسجيل الدخول للوصول إلى هذه الميزة. هل تريد تسجيل الدخول الآن؟"
        type="warning"
        onConfirm={handleAuthAlertConfirm}
        onCancel={handleAuthAlertCancel}
      />

      <CustomAlert
        visible={showLoginAlert}
        title="تسجيل الدخول"
        message="يجب تسجيل الدخول للوصول إلى الملف الشخصي"
        confirmText="تسجيل الدخول"
        cancelText="إلغاء"
        type="info"
        onConfirm={() => {
          setShowLoginAlert(false);
          navigation.navigate('Auth', { screen: 'Login' });
        }}
        onCancel={() => setShowLoginAlert(false)}
      />
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
    backgroundColor: '#f2f2d3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    height: 100,
  },
  headerLeft: {
    width: 100,
    height: 100,
  },
  headerLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f2f2d3',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#f2f2d3',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f2f2d3',
    marginBottom: 20,
    textAlign: 'right',
    paddingRight: 20,
  },
  scrollView: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  quickActionButton: {
    width: width * 0.44,
    height: 90,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.1)',
  },
  quickActionGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    color: '#f2f2d3',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  quickActionSubtitle: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
  },
  categoriesContainer: {
    marginTop: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  categoryCard: {
    width: width * 0.43,
    height: height * 0.15,
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
    fontSize: 18,
    marginTop: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAll: {
    color: '#f2f2d3',
    opacity: 0.7,
  },
  card: {
    width: width * 0.8,
    height: height * 0.25,
    marginLeft: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  cardTitle: {
    color: '#f2f2d3',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardPoet: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
  },
  cardDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 10,
  },
  playButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  featuredItem: {
    width: width * 0.8,
    height: height * 0.25,
    marginLeft: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  quickActionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  searchBar: {
    height: 36,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 18,
    paddingHorizontal: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  searchInput: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 14,
    textAlign: 'right',
  },
  searchIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f2f2d3',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});

export default HomeScreen; 