import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Video,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PoemItem = ({ item, navigation, poems, setPoems, setFilteredPoems, visiblePoemId, isLiked, onLike, onVisibilityChange, isActive, isPlaying }) => {
  const { user } = useAuth();
  const [showFullContent, setShowFullContent] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [likeTimeout, setLikeTimeout] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapPosition, setLastTapPosition] = useState({ x: 0, y: 0 });
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const videoRef = useRef(null);
  const soundRef = useRef(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Görünürlük kontrolü
  const isVisible = visiblePoemId === item._id;
  
  // Ses yükleme işlemi
  const loadAndPlayAudio = async () => {
    if (isLoadingAudio || !item.audio) return;
    
    try {
      setIsLoadingAudio(true);
      setAudioError(null);
      console.log('Loading audio from:', item.audio);
      
      // Önce mevcut sesi temizle
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.audio },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      
      // Set up playback status update listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          stopAudio();
        }
      });
      
      // Ses yüklendiğini işaretle
      setIsAudioLoaded(true);
      console.log('Audio loaded successfully');
      
      // Eğer bu şiir görünürse, hemen oynat
      if (isVisible) {
        try {
          await sound.playAsync();
          setIsPlaying(true);
        } catch (playError) {
          console.error('Error playing audio after load:', playError);
        }
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      setAudioError(error.message);
    } finally {
      setIsLoadingAudio(false);
    }
  };
  
  // Otomatik oynatma için useEffect
  useEffect(() => {
    console.log('Poem visibility changed:', { poemId: item._id, isVisible });
    
    const playMedia = async () => {
      try {
        if (isVisible) {
          if (item.audio) {
            // Ses yüklü değilse yükle
            if (!soundRef.current && !isLoadingAudio) {
              await loadAndPlayAudio();
            } else if (soundRef.current && isAudioLoaded) {
              // Ses zaten yüklüyse oynat
              console.log('Playing audio for visible poem');
              await soundRef.current.playAsync();
              setIsPlaying(true);
            }
          } else if (item.video && videoRef.current) {
            console.log('Playing video for visible poem');
            await videoRef.current.playAsync();
            setIsPlaying(true);
          }
        } else {
          if (item.audio && soundRef.current) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
          } else if (item.video && videoRef.current) {
            await videoRef.current.pauseAsync();
            setIsPlaying(false);
          }
        }
      } catch (error) {
        console.error('Media playback error:', error);
      }
    };
    
    playMedia();

    return () => {
      if (item.audio && soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [isVisible]);

  // Load audio when component mounts or when visibility changes
  useEffect(() => {
    if (item.audio && isVisible && !isAudioLoaded && !isLoadingAudio) {
      loadAndPlayAudio();
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [item.audio, isVisible, isAudioLoaded, isLoadingAudio]);

  const stopAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsAudioLoaded(false);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (item.audio) {
        // Ses yüklü değilse yükle
        if (!soundRef.current && !isLoadingAudio) {
          await loadAndPlayAudio();
        }
        
        // Ses yüklendikten sonra oynat/durdur
        if (soundRef.current && isAudioLoaded) {
          if (isPlaying) {
            await soundRef.current.pauseAsync();
          } else {
            await soundRef.current.playAsync();
          }
        } else if (audioError) {
          // Hata varsa yeniden yüklemeyi dene
          await loadAndPlayAudio();
        }
      } else if (item.video) {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

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

      if (onLike) {
        onLike();
        return;
      }

      const response = await api.post('/api/likes/toggle', {
        targetType: 'poem',
        targetId: item._id
      });

      if (response.data.status === 'success') {
        const updatedPoems = poems.map(poem => {
          if (poem._id === item._id) {
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
        setFilteredPoems(updatedPoems);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const response = await api.get(`/api/comments/poem/${item._id}`);
      
      if (response.data && response.data.data) {
        console.log('Comments response:', response.data.data); // Debug log
        
        // Add showReplies property to each comment and set it to false by default
        const commentsWithShowReplies = response.data.data.map(comment => ({
          ...comment,
          showReplies: false // Set to false by default
        }));
        
        setComments(commentsWithShowReplies);
        
        // Update the poem's comment count in the parent component
        if (response.data.totalCommentCount !== undefined) {
          const updatedPoems = poems.map(poem => {
            if (poem._id === item._id) {
              return {
                ...poem,
                commentsCount: response.data.totalCommentCount
              };
            }
            return poem;
          });
          
          setPoems(updatedPoems);
          setFilteredPoems(updatedPoems);
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
        poemId: item._id,
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
        
        // Update poem's comments count
        const updatedPoems = poems.map(poem => {
          if (poem._id === item._id) {
            return {
              ...poem,
              commentsCount: (poem.commentsCount || 0) + 1
            };
          }
          return poem;
        });

        setPoems(updatedPoems);
        setFilteredPoems(updatedPoems);

        // Update the current item's comments count
        item.commentsCount = (item.commentsCount || 0) + 1;
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      loadComments(); // Reload comments in case of error
    }
  };

  useEffect(() => {
    if (showCommentsModal) {
      loadComments();
    }
  }, [showCommentsModal]);

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

  const handlePress = () => {
    onVisibilityChange(!isActive);
  };

  useEffect(() => {
    if (user && user.savedPoems) {
      const saved = user.savedPoems.some(id => id.toString() === item._id.toString());
      setIsSaved(saved);
    }
  }, [user?.savedPoems, item._id]);

  console.log('PoemItem isSaved:', isSaved, 'isLiked:', isLiked, 'item:', item, 'user:', user);

  const handleToggleSave = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    setSaving(true);
    try {
      const response = await api.post(`/api/users/poems/${item._id}/toggle-save`);
      console.log('Toggle save API response:', response.data);
      
      // Update local state
      setIsSaved(response.data.isSaved);
      
      // Update the poem in the parent list
      if (setPoems && setFilteredPoems) {
        const updatedPoems = poems.map(poem => 
          poem._id === item._id 
            ? { ...poem, isSaved: response.data.isSaved }
            : poem
        );
        setPoems(updatedPoems);
        setFilteredPoems(updatedPoems);
      }
    } catch (error) {
      console.error('Save poem error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          style={styles.poetInfo}
          onPress={() => navigation.navigate('PoetDetails', { poetId: item.poet?._id })}
        >
          <Image 
            source={{ uri: item.poet?.image || 'https://via.placeholder.com/40' }} 
            style={styles.poetImage}
          />
          <View style={styles.poetInfoText}>
            <Text style={styles.poetName}>{item.poet?.name}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="more-horiz" size={24} color="#f2f2d3" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.mediaContainer, isActive && styles.activeContainer]}
        onPress={handlePress}
        onLongPress={handleDoubleTap}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/300' }}
          style={styles.poemImage}
        />
        {item.audio ? (
          <>
            <View style={styles.audioContainer}>
              <Text style={styles.audioText}>🎵</Text>
              {!isPlaying && (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={handlePlayPause}
                >
                  <Ionicons name="play" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : item.video ? (
          <Video
            ref={videoRef}
            source={{ uri: item.video }}
            style={styles.poemImage}
            resizeMode="cover"
            shouldPlay={isVisible}
            isLooping
            onPlaybackStatusUpdate={status => setIsPlaying(status.isPlaying)}
          />
        ) : null}
        {renderDoubleTapLikeIndicator()}
      </TouchableOpacity>

      <View style={styles.postActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <AntDesign 
              name={isLiked ? "heart" : "hearto"} 
              size={26} 
              color={isLiked ? "#ff3b30" : "#f2f2d3"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowCommentsModal(true)}
          >
            <AntDesign name="message1" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={24} color="#f2f2d3" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={handleToggleSave} disabled={saving}>
          <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isSaved ? "#f2f2d3" : "#8e8e8e"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.likesCount}>{item.likes?.length || 0} إعجاب</Text>
        <View style={styles.captionContainer}>
          <Text style={styles.poetName}>{item.poet?.name}</Text>
          <Text style={styles.caption}> {item.title}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.content} numberOfLines={showFullContent ? undefined : 2}>
            {item.content}
          </Text>
          {item.content?.length > 80 && (
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
                      <Image 
                        source={{ uri: comment.user?.photo || 'https://via.placeholder.com/40' }} 
                        style={styles.commentUserImage}
                      />
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentUsername}>{comment.user?.name || 'مستخدم'}</Text>
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
                            <Image 
                              source={{ uri: reply.user?.photo || 'https://via.placeholder.com/40' }} 
                              style={styles.replyUserImage}
                            />
                            <View style={styles.replyContent}>
                              <View style={styles.replyHeader}>
                                <Text style={styles.replyUsername}>{reply.user?.name || 'مستخدم'}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000000',
    width: '100%',
    marginHorizontal: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
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
  },
  poetImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  poetInfoText: {
    flex: 1,
  },
  poetName: {
    color: '#f2f2d3',
    fontSize: 13,
    fontWeight: 'bold',
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
  },
  poemImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  audioContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioText: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playButton: {
    padding: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '100%',
    borderWidth: 0,
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
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  caption: {
    color: '#f2f2d3',
    fontSize: 13,
  },
  viewComments: {
    color: '#8e8e8e',
    fontSize: 13,
    marginBottom: 6,
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
  activeContainer: {
    backgroundColor: 'rgba(242, 242, 211, 0.2)',
  },
});

export default PoemItem; 