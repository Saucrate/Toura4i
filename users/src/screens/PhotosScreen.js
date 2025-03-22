import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { photoAlbums } from '../data/albums';
import ImageViewer from 'react-native-image-zoom-viewer';

const { width, height } = Dimensions.get('window');

const PhotosScreen = ({ navigation }) => {
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [fullScreenPhoto, setFullScreenPhoto] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          if (currentAlbum) {
            setCurrentAlbum(null);
            setFullScreenPhoto(null);
          } else {
            navigation.goBack();
          }
        }}
      >
        <AntDesign 
          name={currentAlbum ? "close" : "arrowleft"} 
          size={24} 
          color="#f2f2d3" 
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {currentAlbum ? currentAlbum.title : 'ألبومات الصور'}
      </Text>
    </View>
  );

  const renderAlbumCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.albumCard} 
      onPress={() => setCurrentAlbum(item)}
    >
      <Image source={item.coverImage} style={styles.albumImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.albumGradient}
      >
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle}>{item.title}</Text>
          <Text style={styles.albumDescription}>{item.description}</Text>
          <Text style={styles.photoCount}>{item.photos.length} صور</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPhotoThumbnail = ({ item }) => (
    <TouchableOpacity 
      style={styles.photoThumbnail}
      onPress={() => {
        setFullScreenPhoto(item);
      }}
      activeOpacity={0.7}
    >
      <Image source={item.image} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        {renderHeader()}

        {!currentAlbum ? (
          <FlatList
            data={photoAlbums}
            renderItem={renderAlbumCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.albumsList}
          />
        ) : (
          <View style={styles.albumView}>
            <FlatList
              data={currentAlbum.photos}
              renderItem={renderPhotoThumbnail}
              keyExtractor={item => item.id}
              numColumns={3}
              contentContainerStyle={styles.photosGrid}
            />
          </View>
        )}

        <Modal
          visible={!!fullScreenPhoto}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setFullScreenPhoto(null)}
        >
          <ImageViewer
            imageUrls={currentAlbum?.photos.map(photo => ({
              url: Image.resolveAssetSource(photo.image).uri
            }))}
            index={currentAlbum?.photos.findIndex(p => p.id === fullScreenPhoto?.id)}
            enableSwipeDown={true}
            onSwipeDown={() => setFullScreenPhoto(null)}
            onCancel={() => setFullScreenPhoto(null)}
            enableImageZoom={true}
            backgroundColor="rgba(0,0,0,0.95)"
            onChange={(index) => {
              setFullScreenPhoto(currentAlbum?.photos[index]);
            }}
            onShowModal={() => {
              const initialIndex = currentAlbum?.photos.findIndex(p => p.id === fullScreenPhoto?.id);
              setFullScreenPhoto(currentAlbum?.photos[initialIndex]);
            }}
            renderHeader={() => (
              <TouchableOpacity
                style={styles.fullScreenCloseButton}
                onPress={() => setFullScreenPhoto(null)}
              >
                <AntDesign name="close" size={24} color="#f2f2d3" />
              </TouchableOpacity>
            )}
            renderFooter={() => (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.photoInfoGradient}
              >
                <View style={styles.photoInfo}>
                  <Text style={styles.photoTitle}>{fullScreenPhoto?.title}</Text>
                  <Text style={styles.photoDate}>{fullScreenPhoto?.date}</Text>
                  <Text style={styles.photoDescription}>
                    {fullScreenPhoto?.description}
                  </Text>
                </View>
              </LinearGradient>
            )}
          />
        </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 242, 211, 0.1)',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    color: '#f2f2d3',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 24,
  },
  albumsList: {
    padding: 15,
  },
  albumCard: {
    height: 200,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  albumImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  albumGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    padding: 15,
    justifyContent: 'flex-end',
  },
  albumInfo: {
    alignItems: 'flex-end',
  },
  albumTitle: {
    color: '#f2f2d3',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  albumDescription: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
    textAlign: 'right',
  },
  photoCount: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.6,
  },
  albumView: {
    flex: 1,
  },
  photosGrid: {
    padding: 10,
  },
  photoThumbnail: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  photoInfoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 50,
  },
  photoInfo: {
    alignItems: 'flex-end',
  },
  photoTitle: {
    color: '#f2f2d3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  photoDate: {
    color: '#f2f2d3',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 10,
  },
  photoDescription: {
    color: '#f2f2d3',
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    textAlign: 'right',
  },
});

export default PhotosScreen; 