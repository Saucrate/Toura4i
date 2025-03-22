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

const albums = [
  {
    id: '1',
    title: 'روائع المديح النبوي',
    description: 'مختارات من أجمل قصائد المديح',
    image: require('../../assets/images/burda.jpg'),
    tracks: [
      {
        id: '1',
        title: 'قصيدة البردة',
        artist: 'البوصيري',
        duration: '4:30',
        audio: require('../../assets/audio/track1.mp3'),
        image: require('../../assets/images/burda.jpg'),
      },
      {
        id: '2',
        title: 'همزية البوصيري',
        artist: 'البوصيري',
        duration: '5:15',
        audio: require('../../assets/audio/track2.mp3'),
        image: require('../../assets/images/hamziyah.jpg'),
      }
    ]
  },
  {
    id: '2',
    title: 'مختارات من التبراع',
    description: 'أجمل ما غُني في التبراع',
    image: require('../../assets/images/tebraa1.jpg'),
    tracks: [
      {
        id: '3',
        title: 'تبراع الشوق',
        artist: 'سيدي ولد حبيب',
        duration: '5:20',
        audio: require('../../assets/audio/track3.mp3'),
        image: require('../../assets/images/tebraa1.jpg'),
      },
      {
        id: '4',
        title: 'ليالي الصحراء',
        artist: 'محمد ولد أحمد',
        duration: '4:45',
        audio: require('../../assets/audio/track4.mp3'),
        image: require('../../assets/images/tebraa2.jpg'),
      }
    ]
  },
  {
    id: '3',
    title: 'روائع الغناء الموريتاني',
    description: 'مختارات من الغناء العصري',
    image: require('../../assets/images/ghina1.jpg'),
    tracks: [
      {
        id: '5',
        title: 'الغنه الأولى',
        artist: 'محمد ولد امين',
        duration: '4:30',
        audio: require('../../assets/audio/track5.mp3'),
        image: require('../../assets/images/ghina1.jpg'),
      },
      {
        id: '6',
        title: 'نسيم الفجر',
        artist: 'محمد فال ولد عبد اللطيف',
        duration: '5:30',
        audio: require('../../assets/audio/track1.mp3'),
        image: require('../../assets/images/ghina3.jpg'),
      }
    ]
  }
];

const AlbumsScreen = ({ navigation }) => {
  const renderAlbum = ({ item: album }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AlbumDetails', { album })}
      style={styles.cardContainer}
    >
      <ContentCard 
        item={{
          id: album.id,
          name: album.title,
          description: album.description,
          image: album.image
        }}
        type="album"
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
          <Text style={styles.headerTitle}>الألبومات</Text>
        </View>

        <FlatList
          data={albums}
          renderItem={renderAlbum}
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

export default AlbumsScreen; 