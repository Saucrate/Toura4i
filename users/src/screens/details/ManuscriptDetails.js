import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ManuscriptDetails = ({ navigation, route }) => {
  const { manuscript } = route.params;

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
          <Text style={styles.headerTitle}>المخطوطة</Text>
        </View>

        <ScrollView style={styles.content}>
          <Image source={manuscript.image} style={styles.image} />
          <View style={styles.details}>
            <Text style={styles.title}>{manuscript.title}</Text>
            <Text style={styles.author}>{manuscript.author}</Text>
            <Text style={styles.description}>{manuscript.description}</Text>
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
  author: {
    color: '#f2f2d3',
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 15,
    textAlign: 'right',
  },
  description: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.6,
    lineHeight: 24,
    textAlign: 'right',
  },
});

export default ManuscriptDetails; 