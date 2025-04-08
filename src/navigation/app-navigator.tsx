import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/home-screen';
import { TranscriptionScreen } from '../screens/transcription-screen';
import { TranscriptionTestScreen } from '../screens/TranscriptionTestScreen';
import { LibraryScreen } from '../screens/library-screen';
import { SermonDetailScreen } from '../screens/sermon-detail-screen';
import { useTheme } from '../contexts/theme-context';

// Define navigation param types
export type RootStackParamList = {
  Main: undefined;
  Transcription: undefined;
  TranscriptionTest: undefined;
  SermonDetail: { sermonId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Remove this entire placeholder function
/* 
function LibraryScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>Library Screen - Coming Soon</Text>
    </View>
  );
}
*/

// Keep placeholder Settings screen 
function SettingsScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>Settings Screen - Coming Soon</Text>
    </View>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.ui.border,
        },
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Home',
          // We would add icons here in a real implementation
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen} 
        options={{
          title: 'My Sermons',
          // We would add icons here in a real implementation
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          title: 'Settings',
          // We would add icons here in a real implementation
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Transcription" component={TranscriptionScreen} options={{ headerShown: true, title: 'Record & Transcribe' }} />
        <Stack.Screen 
          name="TranscriptionTest" 
          component={TranscriptionTestScreen}
          options={{
            headerShown: true,
            title: 'Transcription Test',
          }}
        />
        <Stack.Screen 
          name="SermonDetail" 
          component={SermonDetailScreen} 
          options={{ 
            headerShown: true,
            title: 'Sermon Details',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 