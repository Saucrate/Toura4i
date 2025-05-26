import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Share,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { Audio, Video } from 'expo-av';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shareWithFollowers, shareExternally, copyShareLink } from '../../utils/shareUtils';

const { width, height } = Dimensions.get('window');

const TrackItem = ({ item, isVisible, onPlayPause, onSave, isSaved, onIncrementPlayCount, album }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioLoadError, setAudioLoadError] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const soundRef = useRef(null);
  const videoRef = useRef(null);

  // Medya tipini kontrol et
  useEffect(() => {
    if (item.file) {
      const fileExtension = item.file.split('.').pop().toLowerCase();
      setIsVideo(['mp4', 'mov', 'avi', 'wmv'].includes(fileExtension));
    }
  }, [item.file]);

  // Ses yükleme işlemi
  const loadAudio = async () => {
    if (isLoadingAudio || !item.file || isVideo) return;
    
    try {
      setIsLoadingAudio(true);
      setAudioLoadError(false);
      console.log('Loading audio from:', item.file);
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.file },
        { shouldPlay: false },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              onPlayPause(item, 'next');
            }
          }
        }
      );
      
      soundRef.current = sound;
      setIsAudioLoaded(true);
      
      if (isVisible) {
        setTimeout(async () => {
          try {
            if (soundRef.current && isAudioLoaded) {
              await soundRef.current.playAsync();
              setIsPlaying(true);
              onIncrementPlayCount(item._id);
            }
          } catch (playError) {
            console.error('Error playing audio after load:', playError);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error loading audio for track:', item.title, error);
      setIsAudioLoaded(false);
      setAudioLoadError(true);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Video yükleme işlemi
  const loadVideo = async () => {
    if (!item.file || !isVideo) return;
    
    try {
      if (videoRef.current) {
        await videoRef.current.loadAsync(
          { uri: item.file },
          { shouldPlay: false },
          false
        );
      }
    } catch (error) {
      console.error('Error loading video:', error);
    }
  };
  
  // Otomatik oynatma için useEffect
  useEffect(() => {
    console.log('Track visibility changed:', { trackId: item._id, isVisible, title: item.title });
    
    const playMedia = async () => {
      try {
        if (isVisible) {
          if (isVideo) {
            if (videoRef.current) {
              await videoRef.current.playAsync();
              setIsPlaying(true);
              onIncrementPlayCount(item._id);
            }
          } else if (item.file) {
            if (!soundRef.current && !isLoadingAudio) {
              await loadAudio();
            } else if (soundRef.current && isAudioLoaded) {
                  await soundRef.current.playAsync();
                  setIsPlaying(true);
                  onIncrementPlayCount(item._id);
            }
          }
    } else {
          if (isVideo && videoRef.current) {
            await videoRef.current.pauseAsync();
            setIsPlaying(false);
          } else if (item.file && soundRef.current) {
              await soundRef.current.pauseAsync();
              setIsPlaying(false);
          }
        }
      } catch (error) {
        console.error('Media playback error for track:', item.title, error);
      }
    };
    
    playMedia();

    return () => {
      if (isVideo && videoRef.current) {
        videoRef.current.stopAsync();
      } else if (item.file && soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [isVisible]);

  const handleIncrementPlayCount = async () => {
    try {
      // Play count'u sadece bir kez artır ve user kontrolünü kaldır
      if (!isPlaying) {
        await onIncrementPlayCount(item._id);
      }
    } catch (err) {
      console.error('Error incrementing play count:', err);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isVideo) {
        if (videoRef.current) {
          if (isPlaying) {
            await videoRef.current.pauseAsync();
          } else {
            await videoRef.current.playAsync();
            handleIncrementPlayCount();
          }
          setIsPlaying(!isPlaying);
        }
      } else if (item.file) {
        if (!soundRef.current && !isLoadingAudio) {
          await loadAudio();
        } else if (soundRef.current && isAudioLoaded) {
            if (isPlaying) {
              await soundRef.current.pauseAsync();
            } else {
                  await soundRef.current.playAsync();
            handleIncrementPlayCount();
          }
          setIsPlaying(!isPlaying);
        }
      }
    } catch (error) {
      console.error('Playback error for track:', item.title, error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `استمع إلى ${item.title} في تطبيقنا`,
        title: item.title,
      });
    } catch (error) {
      console.error('Error sharing track:', error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleOpenPlayer = () => {
    setShowPlayerModal(true);
    if (isVideo) {
      loadVideo();
    } else {
      loadAudio();
    }
  };

  const handleClosePlayer = async () => {
    setShowPlayerModal(false);
    if (isVideo && videoRef.current) {
      await videoRef.current.pauseAsync();
    } else if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
    setIsPlaying(false);
  };

  return (
    <View style={styles.trackItemContainer}>
      <View style={styles.trackItem}>
        <View style={styles.trackHeader}>
          <Text style={styles.trackTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
          <View style={styles.durationBox}>
            <Ionicons name="time-outline" size={14} color="#f2f2d3" />
            <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
        </View>
          </View>

        <View style={styles.trackContent}>
          <TouchableOpacity 
            style={styles.mediaPreview}
            onPress={handleOpenPlayer}
          >
            {isVideo ? (
              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef}
                  source={{ uri: item.file }}
                  style={styles.videoPreview}
                  resizeMode="cover"
                  useNativeControls={false}
                  isLooping={false}
                />
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={24} color="#f2f2d3" />
                </View>
              </View>
            ) : (
              <View style={styles.audioContainer}>
          <Image 
            source={{ uri: item.image || album?.image }} 
            style={styles.trackImage}
          />
                <View style={styles.audioOverlay}>
                  <Ionicons name="play-circle" size={24} color="#f2f2d3" />
                </View>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.trackStats}>
            <View style={styles.playCountBox}>
              <Ionicons name="eye" size={14} color="#f2f2d3" />
              <Text style={styles.playCount}>{item.views || 0} مشاهدة</Text>
                </View>
          </View>
        </View>
      </View>

      {/* Player Modal */}
      <Modal
        visible={showPlayerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClosePlayer}
      >
        <View style={styles.modalContainer}>
          <View style={styles.playerModal}>
            <View style={styles.playerHeader}>
              <TouchableOpacity onPress={handleClosePlayer}>
                <Ionicons name="chevron-down" size={24} color="#f2f2d3" />
                    </TouchableOpacity>
              <Text style={styles.playerTitle} numberOfLines={1}>{item.title}</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.playerContent}>
              {isVideo ? (
                <Video
                  ref={videoRef}
                  source={{ uri: item.file }}
                  style={styles.fullVideo}
                  resizeMode="contain"
                  useNativeControls={true}
                  isLooping={false}
                  onPlaybackStatusUpdate={(status) => {
                    if (status.isLoaded) {
                      setIsPlaying(status.isPlaying);
                      if (status.didJustFinish) {
                        handleClosePlayer();
                      }
                    }
                  }}
                />
              ) : (
                <View style={styles.audioPlayerContent}>
                  <Image 
                    source={{ uri: item.image || album?.image }} 
                    style={styles.fullImage}
                  />
                  <View style={styles.audioWaveform}>
                    <Ionicons name="musical-notes" size={24} color="#f2f2d3" />
                  </View>
                </View>
              )}

              <View style={styles.playerControls}>
            <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => onPlayPause(item, 'prev')}
            >
                  <Ionicons name="play-skip-back" size={24} color="#f2f2d3" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.playButton}
              onPress={handlePlayPause}
                    >
              {isLoadingAudio ? (
                <ActivityIndicator size="small" color="#f2f2d3" />
              ) : (
                      <Ionicons
                        name={isPlaying ? "pause-circle" : "play-circle"}
                      size={50}
                        color="#f2f2d3"
                      />
              )}
                    </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.controlButton}
                  onPress={() => onPlayPause(item, 'next')}
                >
                  <Ionicons name="play-skip-forward" size={24} color="#f2f2d3" />
                    </TouchableOpacity>
          </View>
        </View>
      </View>
        </View>
      </Modal>
    </View>
  );
};

const CommentItem = ({ comment, onLike, onReply, isLiked, onShowReplies, showReplies, replies, navigation }) => {
  const { user } = useAuth();
  
  const handleLike = () => {
    if (!user) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول للتفاعل مع التعليقات');
      return;
    }
    onLike(comment._id);
  };
  
  const handleReply = () => {
    if (!user) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول للرد على التعليقات');
      return;
    }
    onReply(comment);
  };

  const handleUserPress = () => {
    if (comment.user._id === user?._id) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('UserDetails', { userId: comment.user._id });
    }
  };

  const getUserAvatar = (user) => {
    return user?.avatar || user?.photo || 'https://via.placeholder.com/40';
  };
  
  return (
    <View style={styles.commentBox}>
      <View style={styles.commentHeader}>
        <TouchableOpacity onPress={() => {
          if (user && user._id === comment.user._id) {
            navigation.navigate('Profile');
          } else {
            navigation.navigate('UserDetails', { userId: comment.user._id });
          }
        }}>
          <Image 
            source={{ uri: getUserAvatar(comment.user) }} 
            style={styles.commentAvatar}
            defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
          />
        </TouchableOpacity>
        <View style={styles.commentUserInfo}>
          <TouchableOpacity onPress={() => {
            if (user && user._id === comment.user._id) {
              navigation.navigate('Profile');
            } else {
              navigation.navigate('UserDetails', { userId: comment.user._id });
            }
          }}>
            <Text style={styles.commentUserName}>{comment.user?.name || 'مستخدم'}</Text>
          </TouchableOpacity>
          <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString('ar-SA')}</Text>
        </View>
      </View>
      <Text style={styles.commentText}>{comment.content}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity
          onPress={handleLike}
          style={styles.actionButton}
        >
          <AntDesign 
            name={comment.isLiked ? 'heart' : 'hearto'} 
            size={16} 
            color={comment.isLiked ? '#e74c3c' : '#f2f2d3'} 
          />
          <Text style={styles.actionText}>{comment.likes?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleReply}
          style={styles.actionButton}
        >
          <Feather name="message-circle" size={16} color="#f2f2d3" />
          <Text style={styles.actionText}>رد</Text>
        </TouchableOpacity>
      </View>
      {replies && replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {replies.map((reply) => (
            <View key={reply._id} style={[styles.replyBox, styles.replyBoxHighlight]}>
              <View style={styles.replyHeader}>
                <TouchableOpacity onPress={() => {
                  if (reply.user._id === user?._id) {
                    navigation.navigate('Profile');
                  } else {
                    navigation.navigate('UserDetails', { userId: reply.user._id });
                  }
                }}>
                  <Image 
                    source={{ uri: getUserAvatar(reply.user) }} 
                    style={styles.replyAvatar}
                    defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
                  />
                </TouchableOpacity>
                <View style={styles.replyUserInfo}>
                  <TouchableOpacity onPress={() => {
                    if (reply.user._id === user?._id) {
                      navigation.navigate('Profile');
                    } else {
                      navigation.navigate('UserDetails', { userId: reply.user._id });
                    }
                  }}>
                    <Text style={styles.replyUserName}>{reply.user?.name || 'مستخدم'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.replyDate}>{new Date(reply.createdAt).toLocaleDateString('ar-SA')}</Text>
                </View>
              </View>
              <Text style={styles.replyText}>{reply.content}</Text>
              <TouchableOpacity 
                onPress={() => onLike(reply._id)}
                style={styles.replyAction}
              >
                <AntDesign 
                  name={reply.isLiked ? 'heart' : 'hearto'} 
                  size={14} 
                  color={reply.isLiked ? '#e74c3c' : '#f2f2d3'} 
                />
                <Text style={styles.actionText}>{reply.likes?.length || 0}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const ReplyItem = ({ reply, onLike, isLiked }) => {
  const { user } = useAuth();
  
  const handleLike = () => {
    if (!user) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول للتفاعل مع الردود');
      return;
    }
    onLike(reply._id);
  };

  return (
    <View style={styles.replyItem}>
      <Image 
        source={{ uri: reply.user?.photo || 'https://via.placeholder.com/40' }} 
        style={styles.replyUserImage}
      />
      <View style={styles.replyContent}>
        <View style={styles.replyHeader}>
          <Text style={styles.replyUsername}>{reply.user?.name || 'مستخدم'}</Text>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
          >
            <AntDesign 
              name={isLiked ? "heart" : "hearto"} 
              size={16} 
              color={isLiked ? "#ff3b30" : "#f2f2d3"} 
            />
            <Text style={[
              styles.likeCount,
              isLiked && { color: '#ff3b30' }
            ]}>
              {reply.likes?.length || 0}
                </Text>
          </TouchableOpacity>
              </View>
        <Text style={styles.replyText}>{reply.content}</Text>
        <Text style={styles.replyDate}>
          {new Date(reply.createdAt).toLocaleDateString('ar-EG')}
        </Text>
      </View>
    </View>
  );
};

const AlbumDetails = ({ navigation, route }) => {
  const { albumId } = route.params;
  const { user, reloadUser } = useAuth();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [visibleTrackId, setVisibleTrackId] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isAlbumLiked, setIsAlbumLiked] = useState(false);
  const [isAlbumSaved, setIsAlbumSaved] = useState(false);
  const [savedTracks, setSavedTracks] = useState([]);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const flatListRef = useRef(null);
  const commentInputRef = useRef(null);

  useEffect(() => {
    loadAlbumDetails();
    loadUserPreferences();
    loadComments();
  }, [albumId]);

  useEffect(() => {
    const checkAlbumSavedStatus = async () => {
      try {
        const response = await api.get('/api/users/profile');
        if (response.data && response.data.savedAlbums) {
          const isSaved = response.data.savedAlbums.some(savedAlbum => {
            const savedAlbumId = typeof savedAlbum === 'object' ? savedAlbum._id : savedAlbum;
            return savedAlbumId === albumId;
          });
          setIsAlbumSaved(isSaved);
          console.log('Album saved state updated in useEffect:', { albumId, isSaved });
        }
      } catch (error) {
        console.error('Error checking album saved status:', error);
      }
    };

    if (user) {
      checkAlbumSavedStatus();
    }
  }, [user, albumId]);

  const loadUserPreferences = async () => {
    try {
      /* Saved endpoints are temporarily disabled
      // Kullanıcının kaydettiği şarkıları yükle
      const savedResponse = await api.get('/api/user/saved-tracks');
      
      if (savedResponse.data && savedResponse.data.tracks) {
        setSavedTracks(savedResponse.data.tracks.map(track => track._id));
      }
      */
      
      // Geçici olarak boş bir dizi kullan
      setSavedTracks([]);
      
      // Albüm beğeni durumunu kontrol et - is-liked endpoint'i yerine likes/check kullan
      const likeResponse = await api.get(`/api/likes/check/album/${albumId}`);
      if (likeResponse.data && likeResponse.data.isLiked) {
        setIsAlbumLiked(true);
      }
      
      // Check if the album is saved by looking at the user's savedAlbums array
      if (user && user.savedAlbums) {
        const isAlbumSaved = user.savedAlbums.some(id => id.toString() === albumId.toString());
        setIsAlbumSaved(isAlbumSaved);
      } else {
      setIsAlbumSaved(false);
      }
      
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
  };

  const loadAlbumDetails = async () => {
    try {
      setLoading(true);
      
      // Get token from AsyncStorage and set it in API headers
      const token = await AsyncStorage.getItem('@Toura4i:token');
      if (token) {
        api.defaults.headers.common['authorization'] = `Bearer ${token}`;
      }

      const response = await api.get(`/api/albums/${albumId}`);
      
      if (response.data) {
        const albumData = response.data;
        
        // Yorum sayısını doğru şekilde ayarla
        albumData.totalComments = albumData.comments ? albumData.comments.length : 0;
        
        // Beğeni sayısını doğru şekilde ayarla
        albumData.totalLikes = albumData.likes ? albumData.likes.filter(like => like !== null).length : 0;
        
        // Track'lerin play count'larını playedBy array'inden hesapla
        if (albumData.tracks) {
          albumData.tracks = albumData.tracks.map(track => ({
            ...track,
            playCount: track.playedBy ? track.playedBy.length : 0
          }));
        }
        
        // Toplam oynatma sayısını track'lerin toplamı olarak hesapla
        albumData.totalPlayCount = albumData.tracks ? 
          albumData.tracks.reduce((total, track) => total + (track.playCount || 0), 0) : 0;
        
        setAlbum(albumData);
        
        // Beğeni durumunu kontrol et
        if (user) {
          const likeResponse = await api.get(`/api/likes/check/album/${albumId}`);
          setIsAlbumLiked(likeResponse.data.isLiked);
          
          // Check if the album is saved by looking at the user's savedAlbums array
          const profileResponse = await api.get('/api/users/profile');
          if (profileResponse.data && profileResponse.data.savedAlbums) {
            const isAlbumSaved = profileResponse.data.savedAlbums.some(savedAlbum => {
              const savedAlbumId = typeof savedAlbum === 'object' ? savedAlbum._id : savedAlbum;
              return savedAlbumId === albumId;
            });
            setIsAlbumSaved(isAlbumSaved);
            console.log('Album saved state updated in loadAlbumDetails:', { albumId, isAlbumSaved });
          }
        }
      }
    } catch (error) {
      console.error('Album details error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل بيانات الألبوم');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlbumDetails();
    await loadUserPreferences();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      if (visibleItem.item._id !== visibleTrackId) {
        setVisibleTrackId(visibleItem.item._id);
        console.log('Görünür şarkı ID:', visibleItem.item._id, 'Başlık:', visibleItem.item.title);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
    waitForInteraction: true
  }).current;

  const handlePlayPause = (track, action = 'toggle') => {
    if (!album || !album.tracks) return;
    
    const tracks = album.tracks;
    let nextIndex = currentTrackIndex;
    
    if (action === 'next') {
      // Bir sonraki şarkıya geç
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    } else if (action === 'prev') {
      // Bir önceki şarkıya geç
      nextIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    }
    
    console.log('Playing track:', tracks[nextIndex].title, 'Index:', nextIndex);
    setCurrentTrackIndex(nextIndex);
    setVisibleTrackId(tracks[nextIndex]._id);
    
    // FlatList'i yeni şarkıya kaydır
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewPosition: 0.5
      });
    }
  };

  const handleSaveTrack = async (trackId) => {
    try {
      if (!user) {
        Alert.alert('تنبيه', 'يجب تسجيل الدخول لحفظ المقاطع');
        return;
      }
      
      /* Saved endpoints are temporarily disabled
      const response = await api.post(`/api/tracks/${trackId}/save`);
      
      if (response.data && response.data.success) {
        // Kaydetme durumunu güncelle
        if (savedTracks.includes(trackId)) {
          setSavedTracks(savedTracks.filter(id => id !== trackId));
        } else {
          setSavedTracks([...savedTracks, trackId]);
        }
      }
      */
      
      // Geçici olarak sadece UI'ı güncelle
      if (savedTracks.includes(trackId)) {
        setSavedTracks(savedTracks.filter(id => id !== trackId));
      } else {
        setSavedTracks([...savedTracks, trackId]);
      }
      
    } catch (err) {
      console.error('Error saving track:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ المقطع');
    }
  };

  const handleIncrementPlayCount = async (trackId) => {
    try {
      const response = await api.post(`/api/albums/${albumId}/tracks/${trackId}/view`, {
        useIP: true
      });
      
      if (response.data && response.data.success) {
        // Albüm verilerini güncelle
        setAlbum(prevAlbum => {
          if (!prevAlbum) return prevAlbum;
          
          const updatedTracks = prevAlbum.tracks.map(track => {
            if (track._id === trackId) {
              // Eğer track zaten görüntülenmişse view count'u artırma
              if (response.data.message === "Track already viewed from this IP") {
                return track;
              }
              // Yeni görüntüleme ise view count'u artır
              return {
                ...track,
                views: (track.views || 0) + 1
              };
            }
            return track;
          });
          
          // Toplam görüntülenme sayısını güncelle
          const totalViews = updatedTracks.reduce((total, track) => total + (track.views || 0), 0);
          
          return {
            ...prevAlbum,
            tracks: updatedTracks,
            totalViews
          };
        });
      }
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  const handleLikeAlbum = async () => {
    try {
      if (!user) {
        Alert.alert('تنبيه', 'يجب تسجيل الدخول للإعجاب بالألبوم');
        return;
      }
      
      const response = await api.post(`/api/albums/${albumId}/like`);
      
      if (response.data && response.data.success) {
        setIsAlbumLiked(!isAlbumLiked);
      }
    } catch (err) {
      console.error('Error liking album:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث حالة الإعجاب بالألبوم');
    }
  };

  const handleSaveAlbum = async () => {
    try {
      if (!user) {
        Alert.alert(
          'تسجيل الدخول مطلوب',
          'يجب تسجيل الدخول لحفظ الألبوم',
          [
            {
              text: 'تسجيل الدخول',
              onPress: () => navigation.navigate('Login')
            },
            {
              text: 'إلغاء',
              style: 'cancel'
            }
          ]
        );
        return;
      }
      
      const response = await api.post(`/api/users/albums/${albumId}/toggle-save`);
      
      if (response.data && typeof response.data.isSaved === 'boolean') {
        // Update state immediately based on API response
        setIsAlbumSaved(response.data.isSaved);
        
        // Reload user data to ensure consistency
        await reloadUser();
        
        // Double check the saved state after reload
        const updatedUser = await api.get('/api/users/profile');
        if (updatedUser.data && updatedUser.data.savedAlbums) {
          const isSaved = updatedUser.data.savedAlbums.some(savedAlbum => {
            const savedAlbumId = typeof savedAlbum === 'object' ? savedAlbum._id : savedAlbum;
            return savedAlbumId === albumId;
          });
          setIsAlbumSaved(isSaved);
          console.log('Album saved state updated after reload:', { albumId, isSaved });
        }
      }
    } catch (err) {
      console.error('Error saving album:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الألبوم');
    }
  };

  const handleShareAlbum = async () => {
    try {
      await Share.share({
        message: `استمع إلى ${album.title} في تطبيقنا`,
        title: album.title,
      });
    } catch (error) {
      console.error('Error sharing album:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const response = await api.get(`/api/comments/album/${albumId}`);
      
      if (response.data && response.data.data) {
        console.log('Comments response:', response.data.data);
        
        // Process comments and their likes
        const processedComments = response.data.data.map(comment => {
          // Process comment likes
          const commentLikes = comment.likes || [];
          const commentIsLiked = user ? commentLikes.some(like => 
            like._id?.toString() === user._id.toString() || like.toString() === user._id.toString()
          ) : false;
          
          // Process reply likes
          const processedReplies = (comment.replies || []).map(reply => {
            const replyLikes = reply.likes || [];
            const replyIsLiked = user ? replyLikes.some(like => 
              like._id?.toString() === user._id.toString() || like.toString() === user._id.toString()
            ) : false;
            
            return {
              ...reply,
              isLiked: replyIsLiked,
              likes: replyLikes,
              likesCount: replyLikes.length
            };
          });

          return {
          ...comment,
            isLiked: commentIsLiked,
            likes: commentLikes,
            likesCount: commentLikes.length,
            replies: processedReplies
          };
        });
        
        setComments(processedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLikeComment = async (commentId, isReply = false) => {
    try {
      if (!user) {
        Alert.alert('تنبيه', 'يجب تسجيل الدخول للتفاعل مع التعليقات');
        return;
      }

      const response = await api.post(`/api/comments/${commentId}/like`);
      
      if (response.data.status === 'success') {
        const { comment, isLiked } = response.data.data;
        
        setComments(prevComments => {
          return prevComments.map(prevComment => {
            if (prevComment._id === commentId) {
              return {
                ...prevComment,
                isLiked,
                likes: isLiked 
                  ? [...(prevComment.likes || []), user._id]
                  : (prevComment.likes || []).filter(id => id !== user._id)
              };
            }
            
            if (prevComment.replies) {
              return {
                ...prevComment,
                replies: prevComment.replies.map(reply => {
                  if (reply._id === commentId) {
                    return {
                      ...reply,
                      isLiked,
                      likes: isLiked
                        ? [...(reply.likes || []), user._id]
                        : (reply.likes || []).filter(id => id !== user._id)
                    };
                  }
                  return reply;
                })
              };
            }
            
            return prevComment;
          });
        });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الإعجاب');
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setNewComment('');
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  const handleAddComment = async () => {
    try {
      if (!user) {
        Alert.alert('تنبيه', 'يجب تسجيل الدخول لإضافة تعليق');
        return;
      }

      if (!newComment.trim()) {
        Alert.alert('خطأ', 'الرجاء إدخال تعليق');
        return;
      }

      const response = await api.post('/api/comments', {
        albumId: albumId,
        content: newComment,
        replyTo: replyingTo?._id
      });

      if (response.data.status === 'success') {
        const newCommentData = response.data.data;
        
        // Update comments list with the new comment
        if (replyingTo) {
          // If it's a reply, find the parent comment and add the reply
          setComments(prevComments => prevComments.map(comment => {
            if (comment._id === replyingTo._id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newCommentData]
              };
            }
            return comment;
          }));
        } else {
          // If it's a new comment, add it to the top
          setComments(prevComments => [{
            ...newCommentData,
            replies: []
          }, ...prevComments]);
        }

        setNewComment('');
        setReplyingTo(null);
        Keyboard.dismiss();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة التعليق');
    }
  };

  const toggleShowReplies = (commentId) => {
    setComments(prevComments => prevComments.map(comment => {
      if (comment._id === commentId) {
        return { ...comment, showReplies: !comment.showReplies };
      }
      return comment;
    }));
  };

  useEffect(() => {
    if (showCommentsModal) {
      loadComments();
    }
  }, [showCommentsModal]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleShareWithFollowers = () => {
    if (!user) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول للمشاركة مع المتابعين');
      return;
    }
    navigation.navigate('ShareWithFollowers', {
      contentType: 'album',
      contentId: albumId,
      title: album?.title,
      description: album?.description
    });
  };

  const handleShareExternally = async () => {
    try {
      await shareExternally('album', albumId, album?.title, album?.description);
    } catch (error) {
      console.error('Error sharing externally:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyShareLink('album', albumId);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const renderHeader = () => (
    <>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
        style={styles.headerContainer}
      >
        <Image
          source={{ uri: album?.image }}
          style={styles.albumImage}
          resizeMode="cover"
        />
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle} numberOfLines={2}>{album?.title}</Text>
          
          {album?.artist && (
            <TouchableOpacity 
              style={styles.poetButton}
              onPress={() => navigation.navigate('PoetDetails', { poetId: album.artist._id })}
            >
              <View style={styles.poetInfo}>
                <Image 
                  source={{ uri: album.artist.image || 'https://via.placeholder.com/40' }}
                  style={styles.poetImage}
                />
                <Text style={styles.poetName}>{album.artist.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#f2f2d3" />
            </TouchableOpacity>
          )}
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="eye" size={18} color="#f2f2d3" />
              <Text style={styles.statValue}>{album?.views || 0}</Text>
              <Text style={styles.statLabel}>المشاهدات</Text>
            </View>
            
            <View style={styles.statBox}>
              <Ionicons name="time" size={18} color="#f2f2d3" />
              <Text style={styles.statValue}>{formatDuration(album?.tracks?.reduce((total, track) => total + (track.duration || 0), 0) || 0)}</Text>
              <Text style={styles.statLabel}>المدة الكلية</Text>
            </View>
            
            <View style={styles.statBox}>
              <Ionicons name="heart" size={18} color="#f2f2d3" />
              <Text style={styles.statValue}>{album?.likes?.length || 0}</Text>
              <Text style={styles.statLabel}>الإعجابات</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.actionButtons}>
                <TouchableOpacity 
          style={[styles.actionButton, isAlbumLiked && styles.actionButtonActive]}
          onPress={handleLikeAlbum}
        >
          <AntDesign
            name={isAlbumLiked ? "heart" : "hearto"}
            size={24}
            color={isAlbumLiked ? "#ff3b30" : "#f2f2d3"}
          />
                </TouchableOpacity>
                <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleSaveAlbum}
        >
          <Ionicons
            name={isAlbumSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color="#f2f2d3"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (!user) {
              Alert.alert('تنبيه', 'يجب تسجيل الدخول للمشاركة مع المتابعين');
              return;
            }
            navigation.navigate('ShareWithFollowers', {
              contentType: 'album',
              contentId: albumId,
              title: album?.title,
              description: album?.description
            });
          }}
        >
          <Feather name="users" size={22} color="#f2f2d3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (!user) {
              Alert.alert('تنبيه', 'يجب تسجيل الدخول للمشاركة');
              return;
            }
            Share.share({
              message: `استمع إلى ${album?.title} في تطبيقنا`,
              title: album?.title,
            });
          }}
        >
          <Feather name="share" size={22} color="#f2f2d3" />
                </TouchableOpacity>
              </View>

      {album?.tracks && album.tracks.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>المقاطع</Text>
          </View>
        )}
    </>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>التعليقات ({comments.length})</Text>
      </View>

      {loadingComments ? (
        <ActivityIndicator size="small" color="#f2f2d3" style={styles.loadingComments} />
      ) : comments.length > 0 ? (
        comments.map((comment) => (
          <View key={comment._id} style={styles.commentSection}>
            <CommentItem
              comment={comment}
              onLike={handleLikeComment}
              onReply={() => handleReply(comment)}
              isLiked={comment.likes?.includes(user?._id)}
              onShowReplies={() => toggleShowReplies(comment._id)}
              showReplies={comment.showReplies}
              replies={comment.replies}
              navigation={navigation}
            />
            
            {comment.showReplies && comment.replies && comment.replies.length > 0 && (
              <View style={styles.repliesContainer}>
                {comment.replies.map((reply) => (
                  <ReplyItem
                    key={reply._id}
                    reply={reply}
                    onLike={() => handleLikeComment(reply._id, true)}
                    isLiked={reply.likes?.includes(user?._id)}
                  />
                ))}
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.noCommentsContainer}>
        <Text style={styles.noCommentsText}>لا توجد تعليقات بعد</Text>
        </View>
      )}
    </View>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadAlbumDetails}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!album) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f2f2d3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={album?.tracks || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TrackItem
            item={item}
            album={album}
            isVisible={item._id === visibleTrackId}
            onPlayPause={handlePlayPause}
            onSave={handleSaveTrack}
            isSaved={savedTracks.includes(item._id)}
            onIncrementPlayCount={handleIncrementPlayCount}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#f2f2d3"
          />
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            contentContainerStyle={{ paddingBottom: 80 }}
          />

          {user && (
            <View style={styles.commentInputWrapper}>
              <View style={styles.commentInputContainer}>
                {replyingTo && (
                  <View style={styles.replyingToContainer}>
                    <Text style={styles.replyingToText}>
                      الرد على {replyingTo.user?.name || 'مستخدم'}
                    </Text>
              <TouchableOpacity 
                onPress={() => setReplyingTo(null)}
                      style={styles.cancelReplyButton}
              >
                      <AntDesign name="close" size={16} color="#f2f2d3" />
              </TouchableOpacity>
            </View>
                )}
            <TextInput
                  ref={commentInputRef}
                  style={styles.commentInput}
                  placeholder={replyingTo ? "اكتب ردك..." : "اكتب تعليقك..."}
                  placeholderTextColor="#aaa"
              value={newComment}
              onChangeText={setNewComment}
                  multiline
              blurOnSubmit={false}
                  onSubmitEditing={handleAddComment}
                  textAlign="right"
            />
            <TouchableOpacity 
              onPress={handleAddComment}
                  style={styles.sendButton}
            >
                  <Feather name="send" size={22} color="#f2f2d3" />
            </TouchableOpacity>
              </View>
            </View>
          )}
          </View>
        </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  albumImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  albumInfo: {
    marginBottom: 25,
  },
  albumTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  albumArtist: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'left',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 5,
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
    borderRadius: 12,
  },
  actionButton: {
    marginRight: 25,
    padding: 10,
    borderRadius: 50,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderRadius: 50,
  },
  sectionHeader: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'left',
  },
  trackItemContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  trackItem: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  trackTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  trackStats: {
    flex: 1,
    alignItems: 'flex-end',
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trackDuration: {
    color: '#ffffff',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  playCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  playCount: {
    color: '#ffffff',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  footerContainer: {
    paddingBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 20,
  },
  commentInputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121212',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(242,242,211,0.1)',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242,242,211,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    margin: 15,
    marginTop: 0,
    borderWidth: 1,
    borderColor: 'rgba(242,242,211,0.1)',
  },
  commentInput: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
    textAlign: 'right',
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    padding: 10,
  },
  commentSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
  },
  commentBox: {
    backgroundColor: 'rgba(242,242,211,0.06)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#f2f2d3',
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUserName: {
    color: '#f2f2d3',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  commentDate: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
  },
  commentText: {
    color: '#f2f2d3', 
    fontSize: 15,
    textAlign: 'right',
    lineHeight: 22,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
  },
  repliesContainer: {
    marginTop: 12,
    marginRight: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(242,242,211,0.1)',
    paddingRight: 12,
  },
  replyBox: {
    backgroundColor: 'rgba(242,242,211,0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 6,
    borderWidth: 2,
    borderColor: '#f2f2d3',
  },
  replyUserInfo: {
    flex: 1,
  },
  replyUserName: {
    color: '#f2f2d3',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
  },
  replyDate: {
    color: '#f2f2d3',
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'right',
  },
  replyText: {
    color: '#f2f2d3',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 6,
    lineHeight: 20,
  },
  replyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },
  replyBoxHighlight: {
    backgroundColor: 'rgba(242,242,211,0.05)',
    borderLeftWidth: 2,
    borderLeftColor: '#f2f2d3',
    marginLeft: 20,
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noCommentsText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 15,
  },
  modalTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
  },
  replyInput: {
    color: '#f2f2d3',
    fontSize: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    textAlign: 'right',
    minHeight: 100,
  },
  addReplyButton: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addReplyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  poetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  poetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poetName: {
    color: '#f2f2d3',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  poetImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 8,
  },
  videoContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  playerModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  playerTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  playerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullVideo: {
    width: '100%',
    height: 300,
    marginBottom: 30,
  },
  fullImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 30,
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    padding: 10,
    marginHorizontal: 20,
  },
  audioContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  audioOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayerContent: {
    alignItems: 'center',
    marginBottom: 30,
  },
  audioWaveform: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(242,242,211,0.1)',
    padding: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242,242,211,0.1)',
  },
  replyingToText: {
    color: '#f2f2d3',
    fontSize: 14,
    textAlign: 'right',
  },
  cancelReplyButton: {
    padding: 4,
  },
});

export default AlbumDetails; 