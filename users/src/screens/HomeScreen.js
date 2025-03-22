import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../context/AudioContext';

const { width, height } = Dimensions.get('window');

const categories = [
  {
    id: '1',
    title: 'الشعراء',
    icon: 'book',
    iconFamily: 'AntDesign',
    screen: 'Poets',
  },
  {
    id: '2',
    title: 'الفنانون',
    icon: 'mic',
    iconFamily: 'Ionicons',
    screen: 'Artists',
  },
  {
    id: '3',
    title: 'القصائد',
    icon: 'profile',
    iconFamily: 'AntDesign',
    screen: 'Poems',
  },
  {
    id: '4',
    title: 'الألبومات',
    icon: 'album',
    iconFamily: 'MaterialIcons',
    screen: 'Albums',
  },
  {
    id: '5',
    title: 'المخطوطات',
    icon: 'document-text',
    iconFamily: 'Ionicons',
    screen: 'Manuscripts',
  },
  {
    id: '6',
    title: 'الطلعات',
    icon: 'people',
    iconFamily: 'Ionicons',
    screen: 'Events',
  },
  {
    id: '7',
    title: 'الصور',
    icon: 'images',
    iconFamily: 'Ionicons',
    screen: 'Photos',
  },
  {
    id: '8',
    title: 'الفيديوهات',
    icon: 'videocam',
    iconFamily: 'Ionicons',
    screen: 'Videos',
  },
];

// Featured poems and songs data
const popularPoems = [
  {
    id: '1',
    title: 'قصيدة البردة',
    poet: 'البوصيري',
    description: 'من أشهر قصائد المديح النبوي',
    audio: require('../../assets/audio/burda.mp3'),
    image: require('../../assets/images/burda.jpg'),
  },
  {
    id: '10',
    title: 'قصيدة الحكمة',
    poet: 'الشيخ سيديا',
    description: 'من روائع الشعر الموريتاني',
    audio: require('../../assets/audio/ghina1.mp3'),
    image: require('../../assets/images/poem1.jpg'),
  },
];

const traditionalSongs = [
  {
    id: '6',
    title: 'تبراع الشوق',
    poet: 'سيدي ولد حبيب',
    description: 'من أجمل التبراع الموريتاني',
    audio: require('../../assets/audio/burda.mp3'),
    image: require('../../assets/images/tebraa1.jpg'),
  },
  {
    id: '8',
    title: 'أغنية الوطن',
    poet: 'عبد الله ولد محمد',
    description: 'من روائع الغناء التقليدي',
    audio: require('../../assets/audio/hamziyah.mp3'),
    image: require('../../assets/images/ghina2.jpg'),
  },
];

// Add this new data array after your existing data arrays
const featuredPoets = [
  {
    id: '1',
    name: 'البوصيري',
    description: 'صاحب قصيدة البردة المشهورة',
    image: require('../../assets/images/busiri.jpg'),
    bio: 'شرف الدين محمد بن سعيد البوصيري (608-696هـ) شاعر مصري مشهور بقصائده في مدح النبي ﷺ',
    poems: [
      {
        id: '1',
        title: 'قصيدة البردة',
        audio: require('../../assets/audio/burda.mp3'),
        image: require('../../assets/images/burda.jpg'),
      },
      {
        id: '3',
        title: 'همزية البوصيري',
        audio: require('../../assets/audio/hamziyah.mp3'),
        image: require('../../assets/images/hamziyah.jpg'),
      }
    ]
  },
  {
    id: '2',
    name: 'الشيخ سيديا',
    description: 'من أعلام الشعر الموريتاني',
    image: require('../../assets/images/poem1.jpg'),
    bio: 'من أشهر شعراء موريتانيا، له العديد من القصائد في مختلف المجالات',
    poems: [
      {
        id: '10',
        title: 'قصيدة الحكمة',
        audio: require('../../assets/audio/ghina1.mp3'),
        image: require('../../assets/images/poem1.jpg'),
      }
    ]
  },
];

// Add new sections data
const manuscripts = [
  {
    id: '1',
    title: 'مخطوطة البردة',
    author: 'البوصيري',
    description: 'نسخة نادرة من القرن الثامن الهجري',
    image: require('../../assets/images/manuscript1.jpg'),
  },
  {
    id: '2',
    title: 'مخطوطة التبراع',
    author: 'سيدي ولد حبيب',
    description: 'مجموعة من التبراع القديم',
    image: require('../../assets/images/manuscript2.jpg'),
  },
];

const events = [
  {
    id: '1',
    title: 'طلعة نواكشوط',
    date: '2023',
    description: 'حفل تراثي في العاصمة',
    image: require('../../assets/images/event1.jpg'),
  },
  {
    id: '2',
    title: 'أمسية تراثية',
    date: '2023',
    description: 'ليلة من التراث الأصيل',
    image: require('../../assets/images/event2.jpg'),
  },
];

const photos = [
  {
    id: '1',
    title: 'صور تراثية',
    description: 'مجموعة من الصور النادرة',
    image: require('../../assets/images/photo1.jpg'),
  },
  {
    id: '2',
    title: 'ألبوم الذكريات',
    description: 'لحظات من التاريخ',
    image: require('../../assets/images/photo2.jpg'),
  },
];

