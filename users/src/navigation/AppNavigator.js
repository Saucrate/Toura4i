import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import PoetsScreen from '../screens/PoetsScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import PoemsScreen from '../screens/PoemsScreen';
import AlbumsScreen from '../screens/AlbumsScreen';
import FeaturedScreen from '../screens/FeaturedScreen';
import PoetDetails from '../screens/details/PoetDetails';
import ArtistDetails from '../screens/details/ArtistDetails';
import PoemDetails from '../screens/details/PoemDetails';
import AlbumDetails from '../screens/details/AlbumDetails';
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import PlaylistDetailsScreen from '../screens/PlaylistDetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ManuscriptsScreen from '../screens/ManuscriptsScreen';
import EventsScreen from '../screens/EventsScreen';
import PhotosScreen from '../screens/PhotosScreen';
import VideosScreen from '../screens/VideosScreen';
import ManuscriptDetails from '../screens/details/ManuscriptDetails';
import EventDetails from '../screens/details/EventDetails';
import VideoPlayer from '../screens/VideoPlayer';
import TalatScreen from '../screens/TalatScreen';
import TalatDetails from '../screens/details/TalatDetails';
import AudioRecordingsScreen from '../screens/AudioRecordingsScreen';
import AudioRecordingDetails from '../screens/details/AudioRecordingDetails';

const Stack = createNativeStackNavigator();

export const AuthStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
  </Stack.Navigator>
);

export const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    <Stack.Screen name="AudioRecordings" component={AudioRecordingsScreen} />
    <Stack.Screen name="AudioRecordingDetails" component={AudioRecordingDetails} />
  </Stack.Navigator>
); 