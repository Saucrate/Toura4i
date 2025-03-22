import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import ContentCard from '../components/ContentCard';

const artists = [
  {
    id: '1',
    name: 'البوصيري',
    description: 'صاحب قصيدة البردة المشهورة',
    image: require('../../assets/images/busiri.jpg'),
    bio: 'شرف الدين محمد بن سعيد البوصيري (608-696هـ) شاعر مصري مشهور بقصائده في مدح النبي ﷺ',
    tracks: [
      {
        id: '1',
        title: 'قصيدة البردة',
        duration: '4:30',
        audio: require('../../assets/audio/track1.mp3'),
        image: require('../../assets/images/burda.jpg'),
      },
      {
        id: '2',
        title: 'همزية البوصيري',
        duration: '5:15',
        audio: require('../../assets/audio/track2.mp3'),
        image: require('../../assets/images/hamziyah.jpg'),
      }
    ]
  },
  {
    id: '2',
    name: 'سيدي ولد حبيب',
    description: 'من رواد التبراع الموريتاني',
    image: require('../../assets/images/tebraa1.jpg'),
    bio: 'من أشهر رواد الغناء التقليدي في موريتانيا، له العديد من الأعمال المميزة في التبراع',
    tracks: [
      {
        id: '3',
        title: 'تبراع الشوق',
        duration: '5:20',
        audio: require('../../assets/audio/track3.mp3'),
        image: require('../../assets/images/tebraa1.jpg'),
      },
      {
        id: '4',
        title: 'ليالي الصحراء',
        duration: '4:45',
        audio: require('../../assets/audio/track4.mp3'),
        image: require('../../assets/images/tebraa2.jpg'),
      }
    ]
  },
  {
    id: '3',
    name: 'محمد ولد امين',
    description: 'رائد الغناء العصري',
    image: require('../../assets/images/ghina1.jpg'),
    bio: 'من أبرز المطربين في الغناء الموريتاني الحديث، له بصمة خاصة في تطوير الموسيقى الموريتانية',
    tracks: [
      {
        id: '5',
        title: 'الغنه الأولى',
        duration: '4:30',
        audio: require('../../assets/audio/track5.mp3'),
        image: require('../../assets/images/ghina1.jpg'),
      },
      {
        id: '6',
        title: 'نسيم الفجر',
        duration: '5:30',
        audio: require('../../assets/audio/track1.mp3'), // Reusing working audio
        image: require('../../assets/images/ghina3.jpg'),
      }
    ]
  }
];

const ArtistsScreen = ({ navigation }) => {
  const renderArtist = ({ item: artist }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ArtistDetails', { artist })}
      style={styles.cardContainer}
    >
      <ContentCard 
        item={{
          id: artist.id,
          name: artist.name,
          description: artist.description,
          image: artist.image
        }}
        type="artist"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#f2f2d3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الفنانون</Text>
        </View>

        <FlatList
          data={artists}
          renderItem={renderArtist}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id}
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
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
  },
  columnWrapper: {
    justifyContent: 'space-evenly',
  },
  listContent: {
    padding: 10,
  },
  cardContainer: {
    width: '45%',
    margin: 8,
  },
});

export default ArtistsScreen; 