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

const ManuscriptsScreen = ({ navigation }) => {
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
          <Text style={styles.headerTitle}>المخطوطات</Text>
        </View>

        <FlatList
          data={manuscripts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ManuscriptDetails', { manuscript: item })}
            >
              <Image source={item.image} style={styles.image} />
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.author}>{item.author}</Text>
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
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 15,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  author: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
  },
  description: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
  },
});

export default ManuscriptsScreen; 