import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shareExternally } from '../../utils/shareUtils';

const { width, height } = Dimensions.get('window');

const VideoPlayer = ({ route, navigation }) => {
  const { videoId } = route.params;
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [poetDetails, setPoetDetails] = useState(null);
  const scrollViewRef = React.useRef();
  const commentInputRef = React.useRef();

  useEffect(() => {
    loadVideo();
    loadComments();
  }, [videoId]);

  useEffect(() => {
    const checkVideoSavedStatus = async () => {
      try {
        const response = await api.get('/api/users/profile');
        if (response.data && response.data.savedVideos) {
          const isSaved = response.data.savedVideos.some(savedVideo => {
            const savedVideoId = typeof savedVideo === 'object' ? savedVideo._id : savedVideo;
            return savedVideoId === videoId;
          });
          setIsSaved(isSaved);
          console.log('Video saved state updated in useEffect:', { videoId, isSaved });
        }
      } catch (error) {
        console.error('Error checking video saved status:', error);
      }
    };

    if (user) {
      checkVideoSavedStatus();
    }
  }, [user, videoId]);

  useEffect(() => {
    const fetchPoetDetails = async () => {
      if (video?.person?._id) {
        try {
          const response = await api.get(`/api/poets/${video.person._id}`);
          setPoetDetails(response.data);
        } catch (error) {
          console.error('Error fetching poet details:', error);
        }
      }
    };

    fetchPoetDetails();
  }, [video?.person]);

  const handleAuthError = () => {
    try {
      // Clear any existing token
      api.defaults.headers.common['authorization'] = '';
      
      // Navigate to login
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Auth',
            params: {
              screen: 'Login',
              params: {
                redirectBack: true,
                redirectParams: { videoId }
              }
            }
          }
        ]
      });
    } catch (error) {
      console.error('Navigation error:', error);
      alert('يرجى تسجيل الدخول للمتابعة');
    }
  };

  const handleApiError = (error) => {
    console.error('API Error:', error);
    
    // Check for timeout error first
    if (error.code === 'ECONNABORTED') {
      alert('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى');
      return true;
    }

    // Check for auth error
    if (error.response?.status === 401 || 
        error.message?.includes('صلاحية') || 
        error.response?.data?.message?.includes('تسجيل الدخول')) {
      handleAuthError();
      return true;
    }

    // Show generic error message
    alert('حدث خطأ. يرجى المحاولة مرة أخرى');
    return false;
  };

  const loadVideo = async () => {
    try {
      // Ensure we have the latest token
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['authorization'] = `Bearer ${token}`;
      }

      console.log('Loading video with auth:', {
        videoId,
        hasToken: !!token,
        userId: user?._id
      });

      const response = await api.get(`/api/videos/${videoId}`, {
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
          'authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.data) {
        throw new Error('فيديو غير صالح');
      }
      
      // Kullanıcı giriş yapmışsa ve likes array'inde kullanıcının ID'si varsa isLiked true olacak
      const isLikedByUser = user && response.data.likes?.includes(user._id);
      
      setVideo(response.data);
      setIsLiked(isLikedByUser);

      // Check if video is saved
      if (user) {
        const profileResponse = await api.get('/api/users/profile');
        if (profileResponse.data && profileResponse.data.savedVideos) {
          const isSaved = profileResponse.data.savedVideos.some(savedVideo => {
            const savedVideoId = typeof savedVideo === 'object' ? savedVideo._id : savedVideo;
            return savedVideoId === videoId;
          });
          setIsSaved(isSaved);
          console.log('Video saved state updated in loadVideo:', { videoId, isSaved });
        }
      }
      
      console.log('Video loaded successfully:', {
        id: response.data._id,
        isLiked: isLikedByUser,
        likesCount: Array.isArray(response.data.likes) ? response.data.likes.length : 0,
        userLiked: isLikedByUser,
        views: response.data.views,
        userId: user?._id
      });
    } catch (err) {
      console.error('Video load error:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (!handleApiError(err)) {
        setError('حدث خطأ أثناء تحميل الفيديو');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await api.get(`/api/videos/${videoId}/comments`, {
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      if (response.data?.data) {
        // Kullanıcının like durumunu kontrol et ve isLiked özelliğini ekle
        const commentsWithLikes = response.data.data.map(comment => ({
          ...comment,
          isLiked: user ? comment.likes?.includes(user._id) : false,
          replies: comment.replies?.map(reply => ({
            ...reply,
            isLiked: user ? reply.likes?.includes(user._id) : false
          }))
        }));
        
        setComments(commentsWithLikes);
        console.log('Comments loaded:', commentsWithLikes.length);
      }
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleLike = async () => {
    try {
      if (!user) {
        handleAuthError();
        return;
      }

      // Önce UI'da anlık güncelleme yap
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setVideo(prev => ({
        ...prev,
        likes: newIsLiked 
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter(id => id !== user._id)
      }));

      // Sunucuya istek gönder
      const response = await api.post(`/api/videos/${videoId}/like`, {}, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      if (response.data?.success) {
        // Sunucudan gelen yanıta göre state'i güncelle
        setIsLiked(response.data.isLiked);
        setVideo(prev => ({
          ...prev,
          likes: response.data.likes || prev.likes,
          isLiked: response.data.isLiked
        }));
        console.log('Like toggled:', {
          isLiked: response.data.isLiked,
          likesCount: Array.isArray(response.data.likes) ? response.data.likes.length : 0
        });
      }
    } catch (err) {
      // Hata durumunda UI'ı eski haline getir
      setIsLiked(!isLiked);
      setVideo(prev => ({
        ...prev,
        likes: isLiked 
          ? [...(prev.likes || []), user?._id]
          : (prev.likes || []).filter(id => id !== user?._id)
      }));
      handleApiError(err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await api.post(
        `/api/videos/${videoId}/comments`, 
        {
          content: newComment.trim(),
          videoId: videoId,
          replyTo: replyTo?._id
        },
        {
          timeout: 30000, // 30 seconds timeout
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );

      console.log('Comment response:', response.data);

      // Check for success in response
      if (response.data?.success && response.data?.comment) {
        const commentData = response.data.comment;
        
        if (replyTo) {
          setComments(prevComments => 
            prevComments.map(comment => 
              comment._id === replyTo._id
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), commentData]
                  }
                : comment
            )
          );
          setReplyTo(null);
        } else {
          setComments(prev => [commentData, ...prev]);
        }
        
        setNewComment('');
      } else {
        console.error('Invalid comment response:', response.data);
        alert('حدث خطأ أثناء إضافة التعليق');
      }
    } catch (err) {
      console.error('Comment error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Check for specific error types
      if (err.response?.status === 401 || 
          err.response?.data?.message?.includes('تسجيل الدخول')) {
        handleAuthError();
      } else if (err.code === 'ECONNABORTED') {
        alert('يرجى المحاولة مرة أخرى. قد يستغرق الأمر بعض الوقت');
      } else {
        alert(err.response?.data?.message || 'حدث خطأ أثناء إضافة التعليق');
      }
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setNewComment('');
    // Scroll to the input
    setTimeout(() => {
      this.commentInput?.focus();
    }, 100);
  };

  const handleCommentLike = async (commentId, isReply = false) => {
    try {
      if (!user) {
        handleAuthError();
        return;
      }

      // Önce UI'da anlık güncelleme yap
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            const newIsLiked = !comment.isLiked;
            return {
              ...comment,
              isLiked: newIsLiked,
              likes: newIsLiked 
                ? [...(comment.likes || []), user._id]
                : (comment.likes || []).filter(id => id !== user._id)
            };
          }
          
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply._id === commentId) {
                  const newIsLiked = !reply.isLiked;
                  return {
                    ...reply,
                    isLiked: newIsLiked,
                    likes: newIsLiked 
                      ? [...(reply.likes || []), user._id]
                      : (reply.likes || []).filter(id => id !== user._id)
                  };
                }
                return reply;
              })
            };
          }
          
          return comment;
        })
      );

      // Sunucuya istek gönder
      const response = await api.post(`/api/comments/${commentId}/like`, {}, {
        timeout: 5000
      });
      
      if (response.data.success) {
        // Sunucudan gelen yanıta göre state'i güncelle
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                isLiked: response.data.isLiked,
                likes: response.data.likes
              };
            }
            
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply._id === commentId) {
                    return {
                      ...reply,
                      isLiked: response.data.isLiked,
                      likes: response.data.likes
                    };
                  }
                  return reply;
                })
              };
            }
            
            return comment;
          })
        );
      }
    } catch (err) {
      // Hata durumunda UI'ı eski haline getir
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked 
                ? comment.likes.filter(id => id !== user._id)
                : [...(comment.likes || []), user._id]
            };
          }
          
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply._id === commentId) {
                  return {
                    ...reply,
                    isLiked: !reply.isLiked,
                    likes: reply.isLiked 
                      ? reply.likes.filter(id => id !== user._id)
                      : [...(reply.likes || []), user._id]
                  };
                }
                return reply;
              })
            };
          }
          
          return comment;
        })
      );
      
      console.error('Error liking comment:', err);
      if (err.message.includes('صلاحية')) {
        handleAuthError();
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <TouchableOpacity onPress={() => {
          if (user && user._id === item.user._id) {
            navigation.navigate('Profile');
          } else {
            navigation.navigate('UserDetails', { userId: item.user._id });
          }
        }}>
          <Image
            source={{ uri: item.user?.avatar || item.user?.photo || 'https://via.placeholder.com/32' }}
            style={styles.commentAvatar}
          />
        </TouchableOpacity>
        <Text style={styles.commentAuthor}>{item.user?.name || 'مستخدم'}</Text>
        <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.commentText}>{item.content}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => handleCommentLike(item._id)}
        >
          <AntDesign 
            name={item.isLiked ? "heart" : "hearto"} 
            size={16} 
            color={item.isLiked ? "#ff2d55" : "#f2f2d3"} 
          />
          <Text style={styles.likeCount}>{item.likes?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.replyButton}
          onPress={() => handleReply(item)}
        >
          <Ionicons name="return-up-back" size={16} color="#f2f2d3" />
          <Text style={styles.replyButtonText}>رد</Text>
        </TouchableOpacity>
      </View>
      
      {item.replies?.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map(reply => (
            <View key={reply._id} style={styles.replyItem}>
              <View style={styles.commentHeader}>
                <TouchableOpacity onPress={() => {
                  if (user && user._id === reply.user._id) {
                    navigation.navigate('Profile');
                  } else {
                    navigation.navigate('UserDetails', { userId: reply.user._id });
                  }
                }}>
                  <Image
                    source={{ uri: reply.user?.avatar || reply.user?.photo || 'https://via.placeholder.com/24' }}
                    style={styles.replyAvatar}
                  />
                </TouchableOpacity>
                <Text style={styles.commentAuthor}>{reply.user?.name || 'مستخدم'}</Text>
                <Text style={styles.commentDate}>{formatDate(reply.createdAt)}</Text>
              </View>
              <Text style={styles.commentText}>{reply.content}</Text>
              <View style={styles.commentActions}>
          <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => handleCommentLike(reply._id)}
                >
                  <AntDesign 
                    name={reply.isLiked ? "heart" : "hearto"} 
                    size={16} 
                    color={reply.isLiked ? "#ff2d55" : "#f2f2d3"} 
                  />
                  <Text style={styles.likeCount}>{reply.likes?.length || 0}</Text>
          </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const onPlaybackStatusUpdate = (playbackStatus) => {
    setStatus(playbackStatus);
    setIsBuffering(playbackStatus.isBuffering);
    
    if (playbackStatus.error) {
      console.error('Video playback error:', playbackStatus.error);
      setError('حدث خطأ أثناء تشغيل الفيديو');
    }
  };

  const onVideoError = (error) => {
    console.error('Video loading error:', error);
    setError('تعذر تحميل الفيديو');
    setLoading(false);
  };

  const handleSavePress = async () => {
    try {
      if (!user) {
        Alert.alert(
          'تسجيل الدخول مطلوب',
          'يجب تسجيل الدخول لحفظ الفيديو',
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

      const response = await api.post(`/api/users/videos/${video._id}/toggle-save`);
      
      if (response.data && typeof response.data.isSaved === 'boolean') {
        // Update state immediately based on API response
        setIsSaved(response.data.isSaved);
        
        // Double check the saved state after reload
        const profileResponse = await api.get('/api/users/profile');
        if (profileResponse.data && profileResponse.data.savedVideos) {
          const isSaved = profileResponse.data.savedVideos.some(savedVideo => {
            const savedVideoId = typeof savedVideo === 'object' ? savedVideo._id : savedVideo;
            return savedVideoId === videoId;
          });
          setIsSaved(isSaved);
          console.log('Video saved state updated after toggle:', { videoId, isSaved });
        }
      }
    } catch (error) {
      console.error('Error saving video:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الفيديو');
    }
  };

  const handleSharePress = async () => {
    try {
      if (!user) {
        Alert.alert(
          'تسجيل الدخول مطلوب',
          'يجب تسجيل الدخول للمشاركة',
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

      try {
        await shareExternally('video', videoId, video.title, video.description);
      } catch (error) {
        console.error('Error sharing externally:', error);
      }
    } catch (err) {
      console.error('Share error:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء المشاركة');
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
        <TouchableOpacity style={styles.retryButton} onPress={loadVideo}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        {/* Video Player Section */}
        <View style={styles.videoWrapper}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
          <Video
            ref={videoRef}
            style={styles.video}
                source={{ uri: video?.video }}
            useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              />
              {isBuffering && (
                <View style={styles.bufferingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.bufferingText}>جاري التحميل...</Text>
                </View>
              )}
            </>
          )}
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Poet Information */}
          {video?.person && (
            <TouchableOpacity 
              style={styles.poetInfo}
              onPress={() => navigation.navigate('PoetDetails', { poetId: video.person._id })}
            >
              <View style={styles.poetImageContainer}>
                <Image 
                  source={{ uri: video.person.image || 'https://via.placeholder.com/40' }} 
                  style={styles.poetImage}
                  onError={(e) => console.log('Error loading poet image:', e.nativeEvent.error)}
                />
              </View>
              <View style={styles.poetDetails}>
                <Text style={styles.poetName}>{video.person.name || 'بدون اسم'}</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Video Title and Stats */}
          <View style={styles.videoInfo}>
            <Text style={styles.title}>{video?.title}</Text>
            <View style={styles.statsRow}>
              <Text style={styles.viewCount}>{video?.views || 0} مشاهدة</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleSavePress} style={styles.iconBtn}>
                  <Ionicons 
                    name={isSaved ? "bookmark" : "bookmark-outline"} 
                    size={22} 
                    color="#f2f2d3" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => {
                    if (!user) {
                      Alert.alert('تنبيه', 'يجب تسجيل الدخول للمشاركة مع المتابعين');
                      return;
                    }
                    navigation.navigate('ShareWithFollowers', {
                      contentType: 'video',
                      contentId: videoId,
                      title: video.title,
                      description: video.description
                    });
                  }}
                >
                  <Feather name="users" size={22} color="#f2f2d3" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSharePress} style={styles.iconBtn}>
                  <Feather name="share" size={22} color="#f2f2d3" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLike} style={styles.iconBtn}>
                  <AntDesign 
                    name={isLiked ? 'heart' : 'hearto'} 
                    size={22} 
                    color={isLiked ? '#e74c3c' : '#f2f2d3'} 
                  />
                  <Text style={styles.likeCount}>{Array.isArray(video?.likes) ? video.likes.length : 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{video?.description}</Text>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentsTitle}>التعليقات • {comments.length}</Text>
            </View>

            {/* Comment Input */}
            <View style={styles.commentInputWrapper}>
              <Image
                source={{ uri: user?.avatar || user?.photo || 'https://via.placeholder.com/32' }}
                style={styles.commentAvatar}
              />
              <View style={styles.inputContainer}>
                {replyTo && (
                  <View style={styles.replyingToContainer}>
                    <Text style={styles.replyingToText}>
                      رد على: {replyTo.user?.name || 'مستخدم'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setReplyTo(null)}
                    >
                      <Ionicons name="close" size={16} color="#f2f2d3" />
                    </TouchableOpacity>
                  </View>
                )}
                <TextInput
                  ref={commentInputRef}
                  style={styles.commentInput}
                  placeholder="أضف تعليقاً..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  placeholderTextColor="#999"
                  onFocus={() => {
                    setTimeout(() => {
                      commentInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                        scrollViewRef.current?.scrollTo({
                          y: pageY - 100,
                          animated: true
                        });
                      });
                    }, 100);
                  }}
                />
              </View>
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  !newComment.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={newComment.trim() ? "#065FD4" : "#999"} 
                />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView 
              style={styles.commentsList}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {comments.map((comment) => (
                <View key={comment._id} style={styles.commentItem}>
                  <TouchableOpacity onPress={() => {
                    if (user && user._id === comment.user._id) {
                      navigation.navigate('Profile');
                    } else {
                      navigation.navigate('UserDetails', { userId: comment.user._id });
                    }
                  }}>
                    <Image
                      source={{ uri: comment.user?.avatar || comment.user?.photo || 'https://via.placeholder.com/32' }}
                      style={styles.commentAvatar}
                    />
                  </TouchableOpacity>
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <TouchableOpacity onPress={() => {
                        if (user && user._id === comment.user._id) {
                          navigation.navigate('Profile');
                        } else {
                          navigation.navigate('UserDetails', { userId: comment.user._id });
                        }
                      }}>
                        <Text style={styles.commentAuthor}>{comment.user?.name || 'مستخدم'}</Text>
                      </TouchableOpacity>
                      <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity 
                        style={styles.commentAction}
                        onPress={() => handleCommentLike(comment._id)}
                      >
                        <Ionicons 
                          name={comment.isLiked ? "heart" : "heart-outline"} 
                          size={18} 
                          color={comment.isLiked ? "#ff2d55" : "#666"}
                        />
                        <Text style={[
                          styles.actionCount,
                          comment.isLiked && { color: '#ff2d55' }
                        ]}>
                          {comment.likes?.length || 0}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.commentAction}
                        onPress={() => handleReply(comment)}
                      >
                        <Ionicons name="return-up-back" size={18} color="#666" />
                        <Text style={styles.actionText}>رد</Text>
                      </TouchableOpacity>
        </View>

                    {/* Replies */}
                    {comment.replies?.length > 0 && (
                      <ScrollView 
                        style={styles.repliesList}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                      >
                        {comment.replies.map((reply) => (
                          <View key={reply._id} style={styles.replyItem}>
                            <TouchableOpacity onPress={() => {
                              if (user && user._id === reply.user._id) {
                                navigation.navigate('Profile');
                              } else {
                                navigation.navigate('UserDetails', { userId: reply.user._id });
                              }
                            }}>
                              <Image
                                source={{ uri: reply.user?.avatar || reply.user?.photo || 'https://via.placeholder.com/24' }}
                                style={styles.replyAvatar}
                              />
                            </TouchableOpacity>
                            <View style={styles.replyContent}>
                              <View style={styles.commentHeader}>
                                <TouchableOpacity onPress={() => {
                                  if (user && user._id === reply.user._id) {
                                    navigation.navigate('Profile');
                                  } else {
                                    navigation.navigate('UserDetails', { userId: reply.user._id });
                                  }
                                }}>
                                  <Text style={styles.commentAuthor}>{reply.user?.name || 'مستخدم'}</Text>
                                </TouchableOpacity>
                                <Text style={styles.commentTime}>{formatDate(reply.createdAt)}</Text>
                              </View>
                              <Text style={styles.commentText}>{reply.content}</Text>
          <TouchableOpacity
                                style={styles.commentAction}
                                onPress={() => handleCommentLike(reply._id, true)}
                              >
                                <Ionicons 
                                  name={reply.isLiked ? "heart" : "heart-outline"} 
                                  size={16} 
                                  color={reply.isLiked ? "#ff2d55" : "#666"}
                                />
                                <Text style={[
                                  styles.actionCount,
                                  reply.isLiked && { color: '#ff2d55' }
                                ]}>
                                  {reply.likes?.length || 0}
                                </Text>
          </TouchableOpacity>
        </View>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  videoInfo: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  viewCount: {
    color: '#aaa',
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 20,
  },
  likeCount: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
  },
  descriptionContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
  commentsSection: {
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#272727',
    borderRadius: 20,
    textAlign: 'right',
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentAuthor: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 8,
  },
  commentTime: {
    color: '#aaa',
    fontSize: 12,
  },
  commentText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'right',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionCount: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 4,
  },
  repliesSection: {
    marginTop: 12,
    paddingLeft: 20,
  },
  replyItem: {
    flexDirection: 'row',
    marginTop: 12,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  replyContent: {
    flex: 1,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingText: {
    color: '#fff',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
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
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    color: '#f2f2d3',
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  commentsList: {
    maxHeight: 300,
  },
  repliesList: {
    maxHeight: 200,
    marginTop: 12,
    paddingLeft: 20,
  },
  poetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default VideoPlayer; 