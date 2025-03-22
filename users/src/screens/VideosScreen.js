import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');

const VideosScreen = ({ navigation }) => {
  const videos = [
    {
      id: '1',
      title: 'طلعة الشيخ سيديا',
      performer: 'محمد ولد امين',
      description: 'طلعة تراثية من التراث الموريتاني الأصيل',
      thumbnail: require('../../assets/images/video1.jpg'),
      videoUrl: require('../../assets/videos/video1.mp4'),
    },
    {
      id: '2',
      title: 'طلعة المختار ولد حامد',
      performer: 'سيدي ولد محمد',
      description: 'من روائع الطلعات الموريتانية',
      thumbnail: require('../../assets/images/video2.jpg'),
      videoUrl: require('../../assets/videos/video2.mp4'),
    },
  ];

  const handleVideoPress = (video) => {
    navigation.navigate('VideoPlayer', { video });
  };

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
          <Text style={styles.headerTitle}>الفيديوهات</Text>
        </View>

        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleVideoPress(item)}
            >
              <View style={styles.thumbnailContainer}>
                <Image source={item.thumbnail} style={styles.thumbnail} />
                <View style={styles.playIconContainer}>
                  <Ionicons name="play-circle" size={50} color="#f2f2d3" />
                </View>
              </View>
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.performer}>{item.performer}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
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
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    padding: 15,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  performer: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
    textAlign: 'right',
  },
  description: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'right',
  },
});

export default VideosScreen; 