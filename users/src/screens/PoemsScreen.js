import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { poems } from '../data/poems';
import { useAudio } from '../context/AudioContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', title: 'الكل' },
  { id: 'tebraa', title: 'تبراع' },
  { id: 'ghina', title: 'غناء' },
  { id: 'poems', title: 'قصائد' },
];

const PoemsScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

  const filteredPoems = poems.filter(poem => {
    if (activeCategory === 'all') return true;
    return poem.category === activeCategory;
  });

  const handlePlayPress = (poem, e) => {
    e.stopPropagation();
    
    // Convert poem to track format
    const track = {
      id: poem.id,
      title: poem.title,
      artist: poem.poet,
      duration: poem.duration || '0:00',
      audio: poem.audio,
      image: poem.image,
      artwork: poem.image,
    };

    // Convert all poems to track format
    const tracks = filteredPoems.map(p => ({
      id: p.id,
      title: p.title,
      artist: p.poet,
      duration: p.duration || '0:00',
      audio: p.audio,
      image: p.image,
      artwork: p.image,
    }));

    if (currentTrack?.id === poem.id) {
      togglePlayPause();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>القصائد</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Category Tabs */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  activeCategory === category.id && styles.activeTab
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Text 
                  style={[
                    styles.categoryText,
                    activeCategory === category.id && styles.activeText
                  ]}
                  numberOfLines={1}
                >
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Poems List */}
        <ScrollView style={styles.content}>
          {filteredPoems.map(poem => (
            <TouchableOpacity
              key={poem.id}
              style={styles.poemCard}
              onPress={() => navigation.navigate('PoemDetails', { poem })}
            >
              <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={styles.poemGradient}
              >
                <Image source={poem.image} style={styles.poemImage} />
                <View style={styles.poemInfo}>
                  <Text style={styles.poemTitle}>{poem.title}</Text>
                  <Text style={styles.poetName}>{poem.poet}</Text>
                  <Text style={styles.poemCategory}>{poem.category}</Text>
                </View>
                {poem.hasAudio && (
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={(e) => handlePlayPress(poem, e)}
                  >
                    <Ionicons 
                      name={currentTrack?.id === poem.id && isPlaying ? "pause-circle" : "play-circle"} 
                      size={40} 
                      color="#f2f2d3" 
                    />
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    height: 100,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  categoriesContainer: {
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  categoriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  categoryTab: {
    minWidth: 80,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#f2f2d3',
    borderColor: '#f2f2d3',
  },
  categoryText: {
    color: '#f2f2d3',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  activeText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
  },
  poemCard: {
    height: 200,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  poemGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  poemImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  poemInfo: {
    flex: 1,
  },
  poemTitle: {
    color: '#f2f2d3',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'right',
  },
  poetName: {
    color: '#f2f2d3',
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 5,
    textAlign: 'right',
  },
  poemCategory: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'right',
  },
  playButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PoemsScreen; 