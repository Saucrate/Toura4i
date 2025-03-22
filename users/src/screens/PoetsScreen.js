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
import { poets } from '../data/poets'; // Import poets from data file

const PoetsScreen = ({ navigation }) => {
  const renderPoet = ({ item: poet }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PoetDetails', { poet })}
      style={styles.cardContainer}
    >
      <ContentCard 
        item={{
          id: poet.id,
          name: poet.name,
          description: poet.bio,
          image: poet.image
        }}
        type="poet"
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
          <Text style={styles.headerTitle}>الشعراء</Text>
        </View>

        <FlatList
          data={poets}
          renderItem={renderPoet}
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

export default PoetsScreen; 