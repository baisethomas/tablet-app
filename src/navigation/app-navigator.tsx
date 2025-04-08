import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
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
  onPress: () => void;
}

function RecordButton({ onPress }: RecordButtonProps) {
  return (
    <TouchableOpacity
      style={styles.recordButton}
      onPress={onPress}
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
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ color, fontSize: 20, paddingBottom: 3 }}>🏠</Text>
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Record" 
        component={EmptyComponent}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <RecordButton 
              onPress={() => navigation.navigate('Transcription')} 
            />
          ),
          tabBarLabel: () => null,
        })}
        listeners={({ navigation }) => ({
          tabPress: (e: { preventDefault: () => void }) => {
            e.preventDefault();
            navigation.navigate('Transcription');
          },
        })}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ color, fontSize: 20, paddingBottom: 3 }}>👤</Text>
          ),
          tabBarLabel: 'Account',
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
        <Stack.Screen 
          name="Transcription" 
          component={TranscriptionScreen} 
          options={{ 
            headerShown: true, 
            title: 'Record & Transcribe' 
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
}); 