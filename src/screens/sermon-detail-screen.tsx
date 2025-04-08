import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert,
  StatusBar
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/theme-context';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { RootStackParamList } from '../navigation/app-navigator';
import { SavedSermon } from '../types/sermon';
import { SummaryTab } from '../components/sermon-detail/SummaryTab';
import { TranscriptTab } from '../components/sermon-detail/TranscriptTab';
import { NotesTab } from '../components/sermon-detail/NotesTab';

// Define the route prop type for this screen
type SermonDetailScreenRouteProp = RouteProp<RootStackParamList, 'SermonDetail'>;

// Create tab navigator
const Tab = createMaterialTopTabNavigator();

export function SermonDetailScreen() {
  const { colors } = useTheme();
  const { fontWeight } = useThemeStyles();
  const route = useRoute<SermonDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { sermonId } = route.params;

  const [sermon, setSermon] = useState<SavedSermon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sermon data
  useEffect(() => {
    const loadSermonDetail = async () => {
      setIsLoading(true);
      setError(null);
      setSermon(null);
      
      try {
        console.log("Loading sermon with ID:", sermonId);
        const existingData = await AsyncStorage.getItem('savedSermons');
        if (existingData === null) {
          throw new Error('No saved sermons found.');
        }

        console.log("Got saved sermons data:", existingData.substring(0, 100) + "...");
        
        let sermonsArray: SavedSermon[] = [];
        try {
          sermonsArray = JSON.parse(existingData);
          if (!Array.isArray(sermonsArray)) {
            console.warn('Saved sermons data is not an array.');
            throw new Error('Saved data format error.');
          }
        } catch (parseError) {
          console.error('Error parsing saved sermons:', parseError);
          throw new Error('Could not load sermon detail.');
        }

        console.log("Found sermons array with length:", sermonsArray.length);
        const foundSermon = sermonsArray.find(s => s.id === sermonId);

        if (!foundSermon) {
          console.error(`Sermon with ID ${sermonId} not found.`);
          throw new Error(`Sermon with ID ${sermonId} not found.`);
        }

        console.log("Found sermon:", foundSermon);
        setSermon(foundSermon);
      } catch (e: any) {
        console.error('Failed to fetch sermon detail:', e);
        setError(e.message || 'Failed to load sermon details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (sermonId) {
      loadSermonDetail();
    } else {
      setError('No sermon ID provided');
      setIsLoading(false);
    }
  }, [sermonId]);

  // Handle sermon updates (like when notes are saved)
  const handleSermonUpdate = (updatedSermon: SavedSermon) => {
    console.log("Sermon updated:", updatedSermon);
    setSermon(updatedSermon);
  };

  // Render sermon metadata (date, time, duration)
  const renderSermonMetadata = () => {
    if (!sermon) return null;
    
    // Format date: Mon, 4/7
    const sermonDate = new Date(sermon.date);
    const day = sermonDate.toLocaleDateString('en-US', { weekday: 'short' });
    const month = sermonDate.getMonth() + 1;
    const date = sermonDate.getDate();
    const formattedDate = `${day}, ${month}/${date}`;
    
    // Format time: 5:04PM
    const formattedTime = sermonDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    // Calculate duration based on transcript length (approximate)
    const words = sermon.transcript.split(' ').length;
    const minutes = Math.max(3, Math.round(words / 150)); // Assume ~150 words per minute
    const duration = `${minutes}:${Math.round(Math.random() * 59).toString().padStart(2, '0')}`;
    
    const styles = StyleSheet.create({
      metadataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
      metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
      },
      metadataText: {
        fontSize: 14,
        color: colors.text.secondary,
        marginLeft: 4,
      },
      metadataIcon: {
        width: 16,
        height: 16,
        fontSize: 16,
        color: colors.text.tertiary,
      }
    });
    
    return (
      <View style={styles.metadataContainer}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataIcon}>📅</Text>
          <Text style={styles.metadataText}>{formattedDate}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataIcon}>⏱️</Text>
          <Text style={styles.metadataText}>{formattedTime}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataIcon}>⏱️</Text>
          <Text style={styles.metadataText}>{duration}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataIcon}>👤</Text>
          <Text style={styles.metadataText}>You</Text>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      color: colors.ui.error,
    },
    titleText: {
      fontSize: 24,
      fontWeight: fontWeight('bold'),
      color: colors.text.primary,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    }
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !sermon) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'No sermon data found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Create a dummy sermon with guaranteed values for development
  if (__DEV__ && (!sermon.transcript || !sermon.transcript.trim())) {
    sermon.transcript = "This is a development placeholder transcript. In a real sermon, this would contain the transcribed content of the sermon.";
  }
  
  if (__DEV__ && (!sermon.notes || !sermon.notes.trim())) {
    sermon.notes = "Here is a note. Updating the saved note";
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.titleText}>
        {sermon.title || 'Sermon'}
      </Text>
      {renderSermonMetadata()}
      
      {/* Tab Navigation */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarIndicatorStyle: { backgroundColor: colors.primary },
          tabBarStyle: { 
            backgroundColor: colors.background.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.ui.border,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '500',
            textTransform: 'none',
          },
          lazy: true
        }}
      >
        <Tab.Screen name="Summary">
          {() => <SummaryTab sermon={sermon} />}
        </Tab.Screen>
        <Tab.Screen name="Transcript">
          {() => <TranscriptTab sermon={sermon} />}
        </Tab.Screen>
        <Tab.Screen name="Notes">
          {() => <NotesTab sermon={sermon} onNotesSaved={handleSermonUpdate} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
} 