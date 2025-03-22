import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'تراثي',
    subtitle: 'اكتشف روائع التراث الموريتاني',
    description: 'رحلة عبر الزمن في عالم الشعر والفن الموريتاني الأصيل',
    image: require('../../assets/logo.png'),
  },
  {
    id: '2',
    title: 'الشعراء والفنانون',
    subtitle: 'تعرف على أعلام الفن والأدب',
    description: 'مجموعة فريدة من أشهر الشعراء والفنانين الموريتانيين',
    image: require('../../assets/logo.png'),
  },
  {
    id: '3',
    title: 'المكتبة الفنية',
    subtitle: 'استمع وشاهد',
    description: 'مقاطع صوتية وفيديوهات لأجمل الأعمال التراثية',
    image: require('../../assets/logo.png'),
  },
];

const WelcomeScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
  const slidesRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image 
            source={item.image} 
            style={styles.image} 
            resizeMode="contain"
            fadeDuration={0}
            loading="eager"
            cachePolicy="memory-disk"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const Pagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
        viewPosition: 0,
      });
    } else {
      navigation.replace('Home');
    }
  };

  const handleSkip = () => {
    navigation.replace('Home');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0] != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>

        <FlatList
          ref={slidesRef}
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
          onMomentumScrollEnd={() => setIsScrolling(false)}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={false}
          scrollEventThrottle={16}
          decelerationRate="fast"
          keyExtractor={(item) => item.id}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
        
        <View style={styles.bottomContainer}>
          <Pagination />
          <TouchableOpacity 
            style={[styles.button, isScrolling && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={isScrolling}
          >
            <AntDesign 
              name={currentIndex === slides.length - 1 ? "check" : "arrowright"} 
              size={24} 
              color="#f2f2d3" 
            />
          </TouchableOpacity>
        </View>
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
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    color: '#f2f2d3',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 20,
    paddingTop: height * 0.15,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 30,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#f2f2d3',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: '#f2f2d3',
    marginBottom: 15,
    textAlign: 'center',
    opacity: 0.9,
  },
  description: {
    fontSize: 18,
    color: '#f2f2d3',
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f2f2d3',
    marginHorizontal: 5,
  },
  activeDot: {
    width: 20,
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  inactiveDot: {
    width: 10,
    opacity: 0.5,
    transform: [{ scale: 0.8 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  button: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(242, 242, 211, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f2f2d3',
  },
});

export default WelcomeScreen; 