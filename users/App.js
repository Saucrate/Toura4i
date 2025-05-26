import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AudioProvider } from './src/context/AudioContext';
import { AppState } from 'react-native';
import api from './src/services/api';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
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
import GlobalMiniPlayer from './src/components/GlobalMiniPlayer';
import ManuscriptsScreen from './src/screens/ManuscriptsScreen';
import EventsScreen from './src/screens/EventsScreen';
import PhotosScreen from './src/screens/PhotosScreen';
import VideosScreen from './src/screens/VideosScreen';
import ManuscriptDetails from './src/screens/details/ManuscriptDetails';
import EventDetails from './src/screens/details/EventDetails';
import VideoPlayer from './src/screens/details/VideoPlayer';
import TalatScreen from './src/screens/TalatScreen';
import TalatDetails from './src/screens/details/TalatDetails';
import AudioRecordingsScreen from './src/screens/AudioRecordingsScreen';
import AudioRecordingDetails from './src/screens/details/AudioRecordingDetails';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BooksScreen from './src/screens/BooksScreen';
import HistoricalPlacesScreen from './src/screens/HistoricalPlacesScreen';
import BookDetails from './src/screens/details/BookDetails';
import PlaceDetails from './src/screens/details/PlaceDetails';
import NotificationsScreen from './src/screens/NotificationsScreen';
import NotificationDetailsScreen from './src/screens/NotificationDetailsScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import UserDetails from './src/screens/details/UserDetails';
import ChatScreen from './src/screens/ChatScreen';
import ChatDetailScreen from './src/screens/details/ChatDetailScreen';
import ShareWithFollowers from './src/screens/ShareWithFollowers';
import PhotoDetails from './src/screens/details/PhotoDetails';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
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

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="UserDetails" component={UserDetails} />
    <Stack.Screen name="Books" component={BooksScreen} />
    <Stack.Screen name="BookDetails" component={BookDetails} />
    <Stack.Screen name="HistoricalPlaces" component={HistoricalPlacesScreen} />
    <Stack.Screen name="PlaceDetails" component={PlaceDetails} />
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
    <Stack.Screen name="PhotoDetails" component={PhotoDetails} />
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
    <Stack.Screen 
      name="AudioRecordingDetails" 
      component={AudioRecordingDetails}
      options={{
        presentation: 'modal',
        animation: 'slide_from_bottom'
      }}
    />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen} />
    <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    <Stack.Screen name="ShareWithFollowers" component={ShareWithFollowers} />
  </Stack.Navigator>
);

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    const updateOnlineStatus = async () => {
      if (user) {
        try {
          await api.put('/api/users/online-status', { isOnline: true });
        } catch (err) {
          console.error('Error updating online status:', err);
        }
      }
    };

    // Update online status when app starts
    updateOnlineStatus();

    // Update online status every 2 minutes
    const interval = setInterval(updateOnlineStatus, 120000);

    // Update online status when app goes to background
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background' && user) {
        try {
          await api.put('/api/users/online-status', { isOnline: false });
        } catch (err) {
          console.error('Error updating online status:', err);
        }
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [user]);

  return (
    <AuthProvider>
      <AudioProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="Main" component={MainStack} />
          </Stack.Navigator>
          <GlobalMiniPlayer />
        </NavigationContainer>
      </AudioProvider>
    </AuthProvider>
  );
}
