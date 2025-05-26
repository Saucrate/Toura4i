import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Share,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Video } from 'expo-av';
import { shareExternally } from '../../utils/shareUtils';

const { width } = Dimensions.get('window');

const PlaceDetails = ({ route, navigation }) => {
  const { placeId } = route.params;
  const { user, token } = useAuth();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const flatListRef = useRef();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const videoRef = useRef(null);
  const commentInputRef = useRef();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadPlaceDetails();
  }, [placeId]);

  const loadPlaceDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/places/${placeId}`);
      const placeData = response.data;
      
      console.log('Raw place details response:', {
        ...placeData,
        likes: placeData.likes?.map(like => ({
          id: like._id,
          name: like.name
        })),
        comments: placeData.comments?.map(comment => ({
          id: comment._id,
          isLiked: comment.isLiked,
          likesCount: comment.likesCount,
          likes: comment.likes?.map(like => like.toString()),
          replies: comment.replies?.map(reply => ({
            id: reply._id,
            isLiked: reply.isLiked,
            likesCount: reply.likesCount,
            likes: reply.likes?.map(like => like.toString())
          }))
        }))
      });
      
      // Set place data and like status
      setPlace(placeData);
      setIsLiked(placeData.isLiked ?? false);
      setLikeCount(placeData.likesCount ?? 0);
      setIsSaved(placeData.isSaved ?? false);
      
      // Process comments with their like statuses
      const processedComments = placeData.comments?.map(comment => {
        const commentObj = {
          ...comment,
          isLiked: comment.isLiked ?? false,
          likesCount: comment.likesCount ?? 0,
          replies: comment.replies?.map(reply => ({
            ...reply,
            isLiked: reply.isLiked ?? false,
            likesCount: reply.likesCount ?? 0
          })) || []
        };
        return commentObj;
      }) || [];
      
      console.log('Processed comments with like statuses:', processedComments.map(c => ({
        id: c._id,
        isLiked: c.isLiked,
        likesCount: c.likesCount,
        likes: c.likes?.map(l => l.toString()),
        replies: c.replies?.map(r => ({
          id: r._id,
          isLiked: r.isLiked,
          likesCount: r.likesCount,
          likes: r.likes?.map(l => l.toString())
        }))
      })));
      
      setComments(processedComments);
      setError(null);
    } catch (err) {
      console.error('Error loading place details:', err);
      setError('حدث خطأ أثناء تحميل تفاصيل المكان');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول للإعجاب بالمكان');
      return;
    }

    try {
      console.log('Sending like request for place:', placeId);
      const response = await api.post(`/api/places/${placeId}/like`);
      console.log('Like response:', response.data);
      
      if (response.data.success) {
        const newIsLiked = response.data.isLiked;
        const newLikesCount = response.data.likesCount;
        
        setIsLiked(newIsLiked);
        setLikeCount(newLikesCount);
        
        setPlace(prevPlace => ({
          ...prevPlace,
          isLiked: newIsLiked,
          likesCount: newLikesCount
        }));
        
        console.log('Updated place like status:', { isLiked: newIsLiked, likesCount: newLikesCount });
      }
    } catch (err) {
      console.error('Error liking place:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء الإعجاب بالمكان');
    }
  };

  const handleCommentLike = async (commentId, replyId = null) => {
    if (!user) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول للإعجاب بالتعليق');
      return;
    }

    try {
      console.log('Sending like request for comment:', { commentId, replyId });
      const response = await api.post(
        `/api/places/${placeId}/comments/${commentId}/like`,
        { replyId }
      );
      
      console.log('Comment like response:', response.data);

      if (response.data.success) {
        const newIsLiked = response.data.isLiked;
        const newLikesCount = response.data.likesCount;
        
        setComments(prevComments => {
          const updatedComments = prevComments.map(comment => {
            if (comment._id === commentId) {
              if (replyId) {
                // Update reply like status
                const updatedComment = {
                  ...comment,
                  replies: comment.replies.map(reply => 
                    reply._id === replyId
                      ? { 
                          ...reply, 
                          isLiked: newIsLiked,
                          likesCount: newLikesCount
                        }
                      : reply
                  )
                };
                console.log('Updated comment with reply like:', {
                  commentId,
                  replyId,
                  isLiked: newIsLiked,
                  likesCount: newLikesCount
                });
                return updatedComment;
              } else {
                // Update comment like status
                const updatedComment = {
                  ...comment,
                  isLiked: newIsLiked,
                  likesCount: newLikesCount
                };
                console.log('Updated comment like:', {
                  commentId,
                  isLiked: newIsLiked,
                  likesCount: newLikesCount
                });
                return updatedComment;
              }
            }
            return comment;
          });
          return updatedComments;
        });
      }
    } catch (err) {
      console.error('Error liking comment:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء الإعجاب بالتعليق');
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
      const response = await api.post(`/api/places/${placeId}/comments`, {
        text: commentText.trim(),
        parentCommentId: replyingTo?._id
      });

      if (response.data) {
        if (replyingTo) {
          setComments(prev => prev.map(comment => {
            if (comment._id === replyingTo._id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), {
                  ...response.data,
                  isReply: true
                }]
              };
            }
            return comment;
          }));
        } else {
          setComments(prev => [{
            ...response.data,
            isReply: false
          }, ...prev]);
        }
        setCommentText('');
        setReplyingTo(null);
        Keyboard.dismiss();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      Alert.alert('خطأ', err.response?.data?.message || 'حدث خطأ أثناء إضافة التعليق');
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
        await shareExternally('place', placeId, place.name, place.description);
      } catch (error) {
        console.error('Error sharing externally:', error);
      }
    } catch (err) {
      console.error('Share error:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء المشاركة');
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول لحفظ المكان');
      return;
    }

    try {
      console.log('Sending save request for place:', placeId);
      const response = await api.post(`/api/users/places/${placeId}/toggle-save`);
      console.log('Save response:', response.data);
      
      setIsSaved(response.data.isSaved);
      
      setPlace(prevPlace => ({
        ...prevPlace,
        isSaved: response.data.isSaved
      }));
      
      console.log('Updated place save status:', { isSaved: response.data.isSaved });
    } catch (err) {
      console.error('Error saving place:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ المكان');
    }
  };

  const renderMediaGallery = () => {
    if (!place?.media?.length) return null;

    const currentMedia = place.media[currentMediaIndex];

    return (
      <View style={styles.mediaContainer}>
        <TouchableOpacity 
          style={styles.mainMediaContainer}
          onPress={() => setShowFullScreen(true)}
          activeOpacity={0.9}
        >
          {currentMedia.type === 'video' ? (
            <Video
              ref={videoRef}
              source={{ uri: currentMedia.url }}
              style={styles.mainMedia}
              useNativeControls
              resizeMode="cover"
              isLooping
              shouldPlay={false}
              posterSource={{ uri: currentMedia.thumbnail }}
              usePoster={true}
            />
          ) : (
            <Image
              source={{ uri: currentMedia.url }}
              style={styles.mainMedia}
              defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
            />
          )}
          {currentMedia.type === 'video' && (
            <View style={styles.videoOverlay}>
              <MaterialIcons name="play-circle-filled" size={40} color="#f2f2d3" />
            </View>
          )}
        </TouchableOpacity>

        {place.media.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mediaThumbnailsContainer}
            contentContainerStyle={styles.mediaThumbnailsContent}
          >
            {place.media.map((media, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.mediaThumbnail,
                  currentMediaIndex === index && styles.mediaThumbnailActive
                ]}
                onPress={() => setCurrentMediaIndex(index)}
              >
                {media.type === 'video' ? (
                  <>
                    <Image
                      source={{ uri: media.thumbnail }}
                      style={styles.mediaThumbnailImage}
                    />
                    <View style={styles.thumbnailVideoIndicator}>
                      <MaterialIcons name="play-circle-filled" size={16} color="#f2f2d3" />
                    </View>
                  </>
                ) : (
                  <Image
                    source={{ uri: media.url }}
                    style={styles.mediaThumbnailImage}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderComment = ({ item }) => (
    <View style={[
      styles.commentBox,
      item.isReply ? styles.replyBox : styles.commentBox
    ]}>
      <View style={styles.commentHeader}>
        <TouchableOpacity onPress={() => {
          if (user && user._id === item.user._id) {
            navigation.navigate('Profile');
          } else {
            navigation.navigate('UserDetails', { userId: item.user._id });
          }
        }}>
          <Image
            source={{ uri: item.user.avatar }}
            style={styles.commentAvatar}
            defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
          />
        </TouchableOpacity>
        <View style={styles.commentUserInfo}>
          <TouchableOpacity onPress={() => {
            if (user && user._id === item.user._id) {
              navigation.navigate('ProfileScreen');
            } else {
              navigation.navigate('UserDetails', { userId: item.user._id });
            }
          }}>
            <Text style={styles.commentUserName}>{item.user.name}</Text>
          </TouchableOpacity>
          <Text style={styles.commentDate}>
            {new Date(item.createdAt).toLocaleDateString('ar-SA')}
          </Text>
        </View>
      </View>
      
      <Text style={styles.commentText}>{item.text}</Text>
      
      <View style={styles.commentActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCommentLike(item._id)}
        >
          <AntDesign 
            name={item.isLiked ? 'heart' : 'hearto'} 
            size={16} 
            color={item.isLiked ? '#e74c3c' : '#f2f2d3'} 
          />
          <Text style={styles.actionText}>{item.likesCount || 0}</Text>
        </TouchableOpacity>
        
        {!item.isReply && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setReplyingTo(item);
              setCommentText('');
              setTimeout(() => {
                commentInputRef.current?.focus();
              }, 100);
            }}
          >
            <Feather name="message-circle" size={16} color="#f2f2d3" />
            <Text style={styles.actionText}>رد</Text>
          </TouchableOpacity>
        )}
      </View>

      {item.replies?.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply) => (
            <View key={reply._id} style={[styles.replyBox, styles.replyBoxHighlight]}>
              <View style={styles.replyHeader}>
                <TouchableOpacity onPress={() => {
                  if (user && user._id === reply.user._id) {
                    navigation.navigate('ProfileScreen');
                  } else {
                    navigation.navigate('UserDetails', { userId: reply.user._id });
                  }
                }}>
                  <Image
                    source={{ uri: reply.user.avatar }}
                    style={styles.replyAvatar}
                    defaultSource={require('../../../assets/images/png-transparent-default-avatar-thumbnail.png')}
                  />
                </TouchableOpacity>
                <View style={styles.replyUserInfo}>
                  <TouchableOpacity onPress={() => {
                    if (user && user._id === reply.user._id) {
                      navigation.navigate('ProfileScreen');
                    } else {
                      navigation.navigate('UserDetails', { userId: reply.user._id });
                    }
                  }}>
                    <Text style={styles.replyUserName}>{reply.user.name}</Text>
                  </TouchableOpacity>
                  <Text style={styles.replyDate}>
                    {new Date(reply.createdAt).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </View>
              <Text style={styles.replyText}>{reply.text}</Text>
              <TouchableOpacity 
                style={styles.replyAction}
                onPress={() => handleCommentLike(item._id, reply._id)}
              >
                <AntDesign 
                  name={reply.isLiked ? 'heart' : 'hearto'} 
                  size={14} 
                  color={reply.isLiked ? '#e74c3c' : '#f2f2d3'} 
                />
                <Text style={styles.actionText}>{reply.likesCount || 0}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderHeader = () => {
    if (!place) return null;

    return (
      <>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل المكان</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSave} style={styles.iconBtn}>
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
                  contentType: 'place',
                  contentId: placeId,
                  title: place.name,
                  description: place.description
                });
              }}
            >
              <Feather name="users" size={22} color="#f2f2d3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
              <Feather name="share" size={22} color="#f2f2d3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLike} style={styles.iconBtn}>
              <AntDesign 
                name={isLiked ? 'heart' : 'hearto'} 
                size={22} 
                color={isLiked ? '#e74c3c' : '#f2f2d3'} 
              />
              <Text style={styles.likeCount}>{likeCount}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderMediaGallery()}

        <View style={styles.infoBox}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeLocation}>{place.location}</Text>
          <View style={styles.row}>
            <Text style={styles.placeYear}>{place.year}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.placeType}>{place.type}</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <AntDesign name="heart" size={16} color="#e74c3c" />
              <Text style={styles.statText}>{likeCount}</Text>
            </View>
            <View style={styles.statItem}>
              <AntDesign name="message1" size={16} color="#f2f2d3" />
              <Text style={styles.statText}>{comments.length}</Text>
            </View>
            <View style={styles.statItem}>
              <AntDesign name="eye" size={16} color="#f2f2d3" />
              <Text style={styles.statText}>{place.views || 0}</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الوصف</Text>
            <Text style={styles.description}>{place.description}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>التعليقات</Text>
          </View>
        </View>
      </>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadPlaceDetails}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <Text style={styles.emptyText}>لا توجد تعليقات بعد</Text>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
          />
          <View style={styles.commentInputContainer}>
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder={replyingTo ? `الرد على ${replyingTo.user.name}...` : "اكتب تعليقك..."}
              placeholderTextColor="#aaa"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              blurOnSubmit={false}
              onSubmitEditing={handleCommentSubmit}
            />
            <TouchableOpacity 
              onPress={handleCommentSubmit}
              disabled={!commentText.trim()}
              style={styles.sendButton}
            >
              <Feather 
                name="send" 
                size={22} 
                color={commentText.trim() ? "#f2f2d3" : "#666"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>

      {showFullScreen && (
        <Modal
          visible={showFullScreen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFullScreen(false)}
        >
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity
              style={styles.fullScreenCloseButton}
              onPress={() => setShowFullScreen(false)}
            >
              <AntDesign name="close" size={24} color="#f2f2d3" />
            </TouchableOpacity>
            {place.media[currentMediaIndex].type === 'video' ? (
              <Video
                ref={videoRef}
                source={{ uri: place.media[currentMediaIndex].url }}
                style={styles.fullScreenMedia}
                useNativeControls
                resizeMode="contain"
                shouldPlay={true}
                isLooping
              />
            ) : (
              <Image
                source={{ uri: place.media[currentMediaIndex].url }}
                style={styles.fullScreenMedia}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 50,
  },
  backButton: { marginRight: 15 },
  headerTitle: {
    color: '#f2f2d3', fontSize: 22, fontWeight: 'bold', textAlign: 'right', flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  likeCount: { color: '#f2f2d3', fontSize: 13, marginLeft: 3 },
  placeImage: {
    width: width,
    height: 260,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  infoBox: { padding: 20 },
  placeName: {
    color: '#f2f2d3', fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'right',
  },
  placeLocation: {
    color: '#f2f2d3', fontSize: 18, opacity: 0.8, marginBottom: 8, textAlign: 'right',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'flex-end',
  },
  placeYear: {
    color: '#f2f2d3', fontSize: 15, opacity: 0.7, marginLeft: 6,
  },
  dot: {
    color: '#f2f2d3', fontSize: 15, opacity: 0.7, marginHorizontal: 4,
  },
  placeType: {
    color: '#f2f2d3', fontSize: 15, opacity: 0.7, marginRight: 6,
  },
  section: {
    marginTop: 10, backgroundColor: 'rgba(242, 242, 211, 0.08)', borderRadius: 15, padding: 15,
  },
  sectionTitle: {
    color: '#f2f2d3', fontSize: 17, fontWeight: 'bold', marginBottom: 8, textAlign: 'right',
  },
  description: {
    color: '#f2f2d3', fontSize: 16, lineHeight: 24, textAlign: 'right',
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
  },
  sendButton: {
    padding: 10,
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
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#f2f2d3',
    fontSize: 13,
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
  replyBoxHighlight: {
    backgroundColor: 'rgba(242,242,211,0.05)',
    borderLeftWidth: 2,
    borderLeftColor: '#f2f2d3',
    marginLeft: 20,
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
  },
  replyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },
  emptyText: { color: '#f2f2d3', fontSize: 15, textAlign: 'center', marginTop: 10 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#f2f2d3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
  },
  mediaContainer: {
    marginBottom: 15,
  },
  mainMediaContainer: {
    width: width,
    height: 260,
    position: 'relative',
  },
  mainMedia: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  mediaThumbnailsContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
  },
  mediaThumbnailsContent: {
    paddingRight: 5,
  },
  mediaThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginLeft: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mediaThumbnailActive: {
    borderColor: '#f2f2d3',
  },
  mediaThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailVideoIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
    padding: 10,
  },
  fullScreenMedia: {
    width: width,
    height: width,
  },
});

export default PlaceDetails; 