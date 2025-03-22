import ArtistsScreen from '../screens/ArtistsScreen';
import AlbumsScreen from '../screens/AlbumsScreen';
import ArtistDetails from '../screens/details/ArtistDetails';
import AlbumDetails from '../screens/details/AlbumDetails';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Artists" component={ArtistsScreen} />
      <Stack.Screen name="Albums" component={AlbumsScreen} />
      <Stack.Screen name="ArtistDetails" component={ArtistDetails} options={{ headerShown: false }} />
      <Stack.Screen name="AlbumDetails" component={AlbumDetails} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 