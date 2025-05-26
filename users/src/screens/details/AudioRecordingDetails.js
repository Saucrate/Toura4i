import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAudio } from '../../context/AudioContext';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useAuth } from '../../context/AuthContext';
import { shareWithFollowers, shareExternally, copyShareLink } from '../../utils/shareUtils';

const { width, height } = Dimensions.get('window');

const AudioRecordingDetails = ({ navigation, route }) => {
  const { recordingId } = route.params;
  const { user, isAuthenticated } = useAuth();
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();
  const [isSaved, setIsSaved] = useState(false);
  const scrollViewRef = useRef();
  const commentInputRef = useRef();

  const loadRecordingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from API headers
      const token = api.defaults.headers.common['authorization']?.split(' ')[1];
      console.log('Token from API headers:', token ? 'exists' : 'not found');

      console.log('Loading recording with auth:', {
        recordingId,
        hasToken: !!token,
        userId: user?._id,
        isAuthenticated: !!isAuthenticated
      });

      // First, update the view count
      try {
        await api.post(`/api/audio-recordings/${recordingId}/view`, {}, {
          timeout: 5000,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } catch (viewError) {
        console.error('Error updating view count:', viewError);
        // Continue loading even if view count update fails
      }

      const response = await api.get(`/api/audio-recordings/${recordingId}`, {
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.data) {
        throw new Error('Invalid recording data');
      }

      // Check if user has liked the recording
      const isLikedByUser = user && response.data.likes?.some(like => 
        like._id?.toString() === user._id.toString() || like.toString() === user._id.toString()
      );
      
      // Set recording with populated user data and like status
      setRecording({
        ...response.data,
        isLiked: isLikedByUser,
        views: response.data.views || 0 // Ensure views is always a number
      });
      
      // Also check likes for comments and replies
      if (response.data.comments) {
        const updatedComments = response.data.comments.map(comment => {
          const commentIsLiked = user && comment.likes?.some(like => 
            like._id?.toString() === user._id.toString() || like.toString() === user._id.toString()
          );
          
          const updatedReplies = comment.replies ? comment.replies.map(reply => ({
            ...reply,
            isLiked: user && reply.likes?.some(like => 
              like._id?.toString() === user._id.toString() || like.toString() === user._id.toString()
            )
          })) : [];
          
          return {
            ...comment,
            isLiked: commentIsLiked,
            replies: updatedReplies
          };
        });

        setRecording(prev => ({
          ...prev,
          comments: updatedComments
        }));
      }

      console.log('Recording loaded successfully:', {
        id: response.data._id,
        isLiked: isLikedByUser,
        likesCount: Array.isArray(response.data.likes) ? response.data.likes.length : 0,
        userLiked: isLikedByUser,
        views: response.data.views,
        userId: user?._id
      });

      // Check if recording is saved
      if (user) {
        try {
          const savedResponse = await api.get(`/api/users/users/${user._id}/saved-audios`);
          const isSaved = savedResponse.data.audios.some(audio => audio._id === recordingId);
          console.log('Saved status:', { isSaved, recordingId });
          setIsSaved(isSaved);
        } catch (saveError) {
          console.error('Error checking saved status:', saveError);
          setIsSaved(false);
        }
      } else {
        setIsSaved(false);
      }
    } catch (err) {
      console.error('Recording load error:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (!handleApiError(err)) {
        setError('حدث خطأ أثناء تحميل التسجيل');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('User information:', {
      user: user,
      isAuthenticated: isAuthenticated,
      userId: user?._id,
      userEmail: user?.email,
      userName: user?.name
    });
    
    loadRecordingDetails();
    return () => {
      // Remove sound cleanup since we're using AudioContext
    };
  }, [recordingId]);

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
                redirectParams: { recordingId }
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

  const handlePlayPress = async () => {
    if (!recording) return;

    try {
      const track = {
        id: recording._id,
        title: recording.title,
        artist: recording.performer,
        audio: recording.file,
        image: recording.image,
        duration: recording.duration,
      };

      // If current track is playing, just toggle play/pause
      if (currentTrack?.id === recording._id) {
        await togglePlayPause();
        return;
      }

      // Play the track using AudioContext
      playTrack(track);
    } catch (error) {
      console.error('Playback error for track:', recording.title, error);
    }
  };

  const handleLikePress = async () => {
    try {
      if (!user) {
        handleAuthError();
        return;
      }

      // Optimistic update
      const newIsLiked = !recording.isLiked;
      setRecording(prev => ({
        ...prev,
        isLiked: newIsLiked,
        likes: newIsLiked 
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter(id => id !== user._id)
      }));

      const response = await api.post(`/api/audio-recordings/${recordingId}/like`, {}, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });

      if (response.data?.success) {
        // Update with server response
        setRecording(prev => ({
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
      setRecording(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked 
          ? [...(prev.likes || []), user._id]
          : (prev.likes || []).filter(id => id !== user._id)
      }));
      handleApiError(err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      Alert.alert(
        'تسجيل الدخول مطلوب',
        'يجب تسجيل الدخول لتتمكن من إضافة تعليقات',
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

    if (!commentText.trim()) return;

    try {
      const response = await api.post(`/api/audio-recordings/${recordingId}/comments`, {
        text: commentText.trim(),
        replyTo: replyTo?._id
      });

      if (replyTo) {
        // Update the parent comment with the new reply
        setRecording(prev => ({
          ...prev,
          comments: prev.comments.map(comment => {
            if (comment._id === replyTo._id) {
              return {
                ...comment,
                replies: [...comment.replies, response.data]
              };
            }
            return comment;
          })
        }));
      } else {
        // Add new comment
        setRecording(prev => ({
          ...prev,
          comments: [response.data, ...prev.comments]
        }));
      }

      setCommentText('');
      setReplyTo(null);
      Keyboard.dismiss();
    } catch (err) {
      console.error('Error adding comment:', err);
      Alert.alert('خطأ', err.response?.data?.message || 'حدث خطأ أثناء إضافة التعليق');
    }
  };

  const handleCommentLike = async (commentId, isReply = false, replyId = null) => {
    try {
      if (!user) {
        handleAuthError();
        return;
      }

      // Optimistic update
      setRecording(prev => ({
        ...prev,
        comments: prev.comments.map(comment => {
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
      }));

      const response = await api.post(`/api/audio-recordings/${recordingId}/comments/like`, {
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
        setRecording(prev => ({
          ...prev,
          comments: prev.comments.map(comment => {
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
        }));
      }
    } catch (err) {
      // Revert optimistic update on error
      setRecording(prev => ({
        ...prev,
        comments: prev.comments.map(comment => {
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
      }));
      handleApiError(err);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setCommentText('');
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  const handleReplayPress = () => {
    if (currentTrack?.id === recording._id) {
      // If current track is playing, restart it
      playTrack({
        id: recording._id,
        title: recording.title,
        artist: recording.performer,
        audio: recording.file,
        image: recording.image,
        duration: recording.duration,
      });
    } else {
      handlePlayPress();
    }
  };

  const handleSavePress = async () => {
    try {
      const response = await api.post(`/api/users/audio-recordings/${recordingId}/toggle-save`);
      setIsSaved(response.data.isSaved);
    } catch (err) {
      console.error('Error saving recording:', err);
      if (err.response?.status === 401) {
        Alert.alert('خطأ', 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
        api.defaults.headers.common['authorization'] = '';
        navigation.navigate('Login');
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء حفظ التسجيل');
      }
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

      Alert.alert(
        'مشاركة التسجيل',
        'اختر طريقة المشاركة',
        [
          {
            text: 'مشاركة مع المتابعين',
            onPress: () => navigation.navigate('ShareWithFollowers', {
              contentType: 'audio',
              contentId: recordingId,
              title: recording.title,
              description: recording.description
            })
          },
          {
            text: 'مشاركة خارجية',
            onPress: async () => {
              try {
                await shareExternally('audio', recordingId, recording.title, recording.description);
              } catch (error) {
                console.error('Error sharing externally:', error);
              }
            }
          },
          {
            text: 'نسخ الرابط',
            onPress: async () => {
              try {
                await copyShareLink('audio', recordingId);
              } catch (error) {
                console.error('Error copying link:', error);
              }
            }
          },
          {
            text: 'إلغاء',
            style: 'cancel'
          }
        ]
      );
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
        <TouchableOpacity style={styles.retryButton} onPress={loadRecordingDetails}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!recording) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>لم يتم العثور على بيانات التسجيل</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRecordingDetails}>
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
          <Text style={styles.headerTitle}>التسجيل الصوتي</Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroSection}>
            <Image 
              source={{ uri: recording.image }} 
              style={styles.recordingImage} 
            />
            <LinearGradient
              colors={['transparent', '#000000']}
              style={styles.imageGradient}
            />
            <View style={styles.recordingInfo}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{recording.title}</Text>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={handlePlayPress}
                >
                  <Ionicons 
                    name={currentTrack?.id === recording._id && isPlaying ? "stop-circle" : "play-circle"} 
                    size={32} 
                    color="#f2f2d3" 
                  />
                </TouchableOpacity>
              </View>
              {recording.performer && (
                <View style={styles.performerContainer}>
                  <View style={styles.performerImageContainer}>
                    <Image 
                      source={{ uri: recording.performer.image || 'https://via.placeholder.com/32' }} 
                      style={styles.performerImage}
                    />
                  </View>
                  <Text style={styles.performer}>{recording.performer.name || 'بدون اسم'}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="eye-outline" size={18} color="#f2f2d3" />
                <Text style={styles.statValue}>{recording?.views || 0}</Text>
                <Text style={styles.statLabel}>المشاهدات</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="time-outline" size={18} color="#f2f2d3" />
                <Text style={styles.statValue}>
                  {Math.floor(recording?.duration / 60)}:{(recording?.duration % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={styles.statLabel}>المدة</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, recording?.isLiked && styles.actionButtonActive]}
                onPress={handleLikePress}
              >
                <AntDesign 
                  name={recording?.isLiked ? "heart" : "hearto"} 
                  size={24} 
                  color={recording?.isLiked ? "#ff3b30" : "#f2f2d3"}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, isSaved && styles.actionButtonActive]}
                onPress={handleSavePress}
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
                    contentType: 'audio',
                    contentId: recordingId,
                    title: recording?.title,
                    description: recording?.description
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
                    message: `استمع إلى ${recording?.title} في تطبيقنا`,
                    title: recording?.title,
                  });
                }}
              >
                <Feather name="share" size={22} color="#f2f2d3" />
              </TouchableOpacity>
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>الوصف</Text>
              <Text style={styles.description}>{recording.description}</Text>
            </View>

            {recording.lyrics && (
              <View style={styles.lyricsContainer}>
                <Text style={styles.lyricsTitle}>الكلمات</Text>
                <Text style={styles.lyrics}>{recording.lyrics}</Text>
              </View>
            )}

            <View style={styles.commentsContainer}>
              <Text style={styles.commentsTitle}>
                التعليقات • {recording?.comments?.reduce((total, comment) => 
                  total + 1 + (comment.replies?.length || 0), 0) || 0}
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
                  value={commentText}
                  onChangeText={setCommentText}
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
                  style={[styles.commentButton, !commentText.trim() && styles.commentButtonDisabled]}
                  onPress={handleCommentSubmit}
                  disabled={!commentText.trim()}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={commentText.trim() ? "#f2f2d3" : "rgba(242, 242, 211, 0.5)"} 
                  />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.commentsList}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {recording?.comments?.map((comment) => (
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
  heroSection: {
    height: height * 0.4,
    position: 'relative',
  },
  recordingImage: {
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
  recordingInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
  performerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'right',
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
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  description: {
    color: '#f2f2d3',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    opacity: 0.8,
  },
  lyricsContainer: {
    marginBottom: 20,
  },
  lyricsTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  lyrics: {
    color: '#f2f2d3',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    opacity: 0.8,
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
  playButton: {
    marginLeft: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollContent: {
    paddingBottom: 100,
  },
  commentsList: {
    maxHeight: 300,
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
  commentButtonDisabled: {
    opacity: 0.5,
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
});

export default AudioRecordingDetails; 