import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Share,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Video } from 'expo-av';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { shareExternally } from '../../utils/shareUtils';

const { width, height } = Dimensions.get('window');

const PoemDetails = ({ route, navigation }) => {
  const { poemId } = route.params;
  const { user, isAuthenticated } = useAuth();
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comment, setComment] = useState('');
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [mediaType, setMediaType] = useState(null); // 'audio' or 'video'
  const [videoRef, setVideoRef] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const scrollViewRef = useRef();
  const commentInputRef = useRef();

  useEffect(() => {
    loadPoem();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [poemId]);

  useEffect(() => {
    if (poem) {
      loadMedia();
    }
  }, [poem]);

  const loadPoem = async () => {
    try {
      setLoading(true);
      console.log('Loading poem with ID:', poemId);
      
      // Get token from API headers
      const token = api.defaults.headers.common['authorization']?.split(' ')[1];
      console.log('Token from API headers:', token ? 'exists' : 'not found');

      console.log('Loading poem with auth:', {
        poemId,
        hasToken: !!token,
        userId: user?._id,
        isAuthenticated: !!isAuthenticated
      });

      const response = await api.get(`/api/poems/${poemId}`, {
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('Poem API response:', response.data);
      
      if (response.data) {
        const poemData = response.data;
        
        console.log('Setting poem data:', {
          id: poemData._id,
          title: poemData.title,
          views: poemData.views,
          likes: poemData.likes?.length,
          comments: poemData.comments?.length,
          isLiked: poemData.isLiked,
          isSaved: poemData.isSaved
        });
        
        setPoem(poemData);
        setIsLiked(poemData.isLiked);
        setIsSaved(poemData.isSaved);
        setComments(poemData.comments || []);
      } else {
        console.log('No poem data in response');
        setError('لم يتم العثور على القصيدة');
      }
    } catch (error) {
      console.error('Error loading poem:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
      setError('حدث خطأ أثناء تحميل القصيدة');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    if (poem?.audio) {
      setMediaType('audio');
      await loadAudio();
    } else if (poem?.videoUrl) {
      setMediaType('video');
    }
  };

  const handleLike = async () => {
    if (!user) {
      handleAuthError();
      return;
    }

    try {
      // Optimistic update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setPoem(prev => ({
        ...prev,
        likes: newIsLiked 
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter(id => id !== user._id)
      }));

      const response = await api.post(`/api/poems/${poemId}/like`, {}, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });

      if (response.data?.success) {
        // Update with server response
        setPoem(prev => ({
          ...prev,
          isLiked: response.data.isLiked,
          likes: response.data.likes || prev.likes
        }));
        console.log('Like toggled:', {
          isLiked: response.data.isLiked,
          likesCount: Array.isArray(response.data.likes) ? response.data.likes.length : 0
        });
      }
    } catch (err) {
      // Revert optimistic update on error
        setIsLiked(!isLiked);
        setPoem(prev => ({
          ...prev,
          likes: isLiked
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter(id => id !== user._id)
        }));
      handleApiError(err);
    }
  };

  const handleSave = async () => {
    if (!user) {
      handleAuthError();
      return;
    }

    try {
      // Optimistic update
      const newIsSaved = !isSaved;
      setIsSaved(newIsSaved);
      setPoem(prev => ({
        ...prev,
        isSaved: newIsSaved,
        savedBy: newIsSaved 
          ? [...(prev.savedBy || []), user._id]
          : (prev.savedBy || []).filter(id => id !== user._id)
      }));

      const response = await api.post(`/api/users/poems/${poemId}/toggle-save`, {}, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });

      if (response.data) {
        // Update with server response
        const serverIsSaved = response.data.isSaved;
        setIsSaved(serverIsSaved);
        setPoem(prev => ({
          ...prev,
          isSaved: serverIsSaved,
          savedBy: serverIsSaved 
            ? [...(prev.savedBy || []), user._id]
            : (prev.savedBy || []).filter(id => id !== user._id)
        }));
        
        console.log('Save toggled:', {
          isSaved: serverIsSaved,
          poemId,
          userId: user._id,
          response: response.data
        });
      }
    } catch (err) {
      // Revert optimistic update on error
      setIsSaved(!isSaved);
      setPoem(prev => ({
        ...prev,
        isSaved: !isSaved,
        savedBy: isSaved 
          ? [...(prev.savedBy || []), user._id]
          : (prev.savedBy || []).filter(id => id !== user._id)
      }));
      
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ القصيدة');
      }
    }
  };

  const handleComment = async () => {
    if (!user) {
      handleAuthError();
      return;
    }

    if (!comment.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة تعليق');
      return;
    }

    try {
      // Optimistic update
      const tempComment = {
        _id: Date.now().toString(),
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        text: comment.trim(),
        likes: [],
        replies: [],
        createdAt: new Date().toISOString()
      };

      if (replyTo) {
        setComments(prev => 
          prev.map(c => 
            c._id === replyTo._id
              ? { ...c, replies: [...(c.replies || []), tempComment] }
              : c
          )
        );
      } else {
        setComments(prev => [tempComment, ...prev]);
      }

      const response = await api.post(`/api/poems/${poemId}/comments`, {
        text: comment.trim(),
        replyTo: replyTo?._id
      }, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });

      if (response.data) {
        // Update with server response
        if (replyTo) {
          setComments(prev => 
            prev.map(c => 
              c._id === replyTo._id
                ? { 
                    ...c, 
                    replies: c.replies.map(r => 
                      r._id === tempComment._id ? response.data : r
                    )
                  }
                : c
            )
          );
        } else {
          setComments(prev => 
            prev.map(c => c._id === tempComment._id ? response.data : c)
          );
        }
        setComment('');
        setReplyTo(null);
      }
    } catch (err) {
      // Revert optimistic update on error
      if (replyTo) {
        setComments(prev => 
          prev.map(c => 
            c._id === replyTo._id
              ? { 
                  ...c, 
                  replies: c.replies.filter(r => r._id !== tempComment._id)
                }
              : c
          )
        );
      } else {
        setComments(prev => prev.filter(c => c._id !== tempComment._id));
      }
      handleApiError(err);
    }
  };

  const handleShare = async () => {
    try {
      const shareMessage = `${poem.title}\n\n${poem.content}\n\n${poem.poet?.name ? `بقلم: ${poem.poet.name}\n` : ''}مشاركة من تطبيق توراي`;
      
      const result = await Share.share({
        message: shareMessage,
        title: poem.title
      });

      if (result.action !== Share.dismissedAction) {
        // Log share event only if user actually shared
        try {
          await api.post(`/api/poems/${poemId}/share`, {}, {
            timeout: 5000,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            }
          });
        } catch (err) {
          console.error('Error logging share:', err);
          // Don't show error to user since sharing was successful
        }
      }
    } catch (err) {
      if (err.message !== 'User did not share') {
      Alert.alert('خطأ', 'حدث خطأ أثناء مشاركة القصيدة');
      }
    }
  };

  const loadAudio = async () => {
    if (!poem?.audio) {
      Alert.alert('تنبيه', 'لا يوجد تسجيل صوتي لهذه القصيدة');
      return;
    }

    try {
      setIsLoadingAudio(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: poem.audio },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      const status = await newSound.getStatusAsync();
      setDuration(status.durationMillis);
    } catch (error) {
      console.error('Error loading audio:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل التسجيل الصوتي');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayback = async () => {
    if (mediaType === 'audio') {
    if (!sound) {
      await loadAudio();
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
        console.error('Error toggling audio playback:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تشغيل/إيقاف التسجيل الصوتي');
      }
    } else if (mediaType === 'video' && videoRef) {
      try {
        if (isPlaying) {
          await videoRef.pauseAsync();
        } else {
          await videoRef.playAsync();
        }
      } catch (error) {
        console.error('Error toggling video playback:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء تشغيل/إيقاف الفيديو');
      }
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setComment('');
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

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
                redirectParams: { poemId }
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

  const handleCommentLike = async (commentId, isReply = false, replyId = null) => {
    if (!user) {
      handleAuthError();
      return;
    }

    try {
      // Optimistic update
      setComments(prev => 
        prev.map(comment => {
          if (comment._id === commentId) {
            if (isReply && replyId) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply._id === replyId) {
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
            } else {
              const newIsLiked = !comment.isLiked;
              return {
                ...comment,
                isLiked: newIsLiked,
                likes: newIsLiked 
                  ? [...(comment.likes || []), user._id]
                  : (comment.likes || []).filter(id => id !== user._id)
              };
            }
          }
          return comment;
        })
      );

      const response = await api.post(`/api/poems/${poemId}/comments/like`, {
        commentId,
        replyId
      }, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });

      if (response.data?.success) {
        // Update with server response
        setComments(prev => 
          prev.map(comment => {
            if (comment._id === commentId) {
              if (isReply && replyId) {
                return {
                  ...comment,
                  replies: comment.replies.map(reply => {
                    if (reply._id === replyId) {
                      return {
                        ...reply,
                        isLiked: response.data.isLiked,
                        likes: response.data.likes
                      };
                    }
                    return reply;
                  })
                };
              } else {
                return {
                  ...comment,
                  isLiked: response.data.isLiked,
                  likes: response.data.likes
                };
              }
            }
            return comment;
          })
        );
      }
    } catch (err) {
      // Revert optimistic update on error
      setComments(prev => 
        prev.map(comment => {
          if (comment._id === commentId) {
            if (isReply && replyId) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply._id === replyId) {
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
            } else {
              const newIsLiked = !comment.isLiked;
              return {
                ...comment,
                isLiked: newIsLiked,
                likes: newIsLiked 
                  ? [...(comment.likes || []), user._id]
                  : (comment.likes || []).filter(id => id !== user._id)
              };
            }
          }
          return comment;
        })
      );
      handleApiError(err);
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
        <TouchableOpacity style={styles.retryButton} onPress={loadPoem}>
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
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل القصيدة</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroSection}>
          <Image
            source={{ uri: poem?.image || 'https://via.placeholder.com/300' }}
            style={styles.poemImage}
          />
            <LinearGradient
              colors={['transparent', '#000000']}
              style={styles.imageGradient}
            />
          <View style={styles.poemInfo}>
              {(poem?.audio || poem?.videoUrl) && (
                <TouchableOpacity
                  style={[styles.playButton, isPlaying && styles.playingButton]}
                  onPress={togglePlayback}
                  disabled={isLoadingAudio}
                >
                  {isLoadingAudio ? (
                    <ActivityIndicator size="small" color="#f2f2d3" />
                  ) : (
                    <FontAwesome
                      name={isPlaying ? 'pause-circle' : 'play-circle'}
                      size={50}
                      color="#f2f2d3"
                    />
                  )}
                </TouchableOpacity>
              )}
              {poem?.poet && (
                <TouchableOpacity 
                  style={styles.poetContainer}
                  onPress={() => navigation.navigate('PoetDetails', { poetId: poem.poet._id })}
                >
                  <View style={styles.poetImageContainer}>
                    <Image 
                      source={{ uri: poem.poet.image || 'https://via.placeholder.com/32' }} 
                      style={styles.poetImage}
                    />
                  </View>
                  <View style={styles.poetInfo}>
                    <Text style={styles.poetName}>{poem.poet.name || 'بدون اسم'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#f2f2d3" style={styles.chevronIcon} />
                </TouchableOpacity>
              )}
                </View>
          </View>

          <View style={styles.details}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{poem?.title}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="eye-outline" size={18} color="#f2f2d3" />
                <Text style={styles.statValue}>{poem?.views || 0}</Text>
                <Text style={styles.statLabel}>المشاهدات</Text>
              </View>
              {poem?.audio && (
                <View style={styles.statBox}>
                  <Ionicons name="time-outline" size={18} color="#f2f2d3" />
                  <Text style={styles.statValue}>{formatTime(duration)}</Text>
                  <Text style={styles.statLabel}>المدة</Text>
              </View>
            )}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, isLiked && styles.actionButtonActive]}
                onPress={handleLike}
              >
                <AntDesign
                  name={isLiked ? "heart" : "hearto"}
                  size={24}
                  color={isLiked ? "#ff3b30" : "#f2f2d3"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, isSaved && styles.actionButtonActive]}
                onPress={handleSave}
              >
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
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
                    contentType: 'poem',
                    contentId: poemId,
                    title: poem?.title,
                    description: poem?.content
                  });
                }}
              >
                <Feather name="users" size={22} color="#f2f2d3" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Feather name="share" size={22} color="#f2f2d3" />
              </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.contentText}>{poem?.content}</Text>
                </View>

            {(poem?.audio || poem?.videoUrl) && (
              <View style={styles.mediaContainer}>
                {poem?.audio && (
                  <View style={styles.audioContainer}>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progress,
                            { width: `${(position / duration) * 100}%` }
                          ]}
                        />
                      </View>
                      <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(position)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                      </View>
                    </View>
                  </View>
                )}
                {poem?.videoUrl && (
                  <Video
                    ref={ref => setVideoRef(ref)}
                    source={{ uri: poem.videoUrl }}
                    style={styles.video}
                    useNativeControls={false}
                    resizeMode="contain"
                    onPlaybackStatusUpdate={status => {
                      if (status.isLoaded) {
                        setIsPlaying(status.isPlaying);
                        setPosition(status.positionMillis);
                        setDuration(status.durationMillis);
                      }
                    }}
                  />
                )}
              </View>
            )}

            <View style={styles.commentsContainer}>
              <Text style={styles.commentsTitle}>
                التعليقات • {comments.length}
              </Text>
              <View style={styles.commentInputContainer}>
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
                  placeholderTextColor="rgba(242, 242, 211, 0.5)"
                  value={comment}
                  onChangeText={setComment}
                  multiline
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
                <TouchableOpacity
                  style={[styles.commentButton, !comment.trim() && styles.commentButtonDisabled]}
                  onPress={handleComment}
                  disabled={!comment.trim()}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={comment.trim() ? "#f2f2d3" : "rgba(242, 242, 211, 0.5)"} 
                  />
                </TouchableOpacity>
              </View>

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
                        source={{ uri: comment.user?.avatar || 'https://via.placeholder.com/32' }} 
                        style={styles.commentAvatar} 
                      />
                    </TouchableOpacity>
                    <View style={styles.commentContent}>
                      <TouchableOpacity onPress={() => {
                        if (user && user._id === comment.user._id) {
                          navigation.navigate('Profile');
                        } else {
                          navigation.navigate('UserDetails', { userId: comment.user._id });
                        }
                      }}>
                        <Text style={styles.commentUsername}>{comment.user?.name || 'مستخدم'}</Text>
                      </TouchableOpacity>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString('ar-SA')}
                      </Text>
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
                                  source={{ uri: reply.user?.avatar || 'https://via.placeholder.com/24' }} 
                                  style={styles.replyAvatar} 
                                />
                              </TouchableOpacity>
                              <View style={styles.replyContent}>
                                <TouchableOpacity onPress={() => {
                                  if (user && user._id === reply.user._id) {
                                    navigation.navigate('Profile');
                                  } else {
                                    navigation.navigate('UserDetails', { userId: reply.user._id });
                                  }
                                }}>
                                  <Text style={styles.replyUsername}>{reply.user?.name || 'مستخدم'}</Text>
                                </TouchableOpacity>
                                <Text style={styles.replyText}>{reply.text}</Text>
                                <Text style={styles.replyDate}>
                                  {new Date(reply.createdAt).toLocaleDateString('ar-SA')}
                                </Text>
                                <TouchableOpacity
                                  style={styles.commentAction}
                                  onPress={() => handleCommentLike(comment._id, true, reply._id)}
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
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    height: height * 0.4,
    position: 'relative',
  },
  poemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  poemInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  titleContainer: {
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  poetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    padding: 10,
    borderRadius: 10,
  },
  poetImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 10,
    backgroundColor: '#2a2a2a',
  },
  poetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  poetInfo: {
    flex: 1,
  },
  poetName: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  poetBio: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
    marginTop: 2,
  },
  chevronIcon: {
    marginLeft: 5,
  },
  details: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
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
  contentContainer: {
    marginBottom: 20,
  },
  contentText: {
    color: '#f2f2d3',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    opacity: 0.8,
  },
  mediaContainer: {
    marginBottom: 20,
  },
  audioContainer: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(242, 242, 211, 0.2)',
    borderRadius: 2,
    marginBottom: 5,
  },
  progress: {
    height: '100%',
    backgroundColor: '#f2f2d3',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#f2f2d3',
    fontSize: 12,
  },
  playButton: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(242, 242, 211, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f2f2d3',
    marginVertical: 15,
  },
  playingButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.3)',
  },
  commentsContainer: {
    marginTop: 20,
  },
  commentsTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'right',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    color: '#f2f2d3',
    paddingVertical: 10,
    textAlign: 'right',
  },
  commentButton: {
    padding: 10,
  },
  commentButtonDisabled: {
    opacity: 0.5,
  },
  commentsList: {
    maxHeight: 300,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    color: '#f2f2d3',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    color: '#f2f2d3',
    fontSize: 14,
    marginBottom: 5,
  },
  commentDate: {
    color: 'rgba(242, 242, 211, 0.5)',
    fontSize: 12,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  actionCount: {
    color: '#f2f2d3',
    fontSize: 14,
    marginLeft: 5,
  },
  actionText: {
    color: '#f2f2d3',
    fontSize: 14,
    marginLeft: 5,
  },
  repliesList: {
    maxHeight: 200,
    marginTop: 10,
    marginLeft: 10,
  },
  replyItem: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyUsername: {
    color: '#f2f2d3',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  replyText: {
    color: '#f2f2d3',
    fontSize: 12,
    marginBottom: 4,
  },
  replyDate: {
    color: 'rgba(242, 242, 211, 0.5)',
    fontSize: 10,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 5,
    marginBottom: 10,
  },
  replyingToText: {
    color: '#f2f2d3',
    fontSize: 14,
    marginRight: 5,
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
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 10,
  },
});

export default PoemDetails; 