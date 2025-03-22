import React, { useState } from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import OptionsMenu from './OptionsMenu';

const { width } = Dimensions.get('window');

const ContentCard = ({ item, type }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      >
        <Text style={styles.title}>{item.name || item.title}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.44,
    height: 200,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(242, 242, 211, 0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  title: {
    color: '#f2f2d3',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  description: {
    color: '#f2f2d3',
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'right',
  },
});

export default ContentCard; 