import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  Dimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { shareExternally } from '../utils/shareUtils';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const PhotoItem = ({ item, navigation, photos, setPhotos, setFilteredPhotos }) => {
  console.log('PhotoItem received item:', item);
  console.log('Person information:', item.person);
  
  const { user } = useAuth();
  const [showFullContent, setShowFullContent] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [likeTimeout, setLikeTimeout] = useState(null);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapPosition, setLastTapPosition] = useState({ x: 0, y: 0 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localItem, setLocalItem] = useState(item);

  // Görünürlük kontrolü
  const isVisible = true;

  const handleDoubleTap = (event) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      handleLike();
    }
    
    setLastTapTime(currentTime);
    setLastTapPosition({
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY
    });
  };

  const handleLike = async () => {
    try {
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      // Clear any existing timeout
      if (likeTimeout) {
        clearTimeout(likeTimeout);
      }

      // Set a new timeout to send the actual like request
      const timeout = setTimeout(async () => {
        try {
          const response = await api.post('/api/likes/toggle', {
            targetType: 'photo',
            targetId: item._id
          });

          if (response.data.status === 'success') {
            // Update the photo's likes array and count
            const updatedPhotos = photos.map(photo => {
              if (photo._id === item._id) {
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
            setFilteredPhotos(updatedPhotos);
          }
        } catch (error) {
          console.error('Like error:', error.response?.data || error.message);
        }
      }, 300); // 300ms delay to batch multiple clicks

      setLikeTimeout(timeout);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const response = await api.get(`/api/comments/photo/${item._id}`);
      
      if (response.data && response.data.data) {
        console.log('Comments response:', response.data.data); // Debug log
        
        // Add showReplies property to each comment and set it to false by default
        const commentsWithShowReplies = response.data.data.map(comment => ({
          ...comment,
          showReplies: false // Set to false by default
        }));
        
        setComments(commentsWithShowReplies);
        
        // Update the photo's comment count in the parent component
        if (response.data.totalCommentCount !== undefined) {
          const updatedPhotos = photos.map(photo => {
            if (photo._id === item._id) {
              return {
                ...photo,
                commentsCount: response.data.totalCommentCount
              };
            }
            return photo;
          });
          
          setPhotos(updatedPhotos);
          setFilteredPhotos(updatedPhotos);
        }
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

  // Calculate total comment count including replies
  const getTotalCommentCount = () => {
    let count = comments.length;
    comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        count += comment.replies.length;
      }
    });
    return count;
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
    try {
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      if (!newComment.trim()) {
        Alert.alert('خطأ', 'الرجاء إدخال تعليق');
        return;
      }

      const response = await api.post('/api/comments', {
        photoId: item._id,
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
        
        // Update photo's comments count in both local and parent state
        const updatedPhotos = photos.map(photo => {
          if (photo._id === item._id) {
            return {
              ...photo,
              commentsCount: (photo.commentsCount || 0) + 1
            };
          }
          return photo;
        });

        setPhotos(updatedPhotos);
        setFilteredPhotos(updatedPhotos);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      loadComments(); // Reload comments in case of error
    }
  };

  const handleSave = async () => {
    try {
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      if (isSaving) return;
      setIsSaving(true);

      // Optimistically update UI
      const optimisticItem = {
        ...item,
        isSaved: !item.isSaved,
        savedBy: !item.isSaved
          ? [...(item.savedBy || []), user._id]
          : (item.savedBy || []).filter(id => id !== user._id)
      };

      // Update local state immediately
      setLocalItem(optimisticItem);

      // Update parent state
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo._id === item._id ? optimisticItem : photo
        )
      );

      setFilteredPhotos(prevFiltered => 
        prevFiltered.map(photo => 
          photo._id === item._id ? optimisticItem : photo
        )
      );

      // Make API call
      const response = await api.post(`/api/users/photos/${item._id}/toggle-save`);
      console.log('Save API response:', response.data);

      if (response.data.status === 200) {
        const newSavedState = response.data.data.isSaved;
        console.log('New save state:', newSavedState);

        // Update with actual server response
        const updatedItem = {
          ...item,
          isSaved: newSavedState,
          savedBy: newSavedState
            ? [...(item.savedBy || []), user._id]
            : (item.savedBy || []).filter(id => id !== user._id)
            };

        setLocalItem(updatedItem);
        setPhotos(prevPhotos => 
          prevPhotos.map(photo => 
            photo._id === item._id ? updatedItem : photo
          )
        );
        setFilteredPhotos(prevFiltered => 
          prevFiltered.map(photo => 
            photo._id === item._id ? updatedItem : photo
          )
        );

        // Reload user data to ensure consistency
        await reloadUser();
      }
    } catch (error) {
      console.error('Save error:', error);
      // Revert optimistic update on error
      setLocalItem(item);
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo._id === item._id ? item : photo
        )
      );
      setFilteredPhotos(prevFiltered => 
        prevFiltered.map(photo => 
          photo._id === item._id ? item : photo
        )
      );
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الصورة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
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
        await shareExternally('photo', item._id, item.title, item.description);
      } catch (error) {
        console.error('Error sharing externally:', error);
      }
    } catch (err) {
      console.error('Share error:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء المشاركة');
    }
  };

  const handleShareWithFollowers = () => {
    if (!user) {
      Alert.alert(
        'تسجيل الدخول مطلوب',
        'يجب تسجيل الدخول للمشاركة مع المتابعين',
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

    navigation.navigate('ShareWithFollowers', {
      contentType: 'photo',
      contentId: item._id,
      title: item.title,
      description: item.description
    });
  };

  useEffect(() => {
    if (showCommentsModal) {
      loadComments();
    }
  }, [showCommentsModal]);

  const navigateToPoetDetails = () => {
    if (item.person) {
      navigation.navigate('PoetDetails', { poetId: item.person._id });
    }
  };

  // Add a visual indicator for double-tap like
  const renderDoubleTapLikeIndicator = () => {
    if (lastTapPosition.x === 0 && lastTapPosition.y === 0) return null;
    
    return (
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
    );
  };

  const handleImageScroll = (event) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const index = Math.floor(contentOffset.x / layoutMeasurement.width);
    setCurrentImageIndex(index);
  };

  const renderOptionsModal = () => (
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
              name={item.isLiked ? "heart" : "hearto"} 
              size={24} 
              color="#f2f2d3" 
            />
            <Text style={styles.optionText}>
              {item.isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
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
  );

  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.person && (
          <TouchableOpacity 
            style={styles.poetInfo}
            onPress={navigateToPoetDetails}
          >
            <View style={styles.poetImageContainer}>
              <Image 
                source={{ uri: item.person.image || 'https://via.placeholder.com/40' }} 
                style={styles.poetImage}
                onError={(e) => console.log('Error loading person image:', e.nativeEvent.error)}
              />
        </View>
            <View style={styles.poetDetails}>
              <Text style={styles.poetName}>{item.person.name || 'بدون اسم'}</Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setShowOptions(true)}>
          <MaterialIcons name="more-horiz" size={24} color="#f2f2d3" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleImageScroll}
        scrollEventThrottle={16}
        style={styles.mediaContainer}
      >
        {item.images && item.images.map((image, index) => {
          console.log('Rendering image:', image);
          return (
            <TouchableOpacity
              key={image._id}
              style={[styles.mediaContainer, { width: width }]}
        onPress={handleDoubleTap}
      >
        <Image
                source={{ uri: image.url }}
                style={[styles.photo, { width: width, height: 400 }]}
          resizeMode="cover"
                onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
        />
        {renderDoubleTapLikeIndicator()}
      </TouchableOpacity>
          );
        })}
      </ScrollView>

      {item.images.length > 1 && (
        <View style={styles.imageIndicators}>
          {item.images.map((_, index) => (
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
            activeOpacity={0.7}
          >
            <AntDesign 
              name={item.isLiked ? "heart" : "hearto"} 
              size={26} 
              color={item.isLiked ? "#ff3b30" : "#f2f2d3"} 
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
            name={localItem.isSaved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={localItem.isSaved ? "#ffffff" : "#f2f2d3"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.likesCount}>{item.likes?.length || 0} إعجاب</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.content} numberOfLines={showFullContent ? undefined : 2}>
            {item.description}
          </Text>
          {item.description?.length > 80 && (
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
            عرض التعليقات ({typeof item.commentsCount === 'number' ? item.commentsCount : getTotalCommentCount()})
          </Text>
        </TouchableOpacity>

        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('ar-EG')}
        </Text>
      </View>

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
                          if (comment.user._id === user?._id) {
                            navigation.navigate('Profile');
                          } else {
                            navigation.navigate('UserDetails', { userId: comment.user._id });
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
                              if (comment.user._id === user?._id) {
                                navigation.navigate('Profile');
                              } else {
                                navigation.navigate('UserDetails', { userId: comment.user._id });
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
                                if (reply.user._id === user?._id) {
                                  navigation.navigate('Profile');
                                } else {
                                  navigation.navigate('UserDetails', { userId: reply.user._id });
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
                                    if (reply.user._id === user?._id) {
                                      navigation.navigate('Profile');
                                    } else {
                                      navigation.navigate('UserDetails', { userId: reply.user._id });
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

      {renderOptionsModal()}
    </View>
  );
};

const PhotosScreen = ({ navigation, route }) => {
  const { user, token } = useAuth();
  const { showSaved: routeShowSaved } = route.params || {};
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [visiblePhotoId, setVisiblePhotoId] = useState(null);
  const flatListRef = useRef(null);
  const [showSaved, setShowSaved] = useState(routeShowSaved || false);
  const [isSaving, setIsSaving] = useState(false);

  // Add focus listener to reload photos when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!loading) {
        loadPhotos();
        checkSavedStatus();
      }
    });

    return unsubscribe;
  }, [navigation, loading]);

  // Initial load
  useEffect(() => {
    loadPhotos();
  }, [showSaved, user]);

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'manuscripts', label: 'المخطوطات' },
    { id: 'instruments', label: 'الآلات الموسيقية' },
    { id: 'historical', label: 'الآثار التاريخية' },
    { id: 'mosques', label: 'المساجد' },
    { id: 'architecture', label: 'العمارة' },
    { id: 'artifacts', label: 'القطع الأثرية' },
    { id: 'calligraphy', label: 'الخط العربي' },
    { id: 'cultural', label: 'التراث الثقافي' },
    { id: 'events', label: 'المناسبات' },
    { id: 'people', label: 'الشخصيات' },
    { id: 'landmarks', label: 'المعالم' },
    { id: 'traditions', label: 'التقاليد' },
    { id: 'ceremonies', label: 'الاحتفالات' },
    { id: 'other', label: 'أخرى' }
  ];

  const sortOptions = [
    { id: 'newest', label: 'الأحدث' },
    { id: 'oldest', label: 'الأقدم' },
    { id: 'nameAsc', label: 'الاسم (أ-ي)' },
    { id: 'nameDesc', label: 'الاسم (ي-أ)' },
  ];

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (showSaved && user) {
        console.log('Loading saved photos...');
        response = await api.get(`/api/photos/saved`);
      } else {
        console.log('Loading all photos...');
        response = await api.get('/api/photos');
      }

      console.log('API Response:', response.data);
      const photosData = response.data.data?.photos || response.data.photos || response.data;
      console.log('Processed photos data:', photosData);

      if (Array.isArray(photosData)) {
        // First, get all comments for each photo
        const processedPhotos = await Promise.all(photosData.map(async (photo) => {
          try {
            // Get comments for each photo
            const commentsResponse = await api.get(`/api/comments/photo/${photo._id}`);
            const totalCommentCount = commentsResponse.data.totalCommentCount || 0;
            
            // Get user's saved photos to check save status
            const userResponse = await api.get('/api/users/profile');
            const savedPhotoIds = userResponse.data.savedPhotos?.map(photo => 
              typeof photo === 'object' ? photo._id : photo
            ) || [];
            
            // Ensure isSaved is properly set based on savedBy array and user's saved photos
            const isSaved = savedPhotoIds.includes(photo._id);
            
          return {
          ...photo,
          isLiked: photo.likes?.includes(user?._id),
              isSaved: isSaved,
              commentsCount: totalCommentCount
            };
          } catch (error) {
            console.error(`Error loading comments for photo ${photo._id}:`, error);
            return {
              ...photo,
              isLiked: photo.likes?.includes(user?._id),
              isSaved: photo.savedBy?.includes(user?._id) || false,
              commentsCount: photo.commentsCount || 0
          };
          }
        }));
        
        console.log('Final processed photos:', processedPhotos);
        setPhotos(processedPhotos);
        setFilteredPhotos(processedPhotos);
      } else {
        console.log('No photos array found in response');
        setPhotos([]);
        setFilteredPhotos([]);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      console.error('Error details:', error.response?.data);
      setError('حدث خطأ أثناء تحميل الصور');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (routeShowSaved !== undefined) {
      setShowSaved(routeShowSaved);
    }
  }, [routeShowSaved]);

  useEffect(() => {
    filterAndSortPhotos();
  }, [searchQuery, selectedFilter, selectedSort, photos]);

  const filterAndSortPhotos = () => {
    let filtered = [...photos];
    
    // Arama filtresi uygula
    if (searchQuery) {
      filtered = filtered.filter(photo => 
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Kategori filtresi uygula
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(photo => photo.category === selectedFilter);
    }

    // Sıralama uygula
    switch (selectedSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.title.localeCompare(a.title, 'ar'));
        break;
      default:
        break;
    }

    setFilteredPhotos(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
  };

  const renderPhoto = ({ item }) => {
    console.log('Rendering photo item:', item);
    return (
    <PhotoItem
      item={item}
      navigation={navigation}
      photos={photos}
      setPhotos={setPhotos}
      setFilteredPhotos={setFilteredPhotos}
    />
  );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      if (visibleItem.item._id !== visiblePhotoId) {
        setVisiblePhotoId(visibleItem.item._id);
        console.log('معرف الصورة المرئية:', visibleItem.item._id);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
    waitForInteraction: true
  }).current;

  // İlk fotoğrafı otomatik olarak görünür yap
  useEffect(() => {
    if (filteredPhotos.length > 0 && !visiblePhotoId) {
      setVisiblePhotoId(filteredPhotos[0]._id);
    }
  }, [filteredPhotos, visiblePhotoId]);

  // Add checkSavedStatus function
  const checkSavedStatus = async () => {
    try {
      const response = await api.get('/api/users/profile');
      if (response.data && response.data.savedPhotos) {
        const savedPhotoIds = response.data.savedPhotos.map(photo => 
          typeof photo === 'object' ? photo._id : photo
        );
        
        // Update photos with correct saved status
        setPhotos(prevPhotos => 
          prevPhotos.map(photo => ({
            ...photo,
            isSaved: savedPhotoIds.includes(photo._id)
          }))
        );
        
        setFilteredPhotos(prevFiltered => 
          prevFiltered.map(photo => ({
            ...photo,
            isSaved: savedPhotoIds.includes(photo._id)
          }))
        );
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
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
        <TouchableOpacity style={styles.retryButton} onPress={loadPhotos}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>الصور</Text>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#f2f2d3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن صورة..."
              placeholderTextColor="#f2f2d3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <MaterialIcons name="filter-list" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortScroll}
          contentContainerStyle={styles.sortContainer}
        >
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                selectedSort === option.id && styles.selectedSortOption
              ]}
              onPress={() => setSelectedSort(option.id)}
            >
              <Text style={[
                styles.sortOptionText,
                selectedSort === option.id && styles.selectedSortOptionText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          ref={flatListRef}
          data={filteredPhotos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد صور متاحة</Text>
            </View>
          }
        />

        <Modal
          visible={showFilters}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>تصفية الصور</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <AntDesign name="close" size={24} color="#f2f2d3" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <Text style={styles.filterSectionTitle}>الفئات</Text>
                {filters.map(filter => (
                  <TouchableOpacity 
                    key={filter.id}
                    style={[
                      styles.filterItem,
                      selectedFilter === filter.id && styles.selectedFilterItem
                    ]}
                    onPress={() => {
                      setSelectedFilter(filter.id);
                      setShowFilters(false);
                    }}
                  >
                    <Text style={[
                      styles.filterText,
                      selectedFilter === filter.id && styles.selectedFilterText
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
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
  filterButton: {
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 16,
    paddingVertical: 10,
  },
  sortScroll: {
    maxHeight: 60,
    marginBottom: 15,
  },
  sortContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sortOption: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',
  },
  selectedSortOption: {
    backgroundColor: '#f2f2d3',
  },
  sortOptionText: {
    color: '#f2f2d3',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedSortOptionText: {
    color: '#000000',
  },
  list: {
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'center',
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
    backgroundColor: '#000000',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  photoInfo: {
    flex: 1,
  },
  photoTitle: {
    color: '#f2f2d3',
    fontSize: 13,
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
  filterSectionTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterItem: {
    padding: 10,
  },
  selectedFilterItem: {
    backgroundColor: '#f2f2d3',
  },
  filterText: {
    color: '#f2f2d3',
    fontSize: 14,
  },
  selectedFilterText: {
    color: '#000000',
  },
  modalBody: {
    padding: 20,
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
    width: '100%',
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
  iconBtn: {
    padding: 2,
  },
});

export default PhotosScreen; 