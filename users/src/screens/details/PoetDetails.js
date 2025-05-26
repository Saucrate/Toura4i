import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAudio } from '../../context/AudioContext';
import api from '../../services/api';
import PoemItem from '../../components/PoemItem';
import { useAuth } from '../../context/AuthContext';

const PoetDetails = ({ route, navigation }) => {
  const { poetId } = route.params;
  const [poet, setPoet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [poems, setPoems] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [audioRecordings, setAudioRecordings] = useState([]);
  const [books, setBooks] = useState([]);
  const [loadingContent, setLoadingContent] = useState({
    poems: false,
    albums: false,
    photos: false,
    videos: false,
    audioRecordings: false,
    books: false
  });
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();
  const [activeTab, setActiveTab] = useState(null);
  const [visiblePoemId, setVisiblePoemId] = useState(null);
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const flatListRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeMediaId, setActiveMediaId] = useState(null);
  const [availableTabs, setAvailableTabs] = useState([]);
  const { width } = Dimensions.get('window');
  const [showFullBio, setShowFullBio] = useState(false);

  const loadPoetDetails = async () => {
    try {
      setError(null);
      const response = await api.get(`/api/poets/${poetId}`);
      const { poet: poetData, contentTypes } = response.data;
      
      if (!poetData.followerUsers) {
        poetData.followerUsers = [];
      }
      
      if (user) {
        const isUserFollowing = poetData.followerUsers.some(follower => 
          follower._id.toString() === user._id.toString()
        );
        setIsFollowing(isUserFollowing);
      }
      
      setPoet(poetData);
      
      // Create tabs based on available content types
      const tabs = [];
      
      // Helper function to validate and format IDs
      const formatIds = (items) => {
        if (!items || !Array.isArray(items)) return [];
        return items
          .map(item => {
            if (typeof item === 'string') return item;
            if (item && item._id) return item._id.toString();
            return null;
          })
          .filter(id => id && id.length > 0);
      };

      if (contentTypes.hasPoems) {
        const poemIds = formatIds(poetData.poems);
        if (poemIds.length > 0) {
          tabs.push({ id: 'poems', label: 'القصائد' });
          await loadPoems(poemIds);
        }
      }
      
      if (contentTypes.hasAlbums) {
        const albumIds = formatIds(poetData.albums);
        if (albumIds.length > 0) {
          tabs.push({ id: 'albums', label: 'الألبومات' });
          await loadAlbums(albumIds);
        }
      }

      if (contentTypes.hasPhotos) {
        const photoIds = formatIds(poetData.photos);
        if (photoIds.length > 0) {
          tabs.push({ id: 'photos', label: 'الصور' });
          await loadPhotos(photoIds);
        }
      }

      if (contentTypes.hasVideos) {
        const videoIds = formatIds(poetData.videos);
        if (videoIds.length > 0) {
          tabs.push({ id: 'videos', label: 'الفيديوهات' });
          await loadVideos(videoIds);
        }
      }

      if (contentTypes.hasAudioRecordings) {
        const recordingIds = formatIds(poetData.audioRecordings);
        if (recordingIds.length > 0) {
          tabs.push({ id: 'audioRecordings', label: 'التسجيلات الصوتية' });
          await loadAudioRecordings(recordingIds);
        }
      }

      if (contentTypes.hasBooks) {
        const bookIds = formatIds(poetData.books);
        if (bookIds.length > 0) {
          tabs.push({ id: 'books', label: 'الكتب' });
          await loadBooks(bookIds);
        }
      }

      setAvailableTabs(tabs);
      if (tabs.length > 0) {
        setActiveTab(tabs[0].id);
      }
    } catch (err) {
      console.error('Error loading poet details:', err);
      setError('حدث خطأ أثناء تحميل تفاصيل الشاعر. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const loadPoems = async (poemIds) => {
    try {
      setLoadingContent(prev => ({ ...prev, poems: true }));
      if (poemIds.length === 0) {
          setPoems([]);
          return;
        }
        
        const response = await api.get('/api/poems/by-ids', {
        params: { ids: poemIds.join(',') }
        });
        
        const poemsData = response.data.poems || response.data || [];
        
        setPoems(poemsData.map(poem => ({
          ...poem,
          isSaved: user ? user.savedPoems?.some(id => id.toString() === poem._id.toString()) : false
        })));
    } catch (err) {
      console.error('Error loading poems:', err);
      setPoems([]);
    } finally {
      setLoadingContent(prev => ({ ...prev, poems: false }));
    }
  };

  const loadAlbums = async (albumIds) => {
    try {
      setLoadingContent(prev => ({ ...prev, albums: true }));
      if (albumIds.length === 0) {
        setAlbums([]);
        return;
      }

      const response = await api.get('/api/albums/by-ids', {
        params: { ids: albumIds.join(',') }
      });

        const albumsData = response.data.albums || response.data || [];
        const albumsWithDuration = albumsData.map(album => {
          let totalDuration = 0;
          if (album.tracks && album.tracks.length > 0) {
            totalDuration = album.tracks.reduce((total, track) => total + (track.duration || 0), 0);
          }
        return { ...album, totalDuration };
        });

        setAlbums(albumsWithDuration);
    } catch (err) {
      console.error('Error loading albums:', err);
      setAlbums([]);
    } finally {
      setLoadingContent(prev => ({ ...prev, albums: false }));
    }
  };

  const loadPhotos = async (photoIds) => {
    try {
      setLoadingContent(prev => ({ ...prev, photos: true }));
      if (!photoIds || photoIds.length === 0) {
        setPhotos([]);
        return;
      }

      // Ensure all IDs are valid strings
      const validPhotoIds = photoIds
        .map(id => {
          if (typeof id === 'string') return id;
          if (id && id._id) return id._id.toString();
          return null;
        })
        .filter(id => id && id.length > 0);

      if (validPhotoIds.length === 0) {
        setPhotos([]);
        return;
      }

      console.log('Loading photos with IDs:', validPhotoIds);
      const response = await api.get('/api/photos/by-ids', {
        params: { ids: validPhotoIds.join(',') }
      });

      const photosData = response.data.photos || response.data || [];
      console.log('Received photos data:', photosData);

      // Process photos data
      const processedPhotos = photosData.map(photo => ({
        ...photo,
        isLiked: user ? photo.likes?.includes(user._id) : false,
        isSaved: user ? photo.savedBy?.includes(user._id) : false
      }));

      setPhotos(processedPhotos);
    } catch (err) {
      console.error('Error loading photos:', err);
      console.error('Error details:', err.response?.data);
      setPhotos([]);
    } finally {
      setLoadingContent(prev => ({ ...prev, photos: false }));
    }
  };

  const loadVideos = async (videoIds) => {
    try {
      setLoadingContent(prev => ({ ...prev, videos: true }));
      if (videoIds.length === 0) {
        setVideos([]);
        return;
      }

      const response = await api.get('/api/videos/by-ids', {
        params: { ids: videoIds.join(',') }
      });
      setVideos(response.data.videos || response.data || []);
    } catch (err) {
      console.error('Error loading videos:', err);
      setVideos([]);
    } finally {
      setLoadingContent(prev => ({ ...prev, videos: false }));
    }
  };

  const loadAudioRecordings = async (recordingIds) => {
    try {
      setLoadingContent(prev => ({ ...prev, audioRecordings: true }));
      if (recordingIds.length === 0) {
        setAudioRecordings([]);
        return;
      }

      const response = await api.get('/api/audio-recordings/by-ids', {
        params: { ids: recordingIds.join(',') }
      });
      setAudioRecordings(response.data.recordings || response.data || []);
    } catch (err) {
      console.error('Error loading audio recordings:', err);
      setAudioRecordings([]);
    } finally {
      setLoadingContent(prev => ({ ...prev, audioRecordings: false }));
    }
  };

  const loadBooks = async (bookIds) => {
    try {
      setLoadingContent(prev => ({ ...prev, books: true }));
      if (bookIds.length === 0) {
        setBooks([]);
        return;
      }

      const response = await api.get('/api/books/by-ids', {
        params: { ids: bookIds.join(',') }
      });
      setBooks(response.data.books || response.data || []);
    } catch (err) {
      console.error('Error loading books:', err);
      setBooks([]);
    } finally {
      setLoadingContent(prev => ({ ...prev, books: false }));
    }
  };

  useEffect(() => {
    loadPoetDetails();
  }, [poetId, user]);

  useEffect(() => {
    if (poet && user) {
      const isUserFollowing = poet.followerUsers?.some(follower => 
        follower._id.toString() === user._id.toString()
      );
      setIsFollowing(isUserFollowing);
    }
  }, [poet, user]);

  useEffect(() => {
    if (user && poems.length > 0) {
      setPoems(poems.map(poem => ({
        ...poem,
        isSaved: user.savedPoems?.some(id => id.toString() === poem._id.toString()) || false
      })));
    }
  }, [user]);

  const handlePlayPress = (poem) => {
    const track = {
      id: poem._id,
      title: poem.title,
      artist: poet.name,
      audio: poem.audio,
      image: poem.image,
      duration: poem.duration,
    };

    if (currentTrack?.id === poem._id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const handleLike = async (poemId) => {
    try {
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      const response = await api.post('/api/likes/toggle', {
        targetType: 'poem',
        targetId: poemId
      });

      if (response.data.status === 'success') {
        const updatedPoems = poems.map(poem => {
          if (poem._id === poemId) {
            const isLiked = response.data.isLiked;
            const likes = isLiked 
              ? [...(poem.likes || []), user._id]
              : (poem.likes || []).filter(id => id !== user._id);

            return {
              ...poem,
              isLiked,
              likes,
              likesCount: likes.length
            };
          }
          return poem;
        });

        setPoems(updatedPoems);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleFollow = async () => {
    try {
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      const response = await api.post('/api/poets/toggle-follow', {
        poetId: poet._id
      });

      if (response.data.status === 'success') {
        // Update the follow state
        setIsFollowing(response.data.isFollowing);
        
        // Update the poet data with the new followers count and list
        setPoet(prev => ({
          ...prev,
          followers: response.data.followers,
          followerUsers: response.data.followerUsers || []
        }));

        // Log the response for debugging
        console.log('Follow response:', response.data);
      }
    } catch (error) {
      console.error('Follow error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء محاولة المتابعة');
    }
  };

  const handleMediaVisibility = (mediaId, isVisible) => {
    if (isVisible) {
      setActiveMediaId(mediaId);
      setIsPlaying(true);
    } else if (activeMediaId === mediaId) {
      setActiveMediaId(null);
      setIsPlaying(false);
    }
  };

  const handlePhotoLike = async (photoId) => {
    try {
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      const response = await api.post('/api/likes/toggle', {
        targetType: 'photo',
        targetId: photoId
      });

      if (response.data.status === 'success') {
        const updatedPhotos = photos.map(photo => {
          if (photo._id === photoId) {
            const isLiked = response.data.isLiked;
            const likes = isLiked 
              ? [...(photo.likes || []), user._id]
              : (photo.likes || []).filter(id => id !== user._id);

            return {
              ...photo,
              isLiked,
              likes,
              likesCount: likes.length
            };
          }
          return photo;
        });

        setPhotos(updatedPhotos);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handlePhotoSave = async (photoId) => {
    try {
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      const response = await api.post(`/api/users/photos/${photoId}/toggle-save`);

      if (response.data.status === 'success') {
        const updatedPhotos = photos.map(photo => {
          if (photo._id === photoId) {
            return {
              ...photo,
              isSaved: response.data.isSaved,
              savedBy: response.data.isSaved
                ? [...(photo.savedBy || []), user._id]
                : (photo.savedBy || []).filter(id => id !== user._id)
            };
          }
          return photo;
        });

        setPhotos(updatedPhotos);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AlbumDetails', { albumId: item._id })}
    >
      <View style={styles.thumbnailContainer}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300' }}
          style={styles.thumbnail}
        resizeMode="cover"
      />
        <View style={styles.playIconContainer}>
          <Ionicons name="play-circle" size={50} color="#f2f2d3" />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.releaseDate}>{new Date(item.releaseDate).toLocaleDateString('ar-EG')}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="musical-notes" size={16} color="#f2f2d3" />
            <Text style={styles.statText}>{item.tracks?.length || 0} مقاطع</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#f2f2d3" />
            <Text style={styles.statText}>{formatDuration(item.totalDuration || 0)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#f2f2d3" />
            <Text style={styles.statText}>{item.views || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPoemItem = ({ item }) => (
        <TouchableOpacity 
      style={styles.poemCard}
      onPress={() => navigation.navigate('PoemDetails', { poemId: item._id })}
        >
            <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/300' }}
        style={styles.poemImage}
        defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
      />
      <View style={styles.poemInfo}>
        <Text style={styles.poemTitle}>{item.title}</Text>
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

  const renderPhotoItem = ({ item }) => (
    <View style={styles.card}>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.mediaContainer}
      >
        {item.images && item.images.map((image, index) => (
          <TouchableOpacity
            key={image._id}
            style={[styles.mediaContainer, { width: width }]}
            onPress={() => navigation.navigate('PhotoDetails', { photoId: item._id })}
          >
            <Image
              source={{ uri: image.url }}
              style={[styles.photo, { width: width, height: 400 }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.postActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handlePhotoLike(item._id)}
          >
            <AntDesign 
              name={item.isLiked ? "heart" : "hearto"} 
              size={26} 
              color={item.isLiked ? "#ff3b30" : "#f2f2d3"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <AntDesign name="message1" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handlePhotoSave(item._id)}
        >
          <Ionicons
            name={item.isSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color="#f2f2d3"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.likesCount}>{item.likes?.length || 0} إعجاب</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{item.description}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('ar-EG')}
        </Text>
      </View>
    </View>
  );

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate('BookDetails', { bookId: item._id })}
    >
      <Image
        source={{ uri: item.cover }}
        style={styles.bookCover}
        defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookYear}>{item.year}</Text>
        <Text style={styles.bookCategory}>{item.category}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <AntDesign name="heart" size={14} color="#e74c3c" />
            <Text style={styles.statText}>{item.likesCount || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <AntDesign name="message1" size={14} color="#f2f2d3" />
            <Text style={styles.statText}>{item.commentsCount || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <AntDesign name="eye" size={14} color="#f2f2d3" />
            <Text style={styles.statText}>{item.views || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAudioRecordingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AudioRecordingDetails', { recordingId: item._id })}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/300' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.playIconContainer}>
          <Ionicons name="play-circle" size={50} color="#f2f2d3" />
        </View>
        <View style={styles.durationContainer}>
          <Text style={styles.duration}>{formatDuration(item.duration || 0)}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#f2f2d3" />
            <Text style={styles.statText}>{item.views || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={16} color="#f2f2d3" />
            <Text style={styles.statText}>{item.likes?.length || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color="#f2f2d3" />
            <Text style={styles.statText}>{item.comments?.length || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('VideoPlayer', { videoId: item._id })}
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
        <View style={styles.durationContainer}>
          <Text style={styles.duration}>{formatDuration(item.duration || 0)}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#f2f2d3" />
            <Text style={styles.statText}>{item.views || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={16} color="#f2f2d3" />
            <Text style={styles.statText}>{item.likes?.length || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color="#f2f2d3" />
            <Text style={styles.statText}>{item.comments?.length || 0}</Text>
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

  const handleScroll = (event) => {
    if (isScrolling) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const screenHeight = layoutMeasurement.height;
    const scrollPosition = contentOffset.y;
    const contentHeight = contentSize.height;

    // Calculate which poem should be visible
    const poemIndex = Math.floor(scrollPosition / screenHeight);
    if (poemIndex >= 0 && poemIndex < poems.length) {
      const newVisiblePoemId = poems[poemIndex]._id;
      if (newVisiblePoemId !== visiblePoemId) {
        setVisiblePoemId(newVisiblePoemId);
      }
    }
  };

  const handleScrollBegin = () => {
    setIsScrolling(true);
  };

  const handleScrollEnd = () => {
    setIsScrolling(false);
  };

  const renderHeader = () => (
    <View>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: poet?.image }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name} numberOfLines={1}>{poet?.name}</Text>
          <Text style={styles.period} numberOfLines={1}>{poet?.period}</Text>
          <Text style={styles.location} numberOfLines={1}>{poet?.location}</Text>
          <View style={styles.followSection}>
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
            </Text>
          </TouchableOpacity>
            <View style={styles.followersCount}>
              <Text style={styles.followersCountText}>
                {poet?.followerUsers?.length || 0} متابع
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{poet?.poems?.length || 0}</Text>
          <Text style={styles.statLabel}>القصائد</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{poet?.albums?.length || 0}</Text>
          <Text style={styles.statLabel}>الألبومات</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{poet?.videos?.length || 0}</Text>
          <Text style={styles.statLabel}>الفيديوهات</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{poet?.audioRecordings?.length || 0}</Text>
          <Text style={styles.statLabel}>التسجيلات</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{poet?.photos?.length || 0}</Text>
          <Text style={styles.statLabel}>الصور</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{poet?.books?.length || 0}</Text>
          <Text style={styles.statLabel}>الكتب</Text>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.sectionTitle}>نبذة عن الشخص</Text>
        <Text style={styles.bioText} numberOfLines={showFullBio ? undefined : 3}>{poet?.bio}</Text>
        {poet?.bio && poet.bio.length > 150 && (
          <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
            <Text style={styles.readMoreText}>
              {showFullBio ? 'عرض أقل' : 'عرض المزيد'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {availableTabs.map(tab => (
        <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
        >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
          </Text>
        </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderContent = () => {
    if (!activeTab) return null;

    const renderLoading = () => (
      <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f2f2d3" />
        </View>
      );

    switch (activeTab) {
      case 'poems':
        return loadingContent.poems ? renderLoading() : (
          <View style={styles.contentSection}>
            {poems.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={poems}
              renderItem={renderPoemItem}
              keyExtractor={(item) => item._id}
              onScroll={handleScroll}
              onScrollBeginDrag={handleScrollBegin}
              onScrollEndDrag={handleScrollEnd}
              onMomentumScrollEnd={handleScrollEnd}
              scrollEventThrottle={16}
                contentContainerStyle={styles.listContent}
              removeClippedSubviews={true}
              initialNumToRender={2}
              maxToRenderPerBatch={2}
              windowSize={2}
            />
          ) : (
            <Text style={styles.emptyText}>لا توجد قصائد متاحة</Text>
          )}
        </View>
      );

      case 'albums':
        return loadingContent.albums ? renderLoading() : (
          <View style={styles.contentSection}>
            {albums.length > 0 ? (
              <FlatList
                data={albums}
                renderItem={renderAlbumItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <Text style={styles.emptyText}>لا توجد ألبومات متاحة</Text>
            )}
          </View>
        );

      case 'photos':
        return loadingContent.photos ? renderLoading() : (
          <View style={styles.contentSection}>
            {photos.length > 0 ? (
              <FlatList
                data={photos}
                renderItem={renderPhotoItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <Text style={styles.emptyText}>لا توجد صور متاحة</Text>
            )}
          </View>
        );

      case 'videos':
        return loadingContent.videos ? renderLoading() : (
          <View style={styles.contentSection}>
            {videos.length > 0 ? (
              <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <Text style={styles.emptyText}>لا توجد فيديوهات متاحة</Text>
            )}
          </View>
        );

      case 'audioRecordings':
        return loadingContent.audioRecordings ? renderLoading() : (
          <View style={styles.contentSection}>
            {audioRecordings.length > 0 ? (
              <FlatList
                data={audioRecordings}
                renderItem={renderAudioRecordingItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <Text style={styles.emptyText}>لا توجد تسجيلات صوتية متاحة</Text>
            )}
          </View>
        );

      case 'books':
        return loadingContent.books ? renderLoading() : (
          <View style={styles.contentSection}>
            {books.length > 0 ? (
              <FlatList
                data={books}
                renderItem={renderBookItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <Text style={styles.emptyText}>لا توجد كتب متاحة</Text>
            )}
          </View>
        );

      default:
        return null;
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
        <TouchableOpacity style={styles.retryButton} onPress={loadPoetDetails}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!poet) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>لم يتم العثور على بيانات الشاعر</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPoetDetails}>
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
          <Text style={styles.headerTitle}>تفاصيل الشخص</Text>
        </View>

        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <>
              {renderHeader()}
              {renderContent()}
            </>
          )}
          keyExtractor={() => 'content'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    borderRadius: 15,
    marginHorizontal: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#f2f2d3',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: '#f2f2d3',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  period: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'right',
    marginBottom: 4,
  },
  location: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'right',
    marginBottom: 10,
  },
  followSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  followButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  followingButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
  },
  followButtonText: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#ffffff',
  },
  followersCount: {
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  followersCountText: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    borderRadius: 15,
    marginHorizontal: 15,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
  },
  bioSection: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    borderRadius: 15,
    marginHorizontal: 15,
  },
  sectionTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
  },
  bioText: {
    color: '#f2f2d3',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
  readMoreText: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'right',
    marginTop: 8,
  },
  tabsContainer: {
    marginBottom: 15,
    marginHorizontal: 15,
  },
  tabsScrollContent: {
    paddingRight: 15,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
  },
  tabText: {
    fontSize: 14,
    color: '#f2f2d3',
    opacity: 0.6,
  },
  activeTabText: {
    color: '#f2f2d3',
    fontWeight: 'bold',
    opacity: 1,
  },
  contentSection: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#f2f2d3',
    opacity: 0.6,
    marginTop: 20,
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
  card: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  thumbnailContainer: {
    width: '100%',
    height: 250,
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
  durationContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  duration: {
    color: '#f2f2d3',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  description: {
    color: '#f2f2d3',
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 15,
    textAlign: 'right',
    lineHeight: 22,
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    padding: 10,
    borderRadius: 10,
  },
  artistImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginLeft: 10,
    backgroundColor: '#2a2a2a',
  },
  artistImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  artistName: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.9,
    textAlign: 'right',
  },
  releaseDate: {
    color: '#f2f2d3',
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 15,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statText: {
    color: '#f2f2d3',
    fontSize: 14,
  },
  performerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    padding: 10,
    borderRadius: 10,
  },
  performerImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginLeft: 10,
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
    opacity: 0.9,
    textAlign: 'right',
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
  contentContainer: {
    marginBottom: 6,
  },
  content: {
    color: '#f2f2d3',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  date: {
    color: '#8e8e8e',
    fontSize: 11,
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
  poetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  poetImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    marginRight: 10,
  },
  poetDetails: {
    flex: 1,
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
  poemCategory: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    textAlign: 'right',
  },
});

export default PoetDetails; 