const videos = [
  {
    id: '1',
    title: 'توثيق التراث',
    description: 'سلسلة وثائقية عن التراث',
    thumbnail: require('../../assets/images/video1.jpg'),
    videoUrl: 'path_to_video',
  },
  {
    id: '2',
    title: 'حفلات تراثية',
    description: 'تسجيلات لأهم الحفلات',
    thumbnail: require('../../assets/images/video2.jpg'),
    videoUrl: 'path_to_video',
  },
];

const HomeScreen = ({ navigation }) => {
  const { playTrack } = useAudio();

  const handlePlayTrack = (track) => {
    const formattedTrack = {
      id: track.id,
      title: track.title,
      artist: track.poet,
      audio: track.audio,
      image: track.image,
    };
    playTrack(formattedTrack, [formattedTrack]);
  };

  const renderIcon = (iconName, family) => {
    switch (family) {
      case 'AntDesign':
        return <AntDesign name={iconName} size={32} color="#f2f2d3" />;
      case 'Ionicons':
        return <Ionicons name={iconName} size={32} color="#f2f2d3" />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={32} color="#f2f2d3" />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>تراثي</Text>
            <Text style={styles.headerSubtitle}>التراث الموريتاني</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Favorites')}
            >
              <LinearGradient
                colors={['rgba(242, 242, 211, 0.1)', 'rgba(242, 242, 211, 0.05)']}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="heart" size={28} color="#f2f2d3" />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>المفضلة</Text>
                  <Text style={styles.quickActionSubtitle}>مجموعتك الخاصة</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Playlists')}
            >
              <LinearGradient
                colors={['rgba(242, 242, 211, 0.1)', 'rgba(242, 242, 211, 0.05)']}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialIcons name="playlist-play" size={32} color="#f2f2d3" />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>قوائم التشغيل</Text>
                  <Text style={styles.quickActionSubtitle}>قوائمك المخصصة</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Categories section */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>التصنيفات</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate(category.screen)}
                >
                  {renderIcon(category.icon, category.iconFamily)}
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Featured Poets Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الشعراء المميزون</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Poets')}>
                <Text style={styles.seeAll}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredPoets.map((poet) => (
                <TouchableOpacity
                  key={poet.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('PoetDetails', { poet })}
                >
                  <ImageBackground source={poet.image} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.cardTitle}>{poet.name}</Text>
                      <Text style={styles.cardDescription}>{poet.description}</Text>
                      <Text style={styles.cardBio} numberOfLines={2}>
                        {poet.bio}
                      </Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Popular Poems Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>القصائد المشهورة</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Poems')}>
                <Text style={styles.seeAll}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {popularPoems.map((poem) => (
                <TouchableOpacity
                  key={poem.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('PoemDetails', { poem })}
                >
                  <ImageBackground source={poem.image} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.cardTitle}>{poem.title}</Text>
                      <Text style={styles.cardPoet}>{poem.poet}</Text>
                      <Text style={styles.cardDescription}>{poem.description}</Text>
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => handlePlayTrack(poem)}
                      >
                        <Ionicons name="play-circle" size={40} color="#f2f2d3" />
                      </TouchableOpacity>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Traditional Songs Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الأغاني التقليدية</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Poems')}>
                <Text style={styles.seeAll}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {traditionalSongs.map((song) => (
                <TouchableOpacity
                  key={song.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('PoemDetails', { poem: song })}
                >
                  <ImageBackground source={song.image} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.cardTitle}>{song.title}</Text>
                      <Text style={styles.cardPoet}>{song.poet}</Text>
                      <Text style={styles.cardDescription}>{song.description}</Text>
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => handlePlayTrack(song)}
                      >
                        <Ionicons name="play-circle" size={40} color="#f2f2d3" />
                      </TouchableOpacity>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Manuscripts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>المخطوطات</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Manuscripts')}>
                <Text style={styles.seeAll}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {manuscripts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('ManuscriptDetails', { manuscript: item })}
                >
                  <ImageBackground source={item.image} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardAuthor}>{item.author}</Text>
                      <Text style={styles.cardDescription}>{item.description}</Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Events Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الطلعات</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                <Text style={styles.seeAll}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {events.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('EventDetails', { event: item })}
                >
                  <ImageBackground source={item.image} style={styles.cardImage}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardDate}>{item.date}</Text>
                      <Text style={styles.cardDescription}>{item.description}</Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Photos and Videos sections follow the same pattern */}
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
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f2f2d3',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#f2f2d3',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f2f2d3',
    marginBottom: 20,
    textAlign: 'right',
    paddingRight: 20,
  },
  scrollView: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  quickActionButton: {
    width: width * 0.44,
    height: 90,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(242, 242, 211, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.1)',
  },
  quickActionGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  quickActionSubtitle: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'right',
  },
  categoriesContainer: {
    marginTop: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  categoryCard: {
    width: width * 0.43,
    height: height * 0.15,
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 211, 0.2)',
  },
  categoryTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    marginTop: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAll: {
    color: '#f2f2d3',
    opacity: 0.7,
  },
  card: {
    width: width * 0.8,
    height: height * 0.25,
    marginLeft: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  cardTitle: {
    color: '#f2f2d3',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardPoet: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
  },
  cardDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 10,
  },
  playButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  cardBio: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 5,
  },
  cardDate: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 5,
  },
  cardAuthor: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
  },
});

export default HomeScreen; 