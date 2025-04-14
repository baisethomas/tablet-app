import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '@/screens/home-screen';
import { RecordScreen } from '@/screens/record-screen';
import { SermonDetailScreen } from '@/screens/sermon-detail-screen';
import { TranscriptionScreen } from '@/screens/transcription-screen';
import { AccountScreen } from '@/screens/account-screen';
import { View, ViewStyle } from 'react-native';
import { MainTabParamList, RootStackParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

interface RecordButtonProps {
  color: string;
  size: number;
}

function RecordButton({ color, size }: RecordButtonProps) {
  return (
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#007AFF", // iOS blue color
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25, // Lift it up a bit
      }}
    >
      <Ionicons name="mic" size={30} color="white" />
    </View>
  );
}

function MainTabs() {
  const { colors, isLoading } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText variant="primary">Loading...</ThemedText>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border,
          paddingBottom: 8,
          height: 60,
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
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <RecordButton color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { colors, isLoading } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText variant="primary">Loading...</ThemedText>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SermonDetail"
        component={SermonDetailScreen}
        options={{ 
          title: 'Sermon Details',
          headerBackTitle: 'Main'
        }}
      />
      <Stack.Screen
        name="Transcription"
        component={TranscriptionScreen}
        options={{ title: 'Transcription' }}
      />
    </Stack.Navigator>
  );
} 