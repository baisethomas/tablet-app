import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { TranscriptionTestScreen } from '../screens/TranscriptionTestScreen';
import { ThemeProvider } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'Sermon Notes',
              headerStyle: {
                backgroundColor: '#f5f5f5',
              },
              headerTintColor: '#333',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="TranscriptionTest" 
            component={TranscriptionTestScreen}
            options={{
              title: 'Transcription Test',
              headerStyle: {
                backgroundColor: '#f5f5f5',
              },
              headerTintColor: '#333',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
} 