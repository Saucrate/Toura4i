import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  Dimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { shareExternally } from '../../utils/shareUtils';

const { width } = Dimensions.get('window');

const PhotoDetails = ({ route, navigation }) => {
  const { photoId } = route.params;
  const { user } = useAuth();
  console.log('[PhotoDetails] Component mounted with photoId:', photoId);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapPosition, setLastTapPosition] = useState({ x: 0, y: 0 });
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    console.log('[PhotoDetails] useEffect triggered, loading photo:', photoId);
    loadPhoto();
  }, [photoId]);

  const loadPhoto = async () => {
    console.log('[PhotoDetails] جاري تحميل الصورة:', photoId);
    try {
      setLoading(true);
      
      // Get user profile first to ensure we have user data
      const userResponse = await api.get('/api/users/profile');
      const currentUser = userResponse.data;
      console.log('[PhotoDetails] بيانات المستخدم:', {
        id: currentUser._id,
        savedPhotos: currentUser.savedPhotos
      });

      // Get photo details
      const response = await api.get(`/api/photos/${photoId}`);
      console.log('[PhotoDetails] تم استلام بيانات الصورة:', response.data);

      // Extract photo data from the nested response
      const photoData = response.data.data.data || response.data.data;
      console.log('[PhotoDetails] Photo data extracted:', photoData);

      // Check if photo is saved by current user
      const savedPhotoIds = currentUser.savedPhotos?.map(photo => 
        typeof photo === 'object' ? photo._id : photo
      ) || [];
      const isSaved = savedPhotoIds.includes(photoData._id);
      
      // Check if photo is liked by current user
      const isLiked = photoData.likes?.includes(currentUser._id) ?? false;
      
      // Ensure we have all required data
      const processedPhotoData = {
        ...photoData,
        isLiked,
        isSaved,
        likes: photoData.likes || [],
        commentsCount: photoData.commentsCount || photoData.comments?.length || 0,
        person: photoData.person || null,
        images: photoData.images || [],
        description: photoData.description || '',
        createdAt: photoData.createdAt || new Date().toISOString()
      };
      
      console.log('[PhotoDetails] بيانات الصورة المعالجة:', {
        id: processedPhotoData._id,
        isLiked: processedPhotoData.isLiked,
        isSaved: processedPhotoData.isSaved,
        likesCount: processedPhotoData.likes?.length || 0,
        commentsCount: processedPhotoData.commentsCount,
        userId: currentUser._id
      });
      
      setPhoto(processedPhotoData);
    } catch (error) {
      console.error('[PhotoDetails] خطأ في تحميل الصورة:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoubleTap = (event) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < 300 && tapLength > 0) {
      handleLike();
    }
    
    setLastTapTime(currentTime);
    setLastTapPosition({
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY
    });
  };

  const handleLike = async () => {
    if (!user) {
      console.log('[PhotoDetails] المستخدم غير مسجل الدخول، جاري التوجيه إلى صفحة تسجيل الدخول');
      navigation.navigate('Login');
      return;
    }

    try {
      console.log('[PhotoDetails] جاري تبديل الإعجاب للصورة:', photo._id);
      const response = await api.post('/api/likes/toggle', {
        targetType: 'photo',
        targetId: photo._id
      });
      console.log('[PhotoDetails] استجابة تبديل الإعجاب:', response.data);

      // Update local state
      setPhoto(prevPhoto => ({
        ...prevPhoto,
        isLiked: response.data.data?.isLiked ?? false,
        likes: response.data.data?.likes || prevPhoto.likes
      }));

      // Log feedback
      if (response.data.data?.isLiked) {
        console.log('[PhotoDetails] تم الإعجاب بالصورة بنجاح');
      } else {
        console.log('[PhotoDetails] تم إزالة الإعجاب بنجاح');
      }
    } catch (error) {
      console.error('[PhotoDetails] خطأ في تبديل الإعجاب:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      console.log('[PhotoDetails] المستخدم غير مسجل الدخول، جاري التوجيه إلى صفحة تسجيل الدخول');
      navigation.navigate('Login');
      return;
    }

    try {
      console.log('[PhotoDetails] جاري تبديل الحفظ للصورة:', photo._id);
      const response = await api.post(`/api/users/photos/${photo._id}/toggle-save`);
      console.log('[PhotoDetails] استجابة تبديل الحفظ:', response.data);

      // Update local state
      setPhoto(prevPhoto => ({
        ...prevPhoto,
        isSaved: response.data.data?.isSaved ?? false
      }));

      // Log feedback
      if (response.data.data?.isSaved) {
        console.log('[PhotoDetails] تم حفظ الصورة بنجاح');
      } else {
        console.log('[PhotoDetails] تم إزالة الصورة من المحفوظات بنجاح');
      }
    } catch (error) {
      console.error('[PhotoDetails] خطأ في تبديل الحفظ:', error);
    }
  };

  const handleShare = async () => {
    try {
      if (!user) {
        console.log('[PhotoDetails] تسجيل الدخول مطلوب للمشاركة');
        navigation.navigate('Login');
        return;
      }

      await shareExternally('photo', photo._id, photo.title, photo.description);
      console.log('[PhotoDetails] تمت المشاركة بنجاح');
    } catch (err) {
      console.error('[PhotoDetails] خطأ في المشاركة:', err);
    }
  };

  const handleShareWithFollowers = () => {
    if (!user) {
      console.log('[PhotoDetails] تسجيل الدخول مطلوب للمشاركة مع المتابعين');
      navigation.navigate('Login');
      return;
    }

    navigation.navigate('ShareWithFollowers', {
      contentType: 'photo',
      contentId: photo._id,
      title: photo.title,
      description: photo.description
    });
    console.log('[PhotoDetails] جاري فتح صفحة المشاركة مع المتابعين');
  };

  const loadComments = async () => {
    console.log('[PhotoDetails] loadComments called for photo:', photo._id);
    try {
      setLoadingComments(true);
      const response = await api.get(`/api/comments/photo/${photo._id}`);
      console.log('[PhotoDetails] Comments data received:', {
        count: response.data?.data?.length || 0
      });
      
      if (response.data && response.data.data) {
        const commentsWithShowReplies = response.data.data.map(comment => ({
          ...comment,
          showReplies: false,
          isLiked: comment.isLiked || false,
          likes: comment.likes || [],
          replies: comment.replies || []
        }));
        setComments(commentsWithShowReplies);
        
        // Update photo's comment count
        setPhoto(prevPhoto => ({
          ...prevPhoto,
          commentsCount: response.data.data.length
        }));
        console.log('[PhotoDetails] Comments state updated');
      } else {
        setComments([]);
        console.log('[PhotoDetails] No comments found');
      }
    } catch (error) {
      console.error('[PhotoDetails] Error loading comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLikeComment = async (commentId, isReply = false) => {
    try {
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      const response = await api.post(`/api/comments/${commentId}/like`);
      
      if (response.data.status === 'success') {
        const { comment, isLiked } = response.data.data;
        
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                isLiked,
                likes: isLiked 
                  ? [...comment.likes, user._id]
                  : comment.likes.filter(id => id !== user._id)
              };
            }
            
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply._id === commentId) {
                    return {
                      ...reply,
                      isLiked,
                      likes: isLiked
                        ? [...reply.likes, user._id]
                        : reply.likes.filter(id => id !== user._id)
                    };
                  }
                  return reply;
                })
              };
            }
            
            return comment;
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
  };

  const handleAddComment = async () => {
    console.log('[PhotoDetails] handleAddComment called');
    try {
      if (!user) {
        console.log('[PhotoDetails] User not authenticated, redirecting to login');
        navigation.navigate('Login');
        return;
      }

      if (!newComment.trim()) {
        console.log('[PhotoDetails] Empty comment, showing alert');
        Alert.alert('خطأ', 'الرجاء إدخال تعليق');
        return;
      }

      console.log('[PhotoDetails] Sending comment:', {
        photoId: photo._id,
        content: newComment,
        replyTo: replyingTo?._id
      });

      const response = await api.post('/api/comments', {
        photoId: photo._id,
        content: newComment,
        replyTo: replyingTo?._id
      });

      console.log('[PhotoDetails] Comment response:', response.data);

      if (response.data.status === 'success') {
        const newCommentData = response.data.data;
        
        if (replyingTo) {
          console.log('[PhotoDetails] Adding reply to comment:', replyingTo._id);
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
          console.log('[PhotoDetails] Adding new comment');
          setComments(prevComments => [{
            ...newCommentData,
            replies: []
          }, ...prevComments]);
        }

        setNewComment('');
        setReplyingTo(null);
        console.log('[PhotoDetails] Comment state updated');
      }
    } catch (error) {
      console.error('[PhotoDetails] Error adding comment:', error);
      loadComments();
    }
  };

  const handleImageScroll = (event) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const index = Math.floor(contentOffset.x / layoutMeasurement.width);
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    if (showCommentsModal) {
      loadComments();
    }
  }, [showCommentsModal]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f2f2d3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الصورة</Text>
          <TouchableOpacity onPress={() => setShowOptions(true)}>
            <MaterialIcons name="more-horiz" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {photo?.person && (
                <TouchableOpacity 
                  style={styles.poetInfo}
                  onPress={() => navigation.navigate('PoetDetails', { poetId: photo.person._id })}
                >
                  <View style={styles.poetImageContainer}>
                    <Image 
                      source={{ uri: photo.person.image || 'https://via.placeholder.com/40' }} 
                      style={styles.poetImage}
                    />
                  </View>
                  <View style={styles.poetDetails}>
                    <Text style={styles.poetName}>{photo.person.name || 'بدون اسم'}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
              style={styles.mediaContainer}
            >
              {photo?.images && photo.images.map((image, index) => (
                <TouchableOpacity
                  key={image._id}
                  style={[styles.mediaContainer, { width: width }]}
                  onPress={handleDoubleTap}
                >
                  <Image
                    source={{ uri: image.url }}
                    style={[styles.photo, { width: width, height: 400 }]}
                    resizeMode="cover"
                  />
                  {lastTapPosition.x !== 0 && lastTapPosition.y !== 0 && (
                    <View 
                      style={[
                        styles.doubleTapLikeIndicator,
                        {
                          left: lastTapPosition.x - 25,
                          top: lastTapPosition.y - 25
                        }
                      ]}
                    >
                      <AntDesign name="heart" size={50} color="#ff3b30" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {photo?.images?.length > 1 && (
              <View style={styles.imageIndicators}>
                {photo.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.imageIndicator,
                      currentImageIndex === index && styles.activeImageIndicator
                    ]}
                  />
                ))}
              </View>
            )}

            <View style={styles.postActions}>
              <View style={styles.leftActions}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleLike}
                >
                  <AntDesign 
                    name={photo?.isLiked ? "heart" : "hearto"} 
                    size={26} 
                    color={photo?.isLiked ? "#ff3b30" : "#f2f2d3"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setShowCommentsModal(true)}
                >
                  <AntDesign name="message1" size={24} color="#f2f2d3" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleShareWithFollowers}
                >
                  <Feather name="users" size={24} color="#f2f2d3" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleShare}
                >
                  <Feather name="share" size={24} color="#f2f2d3" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.iconBtn}
                onPress={handleSave}
              >
                <Ionicons
                  name={photo?.isSaved ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={photo?.isSaved ? "#ffffff" : "#f2f2d3"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.postInfo}>
              <Text style={styles.likesCount}>{photo?.likes?.length || 0} إعجاب</Text>
              <View style={styles.contentContainer}>
                <Text style={styles.content} numberOfLines={showFullContent ? undefined : 2}>
                  {photo?.description}
                </Text>
                {photo?.description?.length > 80 && (
                  <TouchableOpacity onPress={() => setShowFullContent(!showFullContent)}>
                    <Text style={styles.viewMore}>
                      {showFullContent ? 'عرض أقل' : 'عرض المزيد'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity 
                onPress={() => setShowCommentsModal(true)}
                style={styles.commentsButton}
              >
                <Text style={styles.viewComments}>
                  عرض التعليقات ({photo?.commentsCount || 0})
                </Text>
              </TouchableOpacity>

              <Text style={styles.date}>
                {new Date(photo?.createdAt).toLocaleDateString('ar-EG')}
              </Text>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showCommentsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCommentsModal(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>التعليقات</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCommentsModal(false)}
                >
                  <Ionicons name="close" size={24} color="#f2f2d3" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.commentsList}
                keyboardShouldPersistTaps="handled"
              >
                {loadingComments ? (
                  <ActivityIndicator size="large" color="#f2f2d3" style={styles.loadingIndicator} />
                ) : comments && comments.length > 0 ? (
                  comments.map(comment => (
                    <View key={comment._id}>
                      <View style={styles.commentItem}>
                        <TouchableOpacity 
                          onPress={() => {
                            if (comment.user?._id === user?._id) {
                              navigation.navigate('Profile');
                            } else {
                              navigation.navigate('UserDetails', { userId: comment.user?._id });
                            }
                          }}
                        >
                          <Image 
                            source={{ uri: comment.user?.avatar || 'https://via.placeholder.com/40' }} 
                            style={styles.commentUserImage}
                          />
                        </TouchableOpacity>
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeader}>
                            <TouchableOpacity 
                              onPress={() => {
                                if (comment.user?._id === user?._id) {
                                  navigation.navigate('Profile');
                                } else {
                                  navigation.navigate('UserDetails', { userId: comment.user?._id });
                                }
                              }}
                            >
                              <Text style={styles.commentUsername}>{comment.user?.name || 'مستخدم'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.likeButton}
                              onPress={() => handleLikeComment(comment._id)}
                            >
                              <AntDesign 
                                name={comment.isLiked ? "heart" : "hearto"} 
                                size={16} 
                                color={comment.isLiked ? "#ff3b30" : "#f2f2d3"} 
                              />
                              <Text style={[
                                styles.likeCount,
                                comment.isLiked && { color: '#ff3b30' }
                              ]}>
                                {comment.likes?.length || 0}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.commentText}>{comment.content}</Text>
                          <View style={styles.commentActions}>
                            <TouchableOpacity 
                              style={styles.replyButton}
                              onPress={() => handleReply(comment)}
                            >
                              <Text style={styles.replyText}>رد</Text>
                            </TouchableOpacity>
                            <Text style={styles.replyCount}>
                              {comment.replies ? comment.replies.length : 0} ردود
                            </Text>
                            {comment.replies && comment.replies.length > 0 && (
                              <TouchableOpacity 
                                style={styles.viewRepliesButton}
                                onPress={() => {
                                  setComments(prevComments => prevComments.map(c => {
                                    if (c._id === comment._id) {
                                      return { ...c, showReplies: !c.showReplies };
                                    }
                                    return c;
                                  }));
                                }}
                              >
                                <Text style={styles.viewRepliesText}>
                                  {comment.showReplies ? 'إخفاء الردود' : 'عرض الردود'}
                                </Text>
                              </TouchableOpacity>
                            )}
                            <Text style={styles.commentDate}>
                              {new Date(comment.createdAt).toLocaleDateString('ar-EG')}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {comment.showReplies && comment.replies && comment.replies.length > 0 && (
                        <View style={styles.repliesContainer}>
                          {comment.replies.map(reply => (
                            <View key={reply._id} style={styles.replyItem}>
                              <TouchableOpacity 
                                onPress={() => {
                                  if (reply.user?._id === user?._id) {
                                    navigation.navigate('Profile');
                                  } else {
                                    navigation.navigate('UserDetails', { userId: reply.user?._id });
                                  }
                                }}
                              >
                                <Image 
                                  source={{ uri: reply.user?.avatar || 'https://via.placeholder.com/40' }} 
                                  style={styles.replyUserImage}
                                />
                              </TouchableOpacity>
                              <View style={styles.replyContent}>
                                <View style={styles.replyHeader}>
                                  <TouchableOpacity 
                                    onPress={() => {
                                      if (reply.user?._id === user?._id) {
                                        navigation.navigate('Profile');
                                      } else {
                                        navigation.navigate('UserDetails', { userId: reply.user?._id });
                                      }
                                    }}
                                  >
                                    <Text style={styles.replyUsername}>{reply.user?.name || 'مستخدم'}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity 
                                    style={styles.likeButton}
                                    onPress={() => handleLikeComment(reply._id)}
                                  >
                                    <AntDesign 
                                      name={reply.isLiked ? "heart" : "hearto"} 
                                      size={16} 
                                      color={reply.isLiked ? "#ff3b30" : "#f2f2d3"} 
                                    />
                                    <Text style={[
                                      styles.likeCount,
                                      reply.isLiked && { color: '#ff3b30' }
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
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noCommentsText}>لا توجد تعليقات</Text>
                )}
              </ScrollView>

              <View style={styles.commentInputContainer}>
                {replyingTo && (
                  <View style={styles.replyingToContainer}>
                    <Text style={styles.replyingToText}>
                      رد على: {replyingTo.user?.name || 'مستخدم'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setReplyingTo(null)}
                    >
                      <Ionicons name="close" size={16} color="#f2f2d3" />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="أضف تعليقاً..."
                    placeholderTextColor="#8e8e8e"
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleAddComment}
                  >
                    <Ionicons name="send" size={24} color="#f2f2d3" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          visible={showOptions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOptions(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowOptions(false)}
          >
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  handleLike();
                  setShowOptions(false);
                }}
              >
                <AntDesign 
                  name={photo?.isLiked ? "heart" : "hearto"} 
                  size={24} 
                  color="#f2f2d3" 
                />
                <Text style={styles.optionText}>
                  {photo?.isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  handleShareWithFollowers();
                  setShowOptions(false);
                }}
              >
                <Feather name="users" size={24} color="#f2f2d3" />
                <Text style={styles.optionText}>مشاركة مع المتابعين</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  handleShare();
                  setShowOptions(false);
                }}
              >
                <Feather name="share" size={24} color="#f2f2d3" />
                <Text style={styles.optionText}>مشاركة خارجية</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
    justifyContent: 'space-between',
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
  card: {
    backgroundColor: '#000000',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
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
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    gap: 8,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeImageIndicator: {
    backgroundColor: '#f2f2d3',
    transform: [{ scale: 1.2 }],
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
  contentContainer: {
    marginBottom: 6,
  },
  content: {
    color: '#f2f2d3',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  viewMore: {
    color: '#8e8e8e',
    fontSize: 13,
    marginTop: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  commentsList: {
    flex: 1,
    marginBottom: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    color: '#f2f2d3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentText: {
    color: '#f2f2d3',
    fontSize: 14,
    marginBottom: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyButton: {
    marginRight: 12,
  },
  replyText: {
    color: '#8e8e8e',
    fontSize: 12,
  },
  replyCount: {
    color: '#8e8e8e',
    fontSize: 12,
    marginRight: 12,
  },
  commentDate: {
    color: '#8e8e8e',
    fontSize: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    color: '#f2f2d3',
    fontSize: 12,
    marginLeft: 4,
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(242, 242, 211, 0.1)',
    paddingTop: 10,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  commentInput: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 14,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  noCommentsText: {
    color: '#8e8e8e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  repliesContainer: {
    marginLeft: 52,
    marginTop: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(242, 242, 211, 0.2)',
    paddingLeft: 12,
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyUsername: {
    color: '#f2f2d3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  replyDate: {
    color: '#8e8e8e',
    fontSize: 12,
  },
  viewRepliesButton: {
    marginRight: 12,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewRepliesText: {
    color: '#f2f2d3',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  optionText: {
    color: '#f2f2d3',
    fontSize: 14,
    marginLeft: 10,
  },
  doubleTapLikeIndicator: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default PhotoDetails; 