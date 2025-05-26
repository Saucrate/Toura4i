import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Image, Animated, ScrollView, Dimensions } from 'react-native';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const defaultAvatar = require('../../../assets/images/png-transparent-default-avatar-thumbnail.png');

const SharedAlbumCard = ({ item, onPress }) => {
  const [albumDetails, setAlbumDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        if (item.isContentDeleted) {
          setAlbumDetails({ isDeleted: true });
          setLoading(false);
          return;
        }

        console.log('Fetching album details for ID:', item.contentId);
        const response = await api.get(`/api/albums/${item.contentId}`);
        console.log('Album details response:', response.data);
        setAlbumDetails(response.data);
      } catch (error) {
        console.error('Error fetching album details:', error);
        setAlbumDetails({ isDeleted: true });
      } finally {
        setLoading(false);
      }
    };

    if (item.contentId) {
      fetchAlbumDetails();
    }
  }, [item.contentId]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <View style={styles.sharedAlbumCard}>
        <ActivityIndicator color="#f2f2d3" />
      </View>
    );
  }

  if (albumDetails?.isDeleted) {
    return (
      <View style={[styles.sharedAlbumCard, styles.deletedContentCard]}>
        <View style={styles.deletedContentIcon}>
          <Ionicons name="albums-outline" size={24} color="#f2f2d3" />
        </View>
        <View style={styles.sharedAlbumContent}>
          <Text style={styles.sharedAlbumTitle}>{item.contentTitle || 'تم حذف هذا الألبوم'}</Text>
          <Text style={styles.sharedAlbumDescription}>{item.contentDescription || 'لم يعد هذا الألبوم متاحاً'}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.sharedAlbumCard}
      onPress={() => onPress && onPress(item.contentId)}
    >
      <Image
        source={{ uri: albumDetails?.image || 'https://via.placeholder.com/300' }}
        style={styles.sharedAlbumImage}
        resizeMode="cover"
      />
      <View style={styles.sharedAlbumContent}>
        <Text style={styles.sharedAlbumTitle}>{item.contentTitle}</Text>
        <Text style={styles.sharedAlbumArtist}>{albumDetails?.artist?.name}</Text>
        <View style={styles.sharedAlbumStats}>
          <View style={styles.sharedAlbumStat}>
            <Text style={styles.sharedAlbumStatValue}>{albumDetails?.tracks?.length || 0}</Text>
            <Text style={styles.sharedAlbumStatLabel}>مقاطع</Text>
          </View>
          <View style={styles.sharedAlbumStat}>
            <Text style={styles.sharedAlbumStatValue}>{formatDuration(albumDetails?.totalDuration || 0)}</Text>
            <Text style={styles.sharedAlbumStatLabel}>المدة</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SharedAudioCard = ({ item, onPress }) => {
  const [audioDetails, setAudioDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudioDetails = async () => {
      try {
        if (item.isContentDeleted) {
          setAudioDetails({ isDeleted: true });
          setLoading(false);
          return;
        }

        console.log('Fetching audio details for ID:', item.contentId);
        const response = await api.get(`/api/audio-recordings/${item.contentId}`);
        console.log('Audio details response:', response.data);
        setAudioDetails(response.data);
      } catch (error) {
        console.error('Error fetching audio details:', error);
        setAudioDetails({ isDeleted: true });
      } finally {
        setLoading(false);
      }
    };

    if (item.contentId) {
      fetchAudioDetails();
    }
  }, [item.contentId]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <View style={styles.sharedAudioCard}>
        <ActivityIndicator color="#f2f2d3" />
      </View>
    );
  }

  if (audioDetails?.isDeleted) {
    return (
      <View style={[styles.sharedAudioCard, styles.deletedContentCard]}>
        <View style={styles.deletedContentIcon}>
          <Ionicons name="musical-notes-outline" size={24} color="#f2f2d3" />
        </View>
        <View style={styles.sharedAudioContent}>
          <Text style={styles.sharedAudioTitle}>{item.contentTitle || 'تم حذف هذا التسجيل الصوتي'}</Text>
          <Text style={styles.sharedAudioDescription}>{item.contentDescription || 'لم يعد هذا التسجيل الصوتي متاحاً'}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.sharedAudioCard}
      onPress={() => onPress && onPress(item.contentId)}
    >
      <Image
        source={{ uri: audioDetails?.image || 'https://via.placeholder.com/300' }}
        style={styles.sharedAudioImage}
        resizeMode="cover"
      />
      <View style={styles.sharedAudioContent}>
        <Text style={styles.sharedAudioTitle}>{item.contentTitle}</Text>
        <Text style={styles.sharedAudioPerformer}>{audioDetails?.performer?.name}</Text>
        <View style={styles.sharedAudioStats}>
          <View style={styles.sharedAudioStat}>
            <Text style={styles.sharedAudioStatValue}>{formatDuration(audioDetails?.duration || 0)}</Text>
            <Text style={styles.sharedAudioStatLabel}>المدة</Text>
          </View>
          <View style={styles.sharedAudioStat}>
            <Text style={styles.sharedAudioStatValue}>{audioDetails?.views || 0}</Text>
            <Text style={styles.sharedAudioStatLabel}>المشاهدات</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SharedBookCard = ({ item, onPress }) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        if (item.isContentDeleted) {
          setBookDetails({ isDeleted: true });
          setLoading(false);
          return;
        }

        console.log('Fetching book details for ID:', item.contentId);
        const response = await api.get(`/api/books/${item.contentId}`);
        console.log('Book details response:', response.data);
        setBookDetails(response.data);
      } catch (error) {
        console.error('Error fetching book details:', error);
        setBookDetails({ isDeleted: true });
      } finally {
        setLoading(false);
      }
    };

    if (item.contentId) {
      fetchBookDetails();
    }
  }, [item.contentId]);

  if (loading) {
    return (
      <View style={styles.sharedBookCard}>
        <ActivityIndicator color="#f2f2d3" />
      </View>
    );
  }

  if (bookDetails?.isDeleted) {
    return (
      <View style={[styles.sharedBookCard, styles.deletedContentCard]}>
        <View style={styles.deletedContentIcon}>
          <Ionicons name="book-outline" size={24} color="#f2f2d3" />
        </View>
        <View style={styles.sharedBookContent}>
          <Text style={styles.sharedBookTitle}>{item.contentTitle || 'تم حذف هذا الكتاب'}</Text>
          <Text style={styles.sharedBookDescription}>{item.contentDescription || 'لم يعد هذا الكتاب متاحاً'}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.sharedBookCard}
      onPress={() => onPress && onPress(item.contentId)}
    >
      <Image
        source={{ uri: bookDetails?.cover || 'https://via.placeholder.com/300' }}
        style={styles.sharedBookImage}
        resizeMode="cover"
      />
      <View style={styles.sharedBookContent}>
        <Text style={styles.sharedBookTitle}>{item.contentTitle}</Text>
        <Text style={styles.sharedBookAuthor}>{bookDetails?.poet?.name}</Text>
        <View style={styles.sharedBookStats}>
          <View style={styles.sharedBookStat}>
            <Text style={styles.sharedBookStatValue}>{bookDetails?.year}</Text>
            <Text style={styles.sharedBookStatLabel}>السنة</Text>
          </View>
          <View style={styles.sharedBookStat}>
            <Text style={styles.sharedBookStatValue}>{bookDetails?.views || 0}</Text>
            <Text style={styles.sharedBookStatLabel}>المشاهدات</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SharedPlaceCard = ({ item, onPress }) => {
  const [placeDetails, setPlaceDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        if (item.isContentDeleted) {
          setPlaceDetails({ isDeleted: true });
          setLoading(false);
          return;
        }

        console.log('Fetching place details for ID:', item.contentId);
        const response = await api.get(`/api/places/${item.contentId}`);
        console.log('Place details response:', response.data);
        setPlaceDetails(response.data);
      } catch (error) {
        console.error('Error fetching place details:', error);
        setPlaceDetails({ isDeleted: true });
      } finally {
        setLoading(false);
      }
    };

    if (item.contentId) {
      fetchPlaceDetails();
    }
  }, [item.contentId]);

  if (loading) {
    return (
      <View style={styles.sharedPlaceCard}>
        <ActivityIndicator color="#f2f2d3" />
      </View>
    );
  }

  if (placeDetails?.isDeleted) {
    return (
      <View style={[styles.sharedPlaceCard, styles.deletedContentCard]}>
        <View style={styles.deletedContentIcon}>
          <Ionicons name="location-outline" size={24} color="#f2f2d3" />
        </View>
        <View style={styles.sharedPlaceContent}>
          <Text style={styles.sharedPlaceTitle}>{item.contentTitle || 'تم حذف هذا المكان'}</Text>
          <Text style={styles.sharedPlaceDescription}>{item.contentDescription || 'لم يعد هذا المكان متاحاً'}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.sharedPlaceCard}
      onPress={() => onPress && onPress(item.contentId)}
    >
      <Image
        source={{ uri: placeDetails?.media?.[0]?.url || 'https://via.placeholder.com/300' }}
        style={styles.sharedPlaceImage}
        resizeMode="cover"
      />
      <View style={styles.sharedPlaceContent}>
        <Text style={styles.sharedPlaceTitle}>{item.contentTitle}</Text>
        <Text style={styles.sharedPlaceLocation}>{placeDetails?.location}</Text>
        <View style={styles.sharedPlaceStats}>
          <View style={styles.sharedPlaceStat}>
            <Text style={styles.sharedPlaceStatValue}>{placeDetails?.year}</Text>
            <Text style={styles.sharedPlaceStatLabel}>العصر</Text>
          </View>
          <View style={styles.sharedPlaceStat}>
            <Text style={styles.sharedPlaceStatValue}>{placeDetails?.views || 0}</Text>
            <Text style={styles.sharedPlaceStatLabel}>المشاهدات</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SharedVideoCard = ({ item, onPress }) => {
  const [videoDetails, setVideoDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        if (item.isContentDeleted) {
          setVideoDetails({ isDeleted: true });
          setLoading(false);
          return;
        }

        console.log('Fetching video details for ID:', item.contentId);
        const response = await api.get(`/api/videos/${item.contentId}`);
        console.log('Video details response:', response.data);
        setVideoDetails(response.data);
      } catch (error) {
        console.error('Error fetching video details:', error);
        setVideoDetails({ isDeleted: true });
      } finally {
        setLoading(false);
      }
    };

    if (item.contentId) {
      fetchVideoDetails();
    }
  }, [item.contentId]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <View style={styles.sharedVideoCard}>
        <ActivityIndicator color="#f2f2d3" />
      </View>
    );
  }

  if (videoDetails?.isDeleted) {
    return (
      <View style={[styles.sharedVideoCard, styles.deletedContentCard]}>
        <View style={styles.deletedContentIcon}>
          <Ionicons name="videocam-off" size={24} color="#f2f2d3" />
        </View>
        <View style={styles.sharedVideoContent}>
          <Text style={styles.sharedVideoTitle}>{item.contentTitle || 'تم حذف هذا المحتوى'}</Text>
          <Text style={styles.sharedVideoDescription}>{item.contentDescription || 'لم يعد هذا المحتوى متاحاً'}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.sharedVideoCard}
      onPress={() => onPress && onPress(item.contentId)}
    >
      <Image
        source={{ uri: videoDetails?.thumbnail || 'https://via.placeholder.com/300' }}
        style={styles.sharedVideoImage}
        resizeMode="cover"
      />
      <View style={styles.sharedVideoContent}>
        <Text style={styles.sharedVideoTitle}>{item.contentTitle}</Text>
        <Text style={styles.sharedVideoPerformer}>{videoDetails?.person?.name}</Text>
        <View style={styles.sharedVideoStats}>
          <View style={styles.sharedVideoStat}>
            <Text style={styles.sharedVideoStatValue}>{formatDuration(videoDetails?.duration || 0)}</Text>
            <Text style={styles.sharedVideoStatLabel}>المدة</Text>
          </View>
          <View style={styles.sharedVideoStat}>
            <Text style={styles.sharedVideoStatValue}>{videoDetails?.views || 0}</Text>
            <Text style={styles.sharedVideoStatLabel}>المشاهدات</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SharedPoemCard = ({ item, onPress }) => {
  const [poemDetails, setPoemDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoemDetails = async () => {
      try {
        if (item.isContentDeleted) {
          setPoemDetails({ isDeleted: true });
          setLoading(false);
          return;
        }

        console.log('Fetching poem details for ID:', item.contentId);
        const response = await api.get(`/api/poems/${item.contentId}`);
        console.log('Poem details response:', response.data);
        setPoemDetails(response.data);
      } catch (error) {
        console.error('Error fetching poem details:', error);
        setPoemDetails({ isDeleted: true });
      } finally {
        setLoading(false);
      }
    };

    if (item.contentId) {
      fetchPoemDetails();
    }
  }, [item.contentId]);

  if (loading) {
    return (
      <View style={styles.sharedPoemCard}>
        <ActivityIndicator color="#f2f2d3" />
      </View>
    );
  }

  if (poemDetails?.isDeleted) {
    return (
      <View style={[styles.sharedPoemCard, styles.deletedContentCard]}>
        <View style={styles.deletedContentIcon}>
          <Ionicons name="book-outline" size={24} color="#f2f2d3" />
        </View>
        <View style={styles.sharedPoemContent}>
          <Text style={styles.sharedPoemTitle}>{item.contentTitle || 'تم حذف هذه القصيدة'}</Text>
          <Text style={styles.sharedPoemDescription}>{item.contentDescription || 'لم تعد هذه القصيدة متاحة'}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.sharedPoemCard}
      onPress={() => onPress && onPress(item.contentId)}
    >
      <Image
        source={{ uri: poemDetails?.image || 'https://via.placeholder.com/300' }}
        style={styles.sharedPoemImage}
        resizeMode="cover"
      />
      <View style={styles.sharedPoemContent}>
        <Text style={styles.sharedPoemTitle}>{item.contentTitle}</Text>
        <Text style={styles.sharedPoemPoet}>{poemDetails?.poet?.name}</Text>
        <View style={styles.sharedPoemStats}>
          <View style={styles.sharedPoemStat}>
            <Ionicons name="heart-outline" size={16} color="#f2f2d3" />
            <Text style={styles.sharedPoemStatValue}>{poemDetails?.likes?.length || 0}</Text>
          </View>
          <View style={styles.sharedPoemStat}>
            <Ionicons name="chatbubble-outline" size={16} color="#f2f2d3" />
            <Text style={styles.sharedPoemStatValue}>{poemDetails?.comments?.length || 0}</Text>
          </View>
          <View style={styles.sharedPoemStat}>
            <Ionicons name="eye-outline" size={16} color="#f2f2d3" />
            <Text style={styles.sharedPoemStatValue}>{poemDetails?.views || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SharedPhotoCard = ({ item, onPress, navigation }) => {
  const [photoDetails, setPhotoDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotoDetails = async () => {
      if (!item.contentId) {
        console.error('No contentId provided for photo');
        setLoading(false);
        return;
      }

      try {
        if (item.isContentDeleted) {
          setPhotoDetails({ isDeleted: true });
          setLoading(false);
          return;
        }

        console.log('Fetching photo details for ID:', item.contentId);
        const response = await api.get(`/api/photos/${item.contentId}`);
        console.log('Photo details response:', JSON.stringify(response.data, null, 2));
        
        const photoData = response.data?.data?.data || response.data?.data || response.data;
        console.log('Processed photo data:', JSON.stringify(photoData, null, 2));
        
        if (photoData) {
          setPhotoDetails(photoData);
        } else {
          console.error('No photo data found in response');
          setPhotoDetails({ isDeleted: true });
        }
      } catch (error) {
        console.error('Error fetching photo details:', error);
        setPhotoDetails({ isDeleted: true });
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoDetails();
  }, [item.contentId]);

  if (loading) {
    return (
      <View style={[styles.sharedPhotoCard, { backgroundColor: 'transparent' }]}>
        <ActivityIndicator color="#f2f2d3" />
      </View>
    );
  }

  if (photoDetails?.isDeleted) {
    return (
      <View style={[styles.sharedPhotoCard, styles.deletedContentCard]}>
        <View style={styles.deletedContentIcon}>
          <Ionicons name="image-outline" size={24} color="#f2f2d3" />
        </View>
        <View style={styles.sharedPhotoContent}>
          <Text style={styles.sharedPhotoTitle}>{item.contentTitle || 'تم حذف هذه الصورة'}</Text>
          <Text style={styles.sharedPhotoDescription}>{item.contentDescription || 'لم تعد هذه الصورة متاحة'}</Text>
        </View>
      </View>
    );
  }

  // Get the first image URL from the images array
  const imageUrl = photoDetails?.images?.[0]?.url || 'https://via.placeholder.com/300';
  const title = item.contentTitle || photoDetails?.title || 'صورة';
  const personName = photoDetails?.person?.name || 'غير معروف';
  const likesCount = photoDetails?.likes?.length || 0;
  const viewsCount = photoDetails?.views || 0;

  console.log('Rendering photo card with:', {
    imageUrl,
    title,
    personName,
    likesCount,
    viewsCount,
    photoDetails: photoDetails ? {
      id: photoDetails._id,
      title: photoDetails.title,
      person: photoDetails.person,
      likes: photoDetails.likes,
      views: photoDetails.views
    } : null,
    item: {
      contentId: item.contentId,
      contentTitle: item.contentTitle
    }
  });

  return (
    <TouchableOpacity 
      style={[styles.sharedPhotoCard, { backgroundColor: 'transparent' }]}
      onPress={() => {
        console.log('Photo card pressed:', {
          contentId: item.contentId,
          photoId: photoDetails?._id
        });
        onPress && onPress(item.contentId);
      }}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.sharedPhotoImage}
        resizeMode="cover"
      />
      <View style={styles.sharedPhotoContent}>
        <Text style={styles.sharedPhotoTitle}>{title}</Text>
        <Text style={styles.sharedPhotoPerson}>{personName}</Text>
        <View style={styles.sharedPhotoStats}>
          <View style={styles.sharedPhotoStat}>
            <Text style={styles.sharedPhotoStatValue}>{likesCount}</Text>
            <Text style={styles.sharedPhotoStatLabel}>إعجاب</Text>
          </View>
          <View style={styles.sharedPhotoStat}>
            <Text style={styles.sharedPhotoStatValue}>{viewsCount}</Text>
            <Text style={styles.sharedPhotoStatLabel}>المشاهدات</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ChatDetailScreen = ({ route, navigation }) => {
  const { userId, userName, userAvatar } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const flatListRef = useRef();
  const sendAnim = useRef(new Animated.Value(1)).current;
  const onlineCheckInterval = useRef(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/messages/${userId}`);
      console.log('Fetched messages:', JSON.stringify(res.data, null, 2));
      
      // Log shared content messages specifically
      const sharedMessages = res.data.filter(msg => msg.contentType === 'album');
      if (sharedMessages.length > 0) {
        console.log('Shared content messages:', JSON.stringify(sharedMessages, null, 2));
      }
      
      setMessages(res.data);
      await api.post(`/api/messages/${userId}/read`);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const checkOnlineStatus = async () => {
    try {
      const res = await api.get(`/api/users/${userId}/online-status`);
      setIsOnline(res.data.isOnline);
      setLastSeen(res.data.lastSeen);
    } catch (err) {
      console.error('Error checking online status:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    checkOnlineStatus();
    
    // Check online status every 30 seconds
    onlineCheckInterval.current = setInterval(checkOnlineStatus, 30000);

    return () => {
      if (onlineCheckInterval.current) {
        clearInterval(onlineCheckInterval.current);
      }
    };
  }, [userId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setSending(true);
    Animated.sequence([
      Animated.timing(sendAnim, { toValue: 1.2, duration: 120, useNativeDriver: true }),
      Animated.timing(sendAnim, { toValue: 1, duration: 120, useNativeDriver: true })
    ]).start();
    try {
      await api.post('/api/messages', { receiver: userId, content: input });
      setInput('');
      fetchMessages();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {}
    setSending(false);
  };

  const formatLastSeen = (date) => {
    if (!date) return '';
    const lastSeenDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffMinutes < 1440) return `منذ ${Math.floor(diffMinutes / 60)} ساعة`;
    return lastSeenDate.toLocaleDateString('ar-EG');
  };

  const renderMessage = ({ item }) => {
    if (item.contentType === 'poem') {
      return (
        <View style={[styles.messageRow, item.sender === user._id ? styles.myRow : styles.theirRow]}>
          <View style={[styles.messageBubble, item.sender === user._id ? styles.myMessage : styles.theirMessage]}>
            <SharedPoemCard 
              item={item} 
              onPress={(poemId) => {
                console.log('Navigating to poem details with ID:', poemId);
                navigation.navigate('PoemDetails', { poemId });
              }}
            />
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      );
    }

    if (item.contentType === 'album') {
      return (
        <View style={[styles.messageRow, item.sender === user._id ? styles.myRow : styles.theirRow]}>
          <View style={[styles.messageBubble, item.sender === user._id ? styles.myMessage : styles.theirMessage]}>
            <SharedAlbumCard 
              item={item} 
              onPress={(albumId) => {
                console.log('Navigating to album details with ID:', albumId);
                navigation.navigate('AlbumDetails', { albumId });
              }}
            />
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      );
    }

    if (item.contentType === 'audio') {
      return (
        <View style={[styles.messageRow, item.sender === user._id ? styles.myRow : styles.theirRow]}>
          <View style={[styles.messageBubble, item.sender === user._id ? styles.myMessage : styles.theirMessage]}>
            <SharedAudioCard 
              item={item} 
              onPress={(audioId) => {
                console.log('Navigating to audio recording details with ID:', audioId);
                navigation.navigate('AudioRecordingDetails', { recordingId: audioId });
              }}
            />
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      );
    }

    if (item.contentType === 'book') {
      return (
        <View style={[styles.messageRow, item.sender === user._id ? styles.myRow : styles.theirRow]}>
          <View style={[styles.messageBubble, item.sender === user._id ? styles.myMessage : styles.theirMessage]}>
            <SharedBookCard 
              item={item} 
              onPress={(bookId) => {
                console.log('Navigating to book details with ID:', bookId);
                navigation.navigate('BookDetails', { bookId });
              }}
            />
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      );
    }

    if (item.contentType === 'place') {
      return (
        <View style={[styles.messageRow, item.sender === user._id ? styles.myRow : styles.theirRow]}>
          <View style={[styles.messageBubble, item.sender === user._id ? styles.myMessage : styles.theirMessage]}>
            <SharedPlaceCard 
              item={item} 
              onPress={(placeId) => {
                console.log('Navigating to place details with ID:', placeId);
                navigation.navigate('PlaceDetails', { placeId });
              }}
            />
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      );
    }

    if (item.contentType === 'video') {
      return (
        <View style={[styles.messageRow, item.sender === user._id ? styles.myRow : styles.theirRow]}>
          <View style={[styles.messageBubble, item.sender === user._id ? styles.myMessage : styles.theirMessage]}>
            <SharedVideoCard 
              item={item} 
              onPress={(videoId) => {
                console.log('Navigating to video player with ID:', videoId);
                navigation.navigate('VideoPlayer', { videoId });
              }}
            />
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      );
    }

    if (item.contentType === 'photo') {
      console.log('Rendering photo message:', {
        contentId: item.contentId,
        contentTitle: item.contentTitle,
        sender: item.sender,
        user: user._id
      });
      
      return (
        <View style={[styles.messageRow, item.sender === user._id ? styles.myRow : styles.theirRow]}>
          <View style={[styles.messageBubble, item.sender === user._id ? styles.myMessage : styles.theirMessage]}>
            <SharedPhotoCard 
              item={item} 
              onPress={(photoId) => {
                console.log('Photo card pressed, navigating to details:', {
                  photoId,
                  routeName: 'PhotoDetails'
                });
                try {
                  navigation.navigate('PhotoDetails', { photoId });
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              navigation={navigation}
            />
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, item.sender === user._id ? styles.myRow : styles.theirRow]}>
        <View style={[styles.messageBubble, item.sender === user._id ? styles.myMessage : styles.theirMessage]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#232526' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#f2f2d3" />
        </TouchableOpacity>
        <Image
          source={userAvatar ? { uri: userAvatar } : defaultAvatar}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <TouchableOpacity onPress={() => navigation.navigate('UserDetails', { userId })}>
            <Text style={styles.headerName}>{userName}</Text>
          </TouchableOpacity>
          <View style={styles.onlineDotRow}>
            {isOnline ? (
              <>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>متصل الآن</Text>
              </>
            ) : (
              <Text style={styles.offlineText}>
                آخر ظهور: {formatLastSeen(lastSeen)}
              </Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.gradientBg} />
      {loading ? (
        <ActivityIndicator color="#f2f2d3" style={{ marginTop: 40 }} />
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={60} color="#aaa" style={{ marginBottom: 10 }} />
          <Text style={styles.emptyText}>لا توجد رسائل بعد</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        />
      )}
      <View style={styles.inputContainer}>
        <ScrollView 
          style={styles.inputScrollView}
          contentContainerStyle={styles.inputScrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <TextInput
          style={[styles.input, { height: Math.max(40, inputHeight) }]}
          value={input}
          onChangeText={setInput}
          placeholder="اكتب رسالة..."
          placeholderTextColor="#aaa"
          editable={!sending}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          multiline
          textAlign="right"
            textAlignVertical="top"
          onContentSizeChange={e => setInputHeight(e.nativeEvent.contentSize.height)}
        />
        </ScrollView>
        <Animated.View style={{ transform: [{ scale: sendAnim }] }}>
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessage} 
            disabled={sending || !input.trim()}
          >
            <Ionicons 
              name="send" 
              size={28} 
              color={input.trim() ? '#007AFF' : '#aaa'} 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#232526',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242,242,211,0.08)',
    zIndex: 2,
  },
  backButton: {
    marginLeft: 10,
    marginRight: 10,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#f2f2d3',
    backgroundColor: '#222',
  },
  headerInfo: {
    marginLeft: 14,
  },
  headerName: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  onlineDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4cd137',
    marginRight: 6,
  },
  onlineText: {
    color: '#4cd137',
    fontSize: 13,
    fontWeight: 'bold',
  },
  offlineText: {
    color: '#aaa',
    fontSize: 13,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: 'linear-gradient(180deg, #232526 0%, #414345 100%)',
  },
  messagesList: {
    padding: 18,
    paddingTop: 10,
    paddingBottom: 100,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  theirRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginHorizontal: 4,
    marginBottom: 2,
  },
  myMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  theirMessage: {
    backgroundColor: '#222',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    color: '#eee',
    fontSize: 12,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#232526',
    borderTopWidth: 1,
    borderTopColor: 'rgba(242,242,211,0.08)',
    maxHeight: 150,
  },
  inputScrollView: {
    flex: 1,
    maxHeight: 120,
  },
  inputScrollContent: {
    flexGrow: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    minHeight: 40,
    maxHeight: 100,
    textAlign: 'right',
  },
  sendButton: {
    padding: 8,
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sharedAlbumCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
  },
  sharedAlbumImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderRadius: 10,
  },
  sharedAlbumContent: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  sharedAlbumTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sharedAlbumArtist: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
    textAlign: 'right',
  },
  sharedAlbumStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  sharedAlbumStat: {
    alignItems: 'center',
  },
  sharedAlbumStatValue: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sharedAlbumStatLabel: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.8,
  },
  sharedAudioCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
  },
  sharedAudioImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderRadius: 10,
  },
  sharedAudioContent: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  sharedAudioTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sharedAudioPerformer: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
    textAlign: 'right',
  },
  sharedAudioStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  sharedAudioStat: {
    alignItems: 'center',
  },
  sharedAudioStatValue: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sharedAudioStatLabel: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.8,
  },
  sharedBookCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
  },
  sharedBookImage: {
    width: 100,
    height: 150,
    margin: 15,
    borderRadius: 10,
  },
  sharedBookContent: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  sharedBookTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sharedBookAuthor: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
    textAlign: 'right',
  },
  sharedBookStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  sharedBookStat: {
    alignItems: 'center',
  },
  sharedBookStatValue: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sharedBookStatLabel: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.8,
  },
  sharedPlaceCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
  },
  sharedPlaceImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderRadius: 10,
  },
  sharedPlaceContent: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  sharedPlaceTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sharedPlaceLocation: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
    textAlign: 'right',
  },
  sharedPlaceStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  sharedPlaceStat: {
    alignItems: 'center',
  },
  sharedPlaceStatValue: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sharedPlaceStatLabel: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.8,
  },
  sharedVideoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
  },
  sharedVideoImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderRadius: 10,
  },
  sharedVideoContent: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  sharedVideoTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sharedVideoPerformer: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
    textAlign: 'right',
  },
  sharedVideoStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  sharedVideoStat: {
    alignItems: 'center',
  },
  sharedVideoStatValue: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sharedVideoStatLabel: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.8,
  },
  sharedPoemCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
  },
  sharedPoemImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderRadius: 10,
  },
  sharedPoemContent: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  sharedPoemTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sharedPoemPoet: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
    textAlign: 'right',
  },
  sharedPoemStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  sharedPoemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sharedPoemStatValue: {
    color: '#f2f2d3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sharedPhotoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
  },
  sharedPhotoImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderRadius: 10,
  },
  sharedPhotoContent: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  sharedPhotoTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sharedPhotoPerson: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
    textAlign: 'right',
  },
  sharedPhotoStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  sharedPhotoStat: {
    alignItems: 'center',
  },
  sharedPhotoStatValue: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sharedPhotoStatLabel: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.8,
  },
  deletedContentCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deletedContentIcon: {
    width: 100,
    height: 100,
    margin: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharedVideoDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'right',
  },
  sharedAlbumDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'right',
  },
  sharedAudioDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'right',
  },
  sharedBookDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'right',
  },
  sharedPlaceDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'right',
  },
  sharedPoemDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'right',
  },
  sharedPhotoDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ChatDetailScreen; 