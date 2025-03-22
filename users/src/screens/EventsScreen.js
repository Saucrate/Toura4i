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
import { AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const EventsScreen = ({ navigation }) => {
  const events = [
    {
      id: '1',
      title: 'مهرجان المدح',
      date: '15 مارس 2024',
      location: 'نواكشوط',
      description: 'مهرجان سنوي للمدح والتراث الموريتاني',
      image: require('../../assets/images/event1.jpg'),
    },
    {
      id: '2',
      title: 'أمسية تراثية',
      date: '20 مارس 2024',
      location: 'نواذيبو',
      description: 'ليلة من التراث الأصيل مع نخبة من الشعراء',
      image: require('../../assets/images/event2.jpg'),
    },
  ];

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
          <Text style={styles.headerTitle}>الفعاليات</Text>
        </View>

        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('EventDetails', { event: item })}
            >
              <Image source={item.image} style={styles.image} />
              <View style={styles.content}>
                <View style={styles.dateContainer}>
                  <AntDesign name="calendar" size={16} color="#f2f2d3" />
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.locationContainer}>
                  <AntDesign name="enviromento" size={16} color="#f2f2d3" />
                  <Text style={styles.location}>{item.location}</Text>
                </View>
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
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  content: {
    padding: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
    marginLeft: 8,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.8,
    marginLeft: 8,
  },
  description: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'right',
  },
});

export default EventsScreen; 