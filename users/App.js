import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Import screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import PoetsScreen from './src/screens/PoetsScreen';
import ArtistsScreen from './src/screens/ArtistsScreen';
import PoemsScreen from './src/screens/PoemsScreen';
import AlbumsScreen from './src/screens/AlbumsScreen';
import FeaturedScreen from './src/screens/FeaturedScreen';
import PoetDetails from './src/screens/details/PoetDetails';
import ArtistDetails from './src/screens/details/ArtistDetails';
import PoemDetails from './src/screens/details/PoemDetails';
import AlbumDetails from './src/screens/details/AlbumDetails';
import PlayerScreen from './src/screens/PlayerScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import PlaylistDetailsScreen from './src/screens/PlaylistDetailsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import { AudioProvider } from './src/context/AudioContext';
import MiniPlayer from './src/components/MiniPlayer';
import GlobalMiniPlayer from './src/components/GlobalMiniPlayer';
import ManuscriptsScreen from './src/screens/ManuscriptsScreen';
import EventsScreen from './src/screens/EventsScreen';
import PhotosScreen from './src/screens/PhotosScreen';
import VideosScreen from './src/screens/VideosScreen';
import ManuscriptDetails from './src/screens/details/ManuscriptDetails';
import EventDetails from './src/screens/details/EventDetails';
import VideoPlayer from './src/screens/VideoPlayer';
import TalatScreen from './src/screens/TalatScreen';
import TalatDetails from './src/screens/details/TalatDetails';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{ 
            headerShown: false,
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Poets" component={PoetsScreen} />
          <Stack.Screen name="Artists" component={ArtistsScreen} />
          <Stack.Screen name="Poems" component={PoemsScreen} />
          <Stack.Screen name="Albums" component={AlbumsScreen} />
          <Stack.Screen name="Featured" component={FeaturedScreen} />
          <Stack.Screen name="PoetDetails" component={PoetDetails} />
          <Stack.Screen name="ArtistDetails" component={ArtistDetails} />
          <Stack.Screen name="PoemDetails" component={PoemDetails} />
          <Stack.Screen name="AlbumDetails" component={AlbumDetails} />
          <Stack.Screen 
            name="Player" 
            component={PlayerScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }}
          />
          <Stack.Screen name="Playlists" component={PlaylistsScreen} />
          <Stack.Screen name="PlaylistDetails" component={PlaylistDetailsScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Manuscripts" component={ManuscriptsScreen} />
          <Stack.Screen name="Events" component={EventsScreen} />
          <Stack.Screen name="Photos" component={PhotosScreen} />
          <Stack.Screen name="Videos" component={VideosScreen} />
          <Stack.Screen name="ManuscriptDetails" component={ManuscriptDetails} />
          <Stack.Screen name="EventDetails" component={EventDetails} />
          <Stack.Screen 
            name="VideoPlayer" 
            component={VideoPlayer}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }}
          />
          <Stack.Screen name="Talat" component={TalatScreen} />
          <Stack.Screen name="TalatDetails" component={TalatDetails} />
        </Stack.Navigator>
        <GlobalMiniPlayer />
      </NavigationContainer>
    </AudioProvider>
  );
}
