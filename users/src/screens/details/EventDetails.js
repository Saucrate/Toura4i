import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import { talat } from '../../data/talat';

const { width, height } = Dimensions.get('window');

const EventDetails = ({ navigation, route }) => {
  const { event } = route.params;
  
  // Get talat for this event
  const eventTalat = talat.filter(t => t.eventId === event.id);

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
          <Text style={styles.headerTitle}>الفعالية</Text>
        </View>

        <ScrollView style={styles.content}>
          <Image source={event.image} style={styles.image} />
          
          <View style={styles.details}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.dateLocationContainer}>
              <View style={styles.infoRow}>
                <AntDesign name="calendar" size={16} color="#f2f2d3" />
                <Text style={styles.infoText}>{event.date}</Text>
              </View>
              <View style={styles.infoRow}>
                <AntDesign name="enviromento" size={16} color="#f2f2d3" />
                <Text style={styles.infoText}>{event.location}</Text>
              </View>
            </View>
            <Text style={styles.description}>{event.description}</Text>

            {eventTalat.length > 0 && (
              <View style={styles.talatSection}>
                <Text style={styles.sectionTitle}>الطلعات المقدمة:</Text>
                <FlatList
                  data={eventTalat}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.talatCard}
                      onPress={() => navigation.navigate('TalatDetails', { talat: item })}
                    >
                      <Image source={item.image} style={styles.talatImage} />
                      <View style={styles.talatInfo}>
                        <Text style={styles.talatTitle}>{item.title}</Text>
                        {item.performer && (
                          <Text style={styles.talatPerformer}>{item.performer}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
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
  },
  content: {
    flex: 1,
  },
  image: {
    width: width,
    height: height * 0.4,
    resizeMode: 'cover',
  },
  details: {
    padding: 20,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  dateLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  infoText: {
    color: '#f2f2d3',
    fontSize: 18,
    opacity: 0.8,
  },
  description: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.6,
    lineHeight: 24,
    textAlign: 'right',
  },
  talatSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  talatCard: {
    marginRight: 10,
  },
  talatImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    resizeMode: 'cover',
  },
  talatInfo: {
    padding: 5,
  },
  talatTitle: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  talatPerformer: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
  },
});

export default EventDetails; 