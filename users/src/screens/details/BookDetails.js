import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { shareExternally, copyShareLink } from '../../utils/shareUtils';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const BookDetails = ({ route, navigation }) => {
  const { bookId } = route.params;
  const { user, signed, signOut } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const flatListRef = useRef();
  const scrollViewRef = useRef();
  const commentInputRef = useRef();

  const loadBookDetails = async () => {
    try {
      setError(null);
      
      console.log('Loading book details:', {
        bookId,
        hasToken: !!api.defaults.headers.common['authorization'],
        userId: user?._id
      });

      const response = await api.get(`/api/books/${bookId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.data && response.data._id) {
        const bookData = response.data;
        
        // Check if user has liked the book (only if user is logged in)
        if (user) {
          const isLikedByUser = bookData.likes?.some(like => 
            like._id?.toString() === user._id.toString() || like.toString() === user._id.toString()
          );
          setIsLiked(isLikedByUser);
          // Update isSaved based on savedBy array
          const isSavedByUser = bookData.savedBy?.includes(user._id) || false;
          setIsSaved(isSavedByUser);
        }

        // Process comments and their likes
        if (bookData.comments) {
          const processedComments = bookData.comments.map(comment => {
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
          setBook({
            ...bookData,
            comments: processedComments
          });
        } else {
          setComments([]);
          setBook(bookData);
        }
      } else {
        setError('لم يتم العثور على الكتاب');
      }
    } catch (err) {
      console.error('Error loading book details:', err);
      if (err.response?.status === 404) {
        setError('لم يتم العثور على الكتاب');
      } else {
        setError('حدث خطأ أثناء تحميل تفاصيل الكتاب');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
    loadBookDetails();
    }, [bookId, user])
  );

  const handleLike = async () => {
    try {
      if (!signed) {
        Alert.alert(
          'تسجيل الدخول مطلوب',
          'يجب تسجيل الدخول لتتمكن من الإعجاب بالكتاب',
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

      const response = await api.post(`/api/books/${bookId}/like`);

      if (response.data.success) {
        setIsLiked(response.data.isLiked);
        setBook(prev => ({
          ...prev,
          likesCount: response.data.likesCount
        }));
      }
    } catch (error) {
      console.error('Like error:', error);
      if (error.response?.status === 401) {
        await signOut();
        Alert.alert(
          'تسجيل الدخول مطلوب',
          'يرجى تسجيل الدخول مرة أخرى',
          [
            {
              text: 'تسجيل الدخول',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الإعجاب');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      // Optimistically update UI
      setIsSaved(prev => !prev);

      const response = await api.post(`/api/users/books/${bookId}/toggle-save`);

      if (response.data.status === 'success') {
        // Update with server response
        setIsSaved(response.data.isSaved);
        setBook(prev => ({
          ...prev,
          savedBy: response.data.isSaved
            ? [...(prev.savedBy || []), user._id]
            : (prev.savedBy || []).filter(id => id !== user._id)
        }));
      } else {
        // Revert optimistic update if server response is not successful
        setIsSaved(prev => !prev);
      }
    } catch (error) {
      console.error('Save error:', error);
      // Revert optimistic update on error
      setIsSaved(prev => !prev);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الكتاب');
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
        await shareExternally('book', bookId, book.title, book.description);
    } catch (error) {
        console.error('Error sharing externally:', error);
      }
    } catch (err) {
      console.error('Share error:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء المشاركة');
    }
  };

  const openPdf = async () => {
    if (!book.link) {
      Alert.alert('خطأ', 'لا يوجد رابط للكتاب');
      return;
    }

    try {
      setIsPdfOpen(true);
      await WebBrowser.openBrowserAsync(book.link);
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء فتح الكتاب');
    } finally {
      setIsPdfOpen(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const newComment = await api.post('/api/comments', {
        targetType: 'book',
        targetId: bookId,
        text: commentText
      });
      setComments(prev => [...prev, newComment]);
    setCommentText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء إضافة التعليق');
    }
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const newReply = await api.post('/api/replies', {
        targetType: 'book',
        targetId: bookId,
        commentId: commentId,
        text: replyText
      });
      setComments(prev =>
        prev.map(c =>
          c._id === commentId
            ? { ...c, replies: [...c.replies, newReply] }
          : c
      )
    );
    setReplyText('');
    setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء إضافة الرد');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditBook', { bookId });
  };

  const handleDelete = async () => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا الكتاب؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/books/${bookId}`);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting book:', error);
              Alert.alert('خطأ', error.message || 'حدث خطأ أثناء حذف الكتاب');
            }
          },
        },
      ]
    );
  };

  const handleAuthError = () => {
    try {
      // Clear auth token from API headers
      api.defaults.headers.common['authorization'] = '';
      
      // Show alert to user
      Alert.alert(
        'انتهت صلاحية الجلسة',
        'يرجى تسجيل الدخول مرة أخرى',
        [
          {
            text: 'تسجيل الدخول',
            onPress: () => {
              // Reset navigation stack and redirect to login
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Auth',
                    params: {
                      screen: 'Login',
                      params: {
                        redirectBack: true,
                        redirectParams: { bookId }
                      }
                    }
                  }
                ]
              });
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('خطأ', 'يرجى تسجيل الدخول للمتابعة');
    }
  };

  const handleCommentSubmit = async () => {
    if (!signed) {
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
      const response = await api.post(`/api/books/${bookId}/comments`, {
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
      if (err.response?.status === 401) {
        await signOut();
        Alert.alert(
          'تسجيل الدخول مطلوب',
          'يرجى تسجيل الدخول مرة أخرى',
          [
            {
              text: 'تسجيل الدخول',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('خطأ', err.response?.data?.message || 'حدث خطأ أثناء إضافة التعليق');
      }
    }
  };

  const handleCommentLike = async (commentId, replyId = null) => {
    try {
      if (!signed) {
        Alert.alert(
          'تسجيل الدخول مطلوب',
          'يجب عليك تسجيل الدخول للإعجاب بالتعليقات',
          [
            {
              text: 'تسجيل الدخول',
              onPress: () => navigation.navigate('Login', { 
                screen: 'Login',
                params: { redirectTo: 'BookDetails', bookId: book._id }
              })
            },
            {
              text: 'إلغاء',
              style: 'cancel'
            }
          ]
        );
        return;
      }

      const url = `/api/books/${book._id}/comments/${commentId}/like`;
      console.log('Making request to:', url);
      console.log('Request params:', { bookId: book._id, commentId, isReply: !!replyId, replyId });

      const response = await api.post(url, { replyId });
      console.log('Like response:', response.data);

      // Update both book and comments states
      setBook(prevBook => {
        const newBook = { ...prevBook };
        const comment = newBook.comments.find(c => c._id === commentId);
        
        if (comment) {
          if (replyId) {
            const reply = comment.replies.find(r => r._id === replyId);
            if (reply) {
              reply.isLiked = response.data.isLiked;
              reply.likes = response.data.likes;
              reply.likesCount = response.data.likesCount;
            }
          } else {
            comment.isLiked = response.data.isLiked;
            comment.likes = response.data.likes;
            comment.likesCount = response.data.likesCount;
          }
        }
        
        return newBook;
      });

      // Update comments state for FlatList
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            if (replyId) {
              // Update reply like status
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply._id === replyId
                    ? {
                        ...reply,
                        isLiked: response.data.isLiked,
                        likes: response.data.likes,
                        likesCount: response.data.likesCount
                      }
                    : reply
                )
              };
            } else {
              // Update comment like status
              return {
                ...comment,
                isLiked: response.data.isLiked,
                likes: response.data.likes,
                likesCount: response.data.likesCount
              };
            }
          }
          return comment;
        })
      );
    } catch (error) {
      console.error('Error liking comment:', error);
      console.error('Error details:', {
        data: error.response?.data,
        endpoint: error.config?.url,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        handleAuthError(error);
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء الإعجاب بالتعليق');
      }
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setCommentText('');
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  const handleDownloadPress = async () => {
    try {
      if (!book?.link) {
        Alert.alert('خطأ', 'رابط الكتاب غير متوفر');
        return;
      }

      const supported = await Linking.canOpenURL(book.link);
      if (supported) {
        await Linking.openURL(book.link);
      } else {
        Alert.alert('خطأ', 'لا يمكن فتح رابط الكتاب');
      }
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل الكتاب');
    }
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
              navigation.navigate('Profile');
            } else {
              navigation.navigate('UserDetails', { userId: item.user._id });
            }
          }}>
            <Text style={styles.commentUserName}>{item.user.name}</Text>
          </TouchableOpacity>
          <Text style={styles.commentDate}>{new Date(item.createdAt).toLocaleDateString('ar-SA')}</Text>
        </View>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity 
          onPress={() => handleCommentLike(item._id)}
          style={styles.actionButton}
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
            onPress={() => handleReply(item)}
            style={styles.actionButton}
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
                    navigation.navigate('Profile');
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
                      navigation.navigate('Profile');
                    } else {
                      navigation.navigate('UserDetails', { userId: reply.user._id });
                    }
                  }}>
                    <Text style={styles.replyUserName}>{reply.user.name}</Text>
                  </TouchableOpacity>
                  <Text style={styles.replyDate}>{new Date(reply.createdAt).toLocaleDateString('ar-SA')}</Text>
                </View>
              </View>
              <Text style={styles.replyText}>{reply.text}</Text>
              <TouchableOpacity 
                onPress={() => handleCommentLike(item._id, reply._id)}
                style={styles.replyAction}
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

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f2f2d3" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
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
            <Text style={styles.headerTitle}>تفاصيل الكتاب</Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadBookDetails}
            >
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
    </View>
  );
  }

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#f2f2d3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الكتاب</Text>
        <View style={styles.headerActions}>
          {user?.role === 'admin' && (
            <>
              <TouchableOpacity onPress={handleEdit} style={styles.iconBtn}>
                <AntDesign name="edit" size={22} color="#f2f2d3" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
                <AntDesign name="delete" size={22} color="#ff4444" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => {
              if (!user) {
                Alert.alert('تنبيه', 'يجب تسجيل الدخول للمشاركة مع المتابعين');
                return;
              }
              navigation.navigate('ShareWithFollowers', {
                contentType: 'book',
                contentId: bookId,
                title: book.title,
                description: book.description
              });
            }}
          >
            <Feather name="users" size={22} color="#f2f2d3" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
            <Feather name="share" size={22} color="#f2f2d3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={handleSave}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isSaved ? "#ffffff" : "#f2f2d3"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLike} style={styles.iconBtn}>
            <AntDesign 
              name={isLiked ? 'heart' : 'hearto'} 
              size={22} 
              color={isLiked ? '#e74c3c' : '#f2f2d3'} 
            />
            <Text style={styles.likeCount}>{book.likesCount || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bookHeaderContainer}>
      <View style={styles.bookHeader}>
        <Image
          source={{ uri: book.cover }}
          style={styles.bookCover}
            defaultSource={require('../../../assets/poems-bg.jpg')}
        />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{book.title}</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('PoetDetails', { poetId: book.poet._id })}
              style={styles.poetContainer}
            >
              <View style={styles.poetInfo}>
                <Image
                  source={{ uri: book.poet?.image }}
                  style={styles.poetImage}
                  defaultSource={require('../../../assets/poems-bg.jpg')}
                />
                <View style={styles.poetTextContainer}>
                  <Text style={styles.bookAuthor}>{book.poet?.name}</Text>
                  {book.poet?.period && (
                    <Text style={styles.poetPeriod}>{book.poet.period}</Text>
                  )}
                </View>
                <AntDesign name="right" size={14} color="#f2f2d3" style={styles.poetArrow} />
              </View>
            </TouchableOpacity>
            <View style={styles.bookMetaContainer}>
              <View style={styles.bookMetaItem}>
                <MaterialIcons name="calendar-today" size={16} color="#f2f2d3" style={styles.metaIcon} />
                <Text style={styles.bookMetaText}>{book.year}</Text>
              </View>
              <View style={styles.bookMetaItem}>
                <MaterialIcons name="category" size={16} color="#f2f2d3" style={styles.metaIcon} />
                <Text style={styles.bookMetaText}>{book.category}</Text>
              </View>
              <View style={styles.bookMetaItem}>
                <MaterialIcons name="visibility" size={16} color="#f2f2d3" style={styles.metaIcon} />
                <Text style={styles.bookMetaText}>{book.views || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="description" size={20} color="#f2f2d3" />
        <Text style={styles.sectionTitle}>الوصف</Text>
        </View>
        <Text style={styles.description}>{book.description}</Text>
      </View>

      <TouchableOpacity
        style={styles.pdfButton}
        onPress={openPdf}
        disabled={isPdfOpen}
      >
        <View style={styles.pdfButtonContent}>
        <Ionicons name="document-text" size={24} color="#f2f2d3" />
        <Text style={styles.pdfButtonText}>
            {isPdfOpen ? 'جاري فتح الكتاب...' : 'فتح الكتاب'}
        </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="comment" size={20} color="#f2f2d3" />
        <Text style={styles.sectionTitle}>التعليقات</Text>
        </View>
      </View>
    </>
  );

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
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.commentInputContainer}>
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="اكتب تعليقك..."
              placeholderTextColor="#aaa"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              blurOnSubmit={false}
              onSubmitEditing={handleCommentSubmit}
            />
            <TouchableOpacity 
              onPress={handleCommentSubmit}
              style={styles.sendButton}
            >
              <Feather name="send" size={22} color="#f2f2d3" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  backButton: { padding: 10 },
  headerTitle: {
    color: '#f2f2d3', fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    color: '#f2f2d3',
    fontSize: 13,
    marginLeft: 4,
  },
  content: { flex: 1 },
  bookHeaderContainer: {
    marginBottom: 20,
    padding: 15,
  },
  bookHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  bookCover: {
    width: 130,
    height: 195,
    borderRadius: 10,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  bookTitle: {
    color: '#f2f2d3',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  poetContainer: {
    marginBottom: 15,
  },
  poetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    padding: 8,
    borderRadius: 10,
  },
  poetImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
  },
  poetTextContainer: {
    flex: 1,
  },
  bookAuthor: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
  poetPeriod: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
    marginTop: 2,
  },
  poetArrow: {
    opacity: 0.8,
  },
  bookMetaContainer: {
    marginTop: 10,
    gap: 8,
  },
  bookMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  metaIcon: {
    marginLeft: 8,
    opacity: 0.8,
  },
  bookMetaText: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'right',
  },
  section: {
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    margin: 15,
    marginTop: 0,
    borderRadius: 15,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  description: {
    color: '#f2f2d3',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    opacity: 0.9,
  },
  pdfButton: {
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    overflow: 'hidden',
  },
  pdfButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  pdfButtonText: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
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
  commentText: { color: '#f2f2d3', fontSize: 15, textAlign: 'right' },
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#f2f2d3',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#f2f2d3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  replyBoxHighlight: {
    backgroundColor: 'rgba(242,242,211,0.05)',
    borderLeftWidth: 2,
    borderLeftColor: '#f2f2d3',
    marginLeft: 20,
  },
});

export default BookDetails; 