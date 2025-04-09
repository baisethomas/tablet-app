import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home-screen';
import { TranscriptionScreen } from '../screens/transcription-screen';
import { TranscriptionTestScreen } from '../screens/TranscriptionTestScreen';
import { LibraryScreen } from '../screens/library-screen';
import { SermonDetailScreen } from '../screens/sermon-detail-screen';
import { useTheme } from '../contexts/theme-context';
import { useRecording } from '../contexts/recording-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define navigation param types
export type RootStackParamList = {
  Main: undefined;
  Transcription: undefined;
  TranscriptionTest: undefined;
  SermonDetail: { sermonId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Record: undefined;
  Account: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder Account screen
function AccountScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>Account Screen - Coming Soon</Text>
    </View>
  );
}

// Custom middle button component for Record
interface RecordButtonProps {
  // No onPress needed directly, action handled by context
}

function RecordButton() {
  const { startRecording, isRecording } = useRecording();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = async () => {
    if (isRecording) return;

    const newSermonId = await startRecording();
    if (newSermonId) {
      navigation.navigate('SermonDetail', { 
        sermonId: newSermonId, 
        initialTab: 'Notes'
      });
    } else {
      console.error("Failed to start recording or get sermon ID.");
    }
  };

  return (
    <TouchableOpacity
      style={styles.recordButton}
      onPress={handlePress}
      disabled={isRecording}
    >
      <View style={styles.recordButtonInner} />
    </TouchableOpacity>
  );
}

// Empty component for the Record tab
function EmptyComponent() {
  return null;
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
          height: 65,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Record" 
        component={EmptyComponent}
        options={{
          tabBarButton: () => (
            <RecordButton />
          ),
          tabBarLabel: () => null,
        }}
        listeners={{}}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={size} color={color} />
          ),
          tabBarLabel: 'Account',
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ 
          headerShown: false, 
          headerStyle: { 
            backgroundColor: colors.background.primary,
            shadowOpacity: 0, 
            elevation: 0, 
          },
          headerTintColor: colors.text.primary,
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="Transcription" 
          component={TranscriptionScreen} 
          options={{ 
            headerShown: true, 
            title: 'Record & Transcribe',
          }} 
        />
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

const styles = StyleSheet.create({
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0077FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
    transform: [{ translateY: -15 }],
  },
  recordButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  centeredInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  infoTextSmall: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 0,
  },
}); 