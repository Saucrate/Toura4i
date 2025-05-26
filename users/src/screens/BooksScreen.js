import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10;

const BooksScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState([]);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const loadBooks = useCallback(async (shouldRefresh = false) => {
    try {
      setError(null);
      if (shouldRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/api/books', {
        params: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined
        }
      });

      if (response.data && response.data.books) {
        // Get unique categories from books
        const uniqueCategories = [...new Set(response.data.books.map(book => book.category))];
        setCategories(['all', ...uniqueCategories]);

        const booksWithStats = response.data.books.map(book => ({
          ...book,
          isLiked: user ? book.likes?.includes(user._id) : false,
          isSaved: user ? book.savedBy?.includes(user._id) : false,
          likesCount: book.likes?.length || 0,
          commentsCount: book.comments?.length || 0,
          views: book.views || 0
        }));

        setBooks(booksWithStats);
        applySort(booksWithStats);
      } else {
        setBooks([]);
        setFilteredBooks([]);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل الكتب');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery, user]);

  useEffect(() => {
    loadBooks();
  }, [selectedCategory, searchQuery]);

  const applySort = (booksToSort) => {
    let sorted = [...booksToSort];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'mostLiked':
        sorted.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case 'mostCommented':
        sorted.sort((a, b) => b.commentsCount - a.commentsCount);
        break;
      case 'mostViewed':
        sorted.sort((a, b) => b.views - a.views);
        break;
    }
    setFilteredBooks(sorted);
  };

  useEffect(() => {
    applySort(books);
  }, [sortBy, books]);

  const handleRefresh = () => {
    loadBooks(true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleSort = (field) => {
    setSortBy(field);
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate('BookDetails', { bookId: item._id })}
    >
      <Image
        source={{ uri: item.cover }}
        style={styles.bookCover}
        defaultSource={require('../../assets/images/png-transparent-default-avatar-thumbnail.png')}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        
        <TouchableOpacity 
          style={styles.poetContainer}
          onPress={() => navigation.navigate('PoetDetails', { poetId: item.poet._id })}
        >
          <Image
            source={{ uri: item.poet?.image }}
            style={styles.poetImage}
            defaultSource={require('../../assets/images/png-transparent-default-avatar-thumbnail.png')}
          />
          <Text style={styles.poetName}>{item.poet?.name}</Text>
        </TouchableOpacity>

        <Text style={styles.bookYear}>{item.year}</Text>
        <Text style={styles.bookCategory}>{item.category}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <AntDesign name="heart" size={14} color="#e74c3c" />
            <Text style={styles.statText}>{item.likesCount}</Text>
          </View>
          <View style={styles.statItem}>
            <AntDesign name="message1" size={14} color="#f2f2d3" />
            <Text style={styles.statText}>{item.commentsCount}</Text>
          </View>
          <View style={styles.statItem}>
            <AntDesign name="eye" size={14} color="#f2f2d3" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive
      ]}
      onPress={() => handleCategorySelect(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.categoryButtonTextActive
      ]}>
        {category === 'all' ? 'الكل' : category}
      </Text>
    </TouchableOpacity>
  );

  const renderSortMenu = () => (
    <View style={styles.sortMenuContainer}>
      <TouchableOpacity
        style={styles.sortMenuItem}
        onPress={() => {
          handleSort('newest');
          setShowSortMenu(false);
        }}
      >
        <MaterialIcons name="access-time" size={20} color="#f2f2d3" />
        <Text style={[
          styles.sortMenuItemText,
          sortBy === 'newest' && styles.sortMenuItemTextActive
        ]}>الأحدث</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sortMenuItem}
        onPress={() => {
          handleSort('mostLiked');
          setShowSortMenu(false);
        }}
      >
        <AntDesign name="heart" size={20} color="#e74c3c" />
        <Text style={[
          styles.sortMenuItemText,
          sortBy === 'mostLiked' && styles.sortMenuItemTextActive
        ]}>الأكثر إعجاباً</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sortMenuItem}
        onPress={() => {
          handleSort('mostCommented');
          setShowSortMenu(false);
        }}
      >
        <AntDesign name="message1" size={20} color="#f2f2d3" />
        <Text style={[
          styles.sortMenuItemText,
          sortBy === 'mostCommented' && styles.sortMenuItemTextActive
        ]}>الأكثر تعليقاً</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sortMenuItem}
        onPress={() => {
          handleSort('mostViewed');
          setShowSortMenu(false);
        }}
      >
        <AntDesign name="eye" size={20} color="#f2f2d3" />
        <Text style={[
          styles.sortMenuItemText,
          sortBy === 'mostViewed' && styles.sortMenuItemTextActive
        ]}>الأكثر مشاهدة</Text>
      </TouchableOpacity>
    </View>
  );

  if (error && !books.length) {
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
            <Text style={styles.headerTitle}>الكتب</Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadBooks(true)}
          >
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>الكتب</Text>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddBook')}
            >
              <AntDesign name="plus" size={24} color="#f2f2d3" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#f2f2d3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن كتاب..."
              placeholderTextColor="#f2f2d3"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map(renderCategoryButton)}
          </ScrollView>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <MaterialIcons 
              name={showSortMenu ? "keyboard-arrow-up" : "sort"} 
              size={24} 
              color="#f2f2d3" 
            />
          </TouchableOpacity>
        </View>

        {showSortMenu && renderSortMenu()}

        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#f2f2d3']}
              tintColor="#f2f2d3"
            />
          }
          ListEmptyComponent={
            !loading && !error ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>لا توجد كتب متاحة</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f2f2d3" />
              </View>
            ) : null
          }
        />
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
  searchContainer: {
    padding: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  categoriesContainer: {
    flex: 1,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  sortButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  sortMenuContainer: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 5,
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  sortMenuItemText: {
    color: '#f2f2d3',
    fontSize: 14,
    marginLeft: 10,
  },
  sortMenuItemTextActive: {
    color: '#f2f2d3',
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  bookCard: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 10,
    margin: 15,
  },
  bookInfo: {
    flex: 1,
    padding: 15,
    paddingLeft: 0,
  },
  bookTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  poetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  poetImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 8,
  },
  poetName: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'right',
  },
  bookYear: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
    textAlign: 'right',
  },
  bookCategory: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    color: '#f2f2d3',
    fontSize: 12,
  },
  categoryButton: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#f2f2d3',
  },
  categoryButtonText: {
    color: '#f2f2d3',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    padding: 10,
  },
});

export default BooksScreen; 