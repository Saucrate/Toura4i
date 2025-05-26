import React, { useState, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import defaultAvatar from '../../../assets/images/png-transparent-default-avatar-thumbnail.png';

const { width } = Dimensions.get('window');

const UserDetails = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [availableTabs, setAvailableTabs] = useState([]);
  const [messageStats, setMessageStats] = useState({
    text: 0,
    album: 0,
    audio: 0,
    book: 0,
    place: 0,
    poem: 0,
    video: 0,
    photo: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContent, setFilteredContent] = useState({});

  const loadUserDetails = async () => {
    try {
      setError(null);
      console.log('Loading user details for ID:', userId);
      
      const response = await api.get(`/api/users/${userId}`);
      const userData = response.data;
      console.log('User data received:', {
        id: userData._id,
        name: userData.name,
        followers: userData.followers,
        following: userData.following
      });
      
      if (currentUser) {
        const isUserFollowing = userData.followerUsers?.some(follower => 
          follower._id.toString() === currentUser._id.toString()
        );
        setIsFollowing(isUserFollowing);
        console.log('Follow status:', isUserFollowing);
      }
      
      setUser(userData);
      
      // Create tabs based on message stats
      const tabs = [
        { id: 'text', label: 'الرسائل النصية' },
        { id: 'album', label: 'الألبومات' },
        { id: 'audio', label: 'المقاطع الصوتية' },
        { id: 'book', label: 'الكتب' },
        { id: 'place', label: 'الأماكن' },
        { id: 'poem', label: 'القصائد' },
        { id: 'video', label: 'الفيديوهات' },
        { id: 'photo', label: 'الصور' }
      ];

      setAvailableTabs(tabs);
      setActiveTab('text');
    } catch (err) {
      console.error('Error loading user details:', err);
      if (err.response?.status === 404) {
        setError('المستخدم غير موجود');
      } else {
        setError('حدث خطأ أثناء تحميل تفاصيل المستخدم. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessageStats = async () => {
    try {
      if (!currentUser || !user) return;
      
      console.log('Fetching shared content for users:', {
        currentUser: currentUser._id,
        otherUser: user._id
      });
      
      const response = await api.get('/api/messages/shared-content', {
        params: {
          userId: currentUser._id,
          otherUserId: user._id
        }
      });
      
      console.log('Initial shared content response:', response.data);
      
      if (response.data) {
        // Her içerik türü için detaylı bilgileri getir
        const contentPromises = Object.entries(response.data).map(async ([type, items]) => {
          console.log(`Processing ${type} items:`, items);
          
          if (!items || items.length === 0) {
            console.log(`No items for type: ${type}`);
            return { type, items: [] };
    }

          const detailedItems = await Promise.all(items.map(async (item) => {
    try {
              let contentResponse;
              const endpoint = `/api/${type}s/${item.contentId}`;
              console.log(`Fetching details from: ${endpoint}`);
              
              switch (type) {
                case 'album':
                  contentResponse = await api.get(`/api/albums/${item.contentId}`);
                  break;
                case 'audio':
                  contentResponse = await api.get(`/api/audio-recordings/${item.contentId}`);
                  break;
                case 'book':
                  contentResponse = await api.get(`/api/books/${item.contentId}`);
                  break;
                case 'place':
                  contentResponse = await api.get(`/api/places/${item.contentId}`);
                  break;
                case 'poem':
                  contentResponse = await api.get(`/api/poems/${item.contentId}`);
                  break;
                case 'video':
                  contentResponse = await api.get(`/api/videos/${item.contentId}`);
                  break;
                case 'photo':
                  contentResponse = await api.get(`/api/photos/${item.contentId}`);
                  break;
                default:
                  console.log(`Unknown content type: ${type}`);
                  return item;
              }
              
              console.log(`Received details for ${type}:`, contentResponse.data);
              return {
                ...item,
                content: contentResponse.data
              };
            } catch (error) {
              console.error(`Error fetching ${type} details:`, error);
              return item;
            }
          }));

          console.log(`Completed processing ${type} items:`, detailedItems);
          return { type, items: detailedItems };
        });

        const detailedContent = await Promise.all(contentPromises);
        console.log('All detailed content:', detailedContent);
        
        const contentMap = detailedContent.reduce((acc, { type, items }) => {
          acc[type] = items;
          return acc;
        }, {});

        console.log('Final content map:', contentMap);
        setMessageStats(contentMap);
        
        // Create tabs based on shared content
        const tabs = Object.entries(contentMap)
          .filter(([_, items]) => items && items.length > 0)
          .map(([type, items]) => {
            let label = '';
            switch (type) {
              case 'text': label = 'نصوص'; break;
              case 'album': label = 'ألبومات'; break;
              case 'audio': label = 'تسجيلات'; break;
              case 'book': label = 'كتب'; break;
              case 'place': label = 'أماكن'; break;
              case 'poem': label = 'قصائد'; break;
              case 'video': label = 'فيديوهات'; break;
              case 'photo': label = 'صور'; break;
            }
            return { id: type, label: `${label} (${items.length})` };
          });

        console.log('Created tabs:', tabs);
        setAvailableTabs(tabs);
        if (tabs.length > 0) {
          setActiveTab(tabs[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading shared content:', error);
      setMessageStats({});
      setAvailableTabs([]);
    }
  };

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  useEffect(() => {
    if (user && currentUser && user._id && currentUser._id) {
      loadMessageStats();
    }
  }, [user, currentUser]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContent({});
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredContent({
      poems: user?.savedPoems?.filter(poem => 
        poem.title?.toLowerCase().includes(query) || 
        poem.content?.toLowerCase().includes(query)
      ),
      albums: user?.savedAlbums?.filter(album => 
        album.title?.toLowerCase().includes(query) || 
        album.artist?.name?.toLowerCase().includes(query)
      ),
      videos: user?.savedVideos?.filter(video => 
        video.title?.toLowerCase().includes(query) || 
        video.description?.toLowerCase().includes(query)
      )
    });
  }, [searchQuery, user]);

  const handleFollow = async () => {
    try {
      if (!currentUser) {
        navigation.navigate('Login');
        return;
      }

      const response = await api.post('/api/users/toggle-follow', {
        userId: user._id
      });

      if (response.data.status === 'success') {
        setIsFollowing(response.data.isFollowing);
        setUser(prev => ({
          ...prev,
          followers: response.data.followers,
          followerUsers: response.data.followerUsers || []
        }));
      }
    } catch (error) {
      console.error('Follow error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء محاولة المتابعة');
    }
  };

  const isMutualFollow = isFollowing && user?.followerUsers?.some(u => u._id === currentUser._id);

  const renderHeader = () => (
    <View>
      <View style={styles.profileSection}>
        <Image
          source={user?.avatar ? { uri: user.avatar } : defaultAvatar}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
            </Text>
          </TouchableOpacity>
          {isMutualFollow && (
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => navigation.navigate('ChatDetail', { userId: user._id, userName: user.name, userAvatar: user.avatar })}
            >
              <Ionicons name="chatbubble" size={22} color="#fff" />
              <Text style={styles.messageButtonText}>مراسلة</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.followers || 0}</Text>
          <Text style={styles.statLabel}>متابعون</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.following || 0}</Text>
          <Text style={styles.statLabel}>يتابع</Text>
        </View>
        
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

    const activeResults = messageStats[activeTab] || [];

    if (activeResults.length === 0) {
      return (
        <View style={styles.contentSection}>
          <Text style={styles.emptyText}>لا توجد محتويات مشتركة</Text>
      </View>
    );
    }

    const renderItem = ({ item }) => {
    switch (activeTab) {
        case 'poem':
          return (
                  <TouchableOpacity
              style={styles.poemCard}
              onPress={() => navigation.navigate('PoemDetails', { poemId: item.contentId })}
                  >
              <Image
                source={{ uri: item.content?.image || 'https://via.placeholder.com/300' }}
                style={styles.poemImage}
                defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
              />
              <View style={styles.poemInfo}>
                <Text style={styles.poemTitle}>{item.contentTitle}</Text>
                <TouchableOpacity 
                  style={styles.poetContainer}
                  onPress={() => navigation.navigate('PoetDetails', { poetId: item.content?.poet?._id })}
                >
                  <Image
                    source={{ uri: item.content?.poet?.image }}
                    style={styles.poetImage}
                    defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
                  />
                  <Text style={styles.poetName}>{item.content?.poet?.name}</Text>
                </TouchableOpacity>
                <Text style={styles.poemCategory}>{item.content?.category}</Text>
                <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                    <AntDesign name="heart" size={14} color="#e74c3c" />
                    <Text style={styles.statText}>{item.content?.likes?.length || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                    <AntDesign name="message1" size={14} color="#f2f2d3" />
                    <Text style={styles.statText}>{item.content?.comments?.length || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <AntDesign name="eye" size={14} color="#f2f2d3" />
                    <Text style={styles.statText}>{item.content?.views || 0}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
          );

        case 'album':
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('AlbumDetails', { albumId: item.contentId })}
            >
              <View style={styles.cardHeader}>
                {item.content?.artist && (
                  <TouchableOpacity 
                    style={styles.poetInfo}
                    onPress={() => navigation.navigate('PoetDetails', { poetId: item.content.artist._id })}
                  >
                    <View style={styles.poetImageContainer}>
                      <Image 
                        source={{ uri: item.content.artist.image || 'https://via.placeholder.com/40' }} 
                        style={styles.poetImage}
              />
                    </View>
                    <View style={styles.poetDetails}>
                      <Text style={styles.poetName}>{item.content.artist.name || 'بدون اسم'}</Text>
                    </View>
                  </TouchableOpacity>
            )}
          </View>

              <View style={styles.mediaContainer}>
                <Image
                  source={{ uri: item.content?.image || 'https://via.placeholder.com/300' }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              </View>

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
                <Text style={styles.likesCount}>{item.content?.likes?.length || 0} إعجاب</Text>
                <Text style={styles.content} numberOfLines={2}>{item.contentTitle}</Text>
                <View style={styles.albumStats}>
                  <Text style={styles.statText}>{item.content?.tracks?.length || 0} مقاطع</Text>
                  <Text style={styles.statText}>{new Date(item.content?.releaseDate).toLocaleDateString('ar-EG')}</Text>
                </View>
                <TouchableOpacity style={styles.commentsButton}>
                  <Text style={styles.viewComments}>
                    عرض التعليقات ({item.content?.comments?.length || 0})
                  </Text>
                </TouchableOpacity>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                </Text>
              </View>
            </TouchableOpacity>
          );

        case 'video':
          return (
                  <TouchableOpacity
                    style={styles.card}
              onPress={() => navigation.navigate('VideoPlayer', { 
                videoId: item.contentId,
                presentation: 'modal',
                animation: 'slide_from_bottom'
              })}
                  >
              <View style={styles.thumbnailContainer}>
                    <Image
                  source={{ uri: item.content?.thumbnail || 'https://via.placeholder.com/300' }}
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
                      source={{ uri: item.content?.person?.image || 'https://via.placeholder.com/40' }} 
                      style={styles.poetImage}
                    />
                  </View>
                  <View style={styles.poetDetails}>
                    <Text style={styles.poetName}>{item.content?.person?.name || 'مجهول'}</Text>
                  </View>
                </View>
                <Text style={styles.title}>{item.contentTitle}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.contentDescription}
                </Text>
                <View style={styles.metaInfo}>
                  <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString('ar-SA')}</Text>
                  <Text style={styles.metaText}>{item.content?.category}</Text>
                </View>
                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{item.content?.views || 0}</Text>
                    <Text style={styles.statLabel}>مشاهدات</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{item.content?.likesCount || 0}</Text>
                    <Text style={styles.statLabel}>إعجابات</Text>
                  </View>
                      </View>
                    </View>
                  </TouchableOpacity>
          );

        case 'audio':
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('AudioRecordingDetails', { 
                recordingId: item.contentId,
                presentation: 'modal',
                animation: 'slide_from_bottom'
              })}
            >
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: item.content?.image || item.content?.thumbnail || 'https://via.placeholder.com/300' }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.playIconContainer}>
                  <Ionicons name="play-circle" size={50} color="#f2f2d3" />
                </View>
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{item.contentTitle}</Text>
                {item.content?.performer && (
                  <TouchableOpacity 
                    style={styles.performerContainer}
                    onPress={() => navigation.navigate('PoetDetails', { poetId: item.content.performer._id })}
                  >
                    <View style={styles.performerImageContainer}>
                      <Image 
                        source={{ uri: item.content.performer.image || 'https://via.placeholder.com/32' }} 
                        style={styles.performerImage}
                      />
                    </View>
                    <Text style={styles.performer}>{item.content.performer.name || 'بدون اسم'}</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={16} color="#f2f2d3" />
                    <Text style={styles.statText}>{item.content?.views || 0}</Text>
          </View>
                  <Text style={styles.category}>{item.content?.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );

        case 'book':
          return (
                  <TouchableOpacity
              style={styles.bookCard}
              onPress={() => navigation.navigate('BookDetails', { bookId: item.contentId })}
                  >
                    <Image
                source={{ uri: item.content?.cover }}
                style={styles.bookCover}
                defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
                    />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.contentTitle}</Text>
                <TouchableOpacity 
                  style={styles.poetContainer}
                  onPress={() => navigation.navigate('PoetDetails', { poetId: item.content?.poet?._id })}
                >
                  <Image
                    source={{ uri: item.content?.poet?.image }}
                    style={styles.poetImage}
                    defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
                  />
                  <Text style={styles.poetName}>{item.content?.poet?.name}</Text>
                </TouchableOpacity>
                <Text style={styles.bookYear}>{item.content?.year}</Text>
                <Text style={styles.bookCategory}>{item.content?.category}</Text>
                <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                    <AntDesign name="heart" size={14} color="#e74c3c" />
                    <Text style={styles.statText}>{item.content?.likes?.length || 0}</Text>
                        </View>
                        <View style={styles.statItem}>
                    <AntDesign name="message1" size={14} color="#f2f2d3" />
                    <Text style={styles.statText}>{item.content?.comments?.length || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <AntDesign name="eye" size={14} color="#f2f2d3" />
                    <Text style={styles.statText}>{item.content?.views || 0}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
          );

        case 'place':
          return (
            <TouchableOpacity
              style={styles.placeCard}
              onPress={() => navigation.navigate('PlaceDetails', { placeId: item.contentId })}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: item.content?.media?.[0]?.url || 'https://via.placeholder.com/300' }}
                style={styles.placeImage}
                defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
              />
              {item.content?.media?.[0]?.type === 'video' && (
                <View style={styles.videoIndicator}>
                  <MaterialIcons name="play-circle-filled" size={24} color="#f2f2d3" />
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.cardGradient}
              >
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{item.contentTitle || 'موقع غير معروف'}</Text>
                  <Text style={styles.placeLocation}>{item.content?.location || 'موقع غير معروف'}</Text>
                  <Text style={styles.placeYear}>{item.content?.year}</Text>
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <AntDesign name="heart" size={14} color="#e74c3c" />
                      <Text style={styles.statText}>{item.content?.likesCount || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <AntDesign name="message1" size={14} color="#f2f2d3" />
                      <Text style={styles.statText}>{item.content?.comments?.length || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <AntDesign name="eye" size={14} color="#f2f2d3" />
                      <Text style={styles.statText}>{item.content?.views || 0}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );

        case 'photo':
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('PhotoDetails', { photoId: item.contentId })}
            >
              <View style={styles.cardHeader}>
                {item.content?.data?.person && (
                  <TouchableOpacity 
                    style={styles.poetInfo}
                    onPress={() => navigation.navigate('PoetDetails', { poetId: item.content.data.person._id })}
                  >
                    <View style={styles.poetImageContainer}>
                      <Image 
                        source={{ uri: item.content.data.person.image || 'https://via.placeholder.com/40' }} 
                        style={styles.poetImage}
                      />
                    </View>
                    <View style={styles.poetDetails}>
                      <Text style={styles.poetName}>{item.content.data.person.name || 'بدون اسم'}</Text>
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
                {item.content?.data?.images?.map((image) => (
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
                <Text style={styles.likesCount}>{item.content?.data?.likes?.length || 0} إعجاب</Text>
                <Text style={styles.content} numberOfLines={2}>{item.contentDescription}</Text>
                <TouchableOpacity style={styles.commentsButton}>
                  <Text style={styles.viewComments}>
                    عرض التعليقات ({item.content?.data?.comments?.length || 0})
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
        <TouchableOpacity style={styles.retryButton} onPress={loadUserDetails}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>لم يتم العثور على بيانات المستخدم</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserDetails}>
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
          <Text style={styles.headerTitle}>الملف الشخصي</Text>
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
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  username: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    textAlign: 'right',
  },
  followersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 201, 76, 0.15)',
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
    flex: 1,
  },
  poetImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.1)',
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
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
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
    backgroundColor: '#000',
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
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.1)',
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
    paddingVertical: 12,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
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
    marginTop: 4,
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
  username: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'right',
    marginBottom: 10,
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
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  albumStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 5,
  },
  statText: {
    color: '#f2f2d3',
    fontSize: 13,
    opacity: 0.8,
  },
});

export default UserDetails; 