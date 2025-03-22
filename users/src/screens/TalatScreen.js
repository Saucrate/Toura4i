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
import { useAudio } from '../context/AudioContext';

const { width } = Dimensions.get('window');

const TalatScreen = ({ navigation }) => {
  const { playTrack } = useAudio();

  const talat = [
    {
      id: '1',
      title: 'طلعة الشيخ سيديا',
      performer: 'محمد ولد امين',
      poet: 'الشيخ سيديا',
      description: 'من أشهر الطلعات الموريتانية',
      audio: require('../../assets/audio/talat1.mp3'),
      image: require('../../assets/images/talat1.jpg'),
      lyrics: `هنا تكتب كلمات الطلعة
السطر الأول
السطر الثاني
...`,
    },
    {
      id: '2',
      title: 'طلعة المختار ولد حامد',
      performer: 'سيدي ولد محمد',
      poet: 'المختار ولد حامد',
      description: 'طلعة تراثية أصيلة',
      audio: require('../../assets/audio/talat2.mp3'),
      image: require('../../assets/images/talat2.jpg'),
      lyrics: `كلمات الطلعة الثانية
...`,
    },
  ];

  const handlePlayPress = (talat) => {
    const formattedTrack = {
      id: talat.id,
      title: talat.title,
      artist: talat.performer,
      audio: talat.audio,
      image: talat.image,
    };
    playTrack(formattedTrack);
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
          <Text style={styles.headerTitle}>الطلعات</Text>
        </View>

        <FlatList
          data={talat}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TalatDetails', { talat: item })}
            >
              <Image source={item.image} style={styles.image} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
              >
                <View style={styles.content}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.performer && <Text style={styles.performer}>{item.performer}</Text>}
                  <Text style={styles.poet}>{item.poet}</Text>
                </View>
                {item.hasAudio && (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => handlePlayPress(item)}
                  >
                    <Ionicons name="play-circle" size={50} color="#f2f2d3" />
                  </TouchableOpacity>
                )}
              </LinearGradient>
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
    padding: 10,
  },
  card: {
    height: 200,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
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
  content: {
    flex: 1,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'right',
  },
  performer: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
    textAlign: 'right',
  },
  poet: {
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

export default TalatScreen; 