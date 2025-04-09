import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme-context';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { RootStackParamList } from '../navigation/app-navigator';
import { SavedSermon } from '../types/sermon';
import { SummaryTab } from '../components/sermon-detail/SummaryTab';
import { TranscriptTab } from '../components/sermon-detail/TranscriptTab';
import { NotesTab } from '../components/sermon-detail/NotesTab';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { getSermonById } from '../services/sermon-storage'; // Import storage service

// Define the route prop type, including optional initialTab
type SermonDetailScreenRouteProp = RouteProp<RootStackParamList & { SermonDetail: { initialTab?: keyof SermonDetailTabParamList } }, 'SermonDetail'>;

// Define ParamList for the Top Tabs themselves
type SermonDetailTabParamList = {
  Summary: undefined;
  Transcript: undefined;
  Notes: undefined;
};

// Define a general type for screen props within this tab navigator
type SermonDetailTabScreenProps<T extends keyof SermonDetailTabParamList> = {
  navigation: any; // Using any for simplicity, could import specific type if needed
  route: RouteProp<SermonDetailTabParamList, T>;
};

// Create tab navigator
const Tab = createMaterialTopTabNavigator<SermonDetailTabParamList>();

export function SermonDetailScreen() {
  const { colors, theme } = useTheme();
  const { fontWeight } = useThemeStyles();
  const route = useRoute<SermonDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { sermonId, initialTab } = route.params;

  const [sermon, setSermon] = useState<SavedSermon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sermon data using the service
  useEffect(() => {
    const loadSermonDetail = async () => {
      if (!sermonId) {
        setError('No sermon ID provided');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setSermon(null);
      
      try {
        console.log(`[SermonDetail] Loading sermon with ID: ${sermonId}`);
        // Use the storage service function
        const foundSermon = await getSermonById(sermonId);

        if (!foundSermon) {
          console.error(`[SermonDetail] Sermon with ID ${sermonId} not found.`);
          throw new Error(`Recording details could not be found.`); // User-friendly message
        }

        console.log("[SermonDetail] Found sermon:", foundSermon.id);
        setSermon(foundSermon);
      } catch (e: any) {
        console.error('[SermonDetail] Failed to fetch sermon detail:', e);
        setError(e.message || 'Failed to load recording details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSermonDetail();
  }, [sermonId]);

  // Use the correct prop name for NotesTab
  const handleNotesSaved = (updatedSermon: SavedSermon) => {
    console.log("Sermon notes updated in parent:", updatedSermon);
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
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        flexWrap: 'wrap',
        backgroundColor: colors.background.primary,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.ui.border,
      },
      metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing.md,
        marginBottom: theme.spacing.xs,
      },
      metadataText: {
        fontSize: theme.fontSizes.button,
        color: colors.text.secondary,
        marginLeft: theme.spacing.xs,
      },
    });
    
    return (
      <View style={styles.metadataContainer}>
        <View style={styles.metadataItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.metadataText}>{formattedDate}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Text style={[styles.metadataText, { marginLeft: 0 }]}>{formattedTime}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Ionicons name="timer-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.metadataText}>{duration}</Text>
        </View>
        <View style={styles.metadataItem}>
          <Ionicons name="person-outline" size={16} color={colors.text.tertiary} />
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
      backgroundColor: colors.background.primary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: colors.background.primary,
    },
    errorText: {
      fontSize: theme.fontSizes.body,
      textAlign: 'center',
      color: colors.ui.error,
    },
    titleText: {
      fontSize: theme.fontSizes.heading,
      fontWeight: fontWeight('bold'),
      color: colors.text.primary,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      backgroundColor: colors.background.primary,
    },
    tabBar: {
      backgroundColor: colors.background.primary,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.ui.border,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      elevation: 0,
    },
    tabIndicator: {
      backgroundColor: colors.primary,
    },
    tabLabel: {
      fontSize: theme.fontSizes.button,
      fontWeight: fontWeight('medium'),
      textTransform: 'none',
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={colors.text.primary === '#F5F5F5' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !sermon) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={colors.text.primary === '#F5F5F5' ? 'light-content' : 'dark-content'} />
        <ErrorDisplay 
          message={error || 'Sermon data could not be loaded.'} 
        />
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
      <StatusBar barStyle={colors.text.primary === '#F5F5F5' ? 'light-content' : 'dark-content'} />
      <Text style={styles.titleText}>
        {sermon.title || 'Sermon'}
      </Text>
      {renderSermonMetadata()}
      
      {/* Tab Navigation - Pass initialRouteName */}
      <Tab.Navigator
        initialRouteName={initialTab || 'Summary'} // Set initial tab based on param, default to Summary
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          swipeEnabled: true,
          lazy: true,
        }}
      >
        <Tab.Screen name="Summary">
          {(props: SermonDetailTabScreenProps<'Summary'>) => 
            <SummaryTab {...props} sermon={sermon} />
          } 
        </Tab.Screen>
        <Tab.Screen name="Transcript">
          {(props: SermonDetailTabScreenProps<'Transcript'>) => 
            <TranscriptTab {...props} sermon={sermon} />
          } 
        </Tab.Screen>
        <Tab.Screen name="Notes">
          {(props: SermonDetailTabScreenProps<'Notes'>) => (
            <NotesTab 
              {...props} 
              sermon={sermon} 
              onNotesSaved={handleNotesSaved}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
} 