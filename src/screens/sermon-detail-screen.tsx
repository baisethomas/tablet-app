import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  StatusBar,
  TouchableOpacity,
  TextInput
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
// import { KeywordsTab } from '../components/sermon-detail/KeywordsTab'; // Removed import
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { getSermonById } from '../services/sermon-storage'; // Import storage service
import { useSermons } from '../hooks/useSermons'; // Import the hook
import { formatMillisToMMSS } from '../utils/formatters'; // Import the moved helper

// Define the route prop type, including optional initialTab
type SermonDetailScreenRouteProp = RouteProp<RootStackParamList & { SermonDetail: { initialTab?: keyof SermonDetailTabParamList } }, 'SermonDetail'>;

// Define ParamList for the Top Tabs themselves
type SermonDetailTabParamList = {
  Summary: undefined;
  Transcript: undefined;
  Notes: undefined;
  // Keywords: undefined; // Removed Keywords tab
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
  const { updateSermonTitle } = useSermons(); // Get the update function

  const [sermon, setSermon] = useState<SavedSermon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const titleInputRef = useRef<TextInput>(null);

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
        const foundSermon = await getSermonById(sermonId);
        
        console.log("[SermonDetail] Raw data loaded from storage:", JSON.stringify(foundSermon, null, 2));

        if (!foundSermon) {
          console.error(`[SermonDetail] Sermon with ID ${sermonId} not found.`);
          throw new Error(`Recording details could not be found.`); // User-friendly message
        }

        console.log("[SermonDetail] Found sermon, setting state:", foundSermon.id);
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

  // Set editable title when sermon loads or editing starts
  useEffect(() => {
    if (sermon) {
      setEditableTitle(sermon.title || 'Sermon'); 
    }
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [sermon, isEditingTitle]);

  // Handle saving the title
  const handleSaveTitle = async () => {
    if (!sermon || editableTitle === sermon.title || !editableTitle.trim()) {
      setIsEditingTitle(false); // Exit editing if no change or empty
      if (sermon) setEditableTitle(sermon.title || 'Sermon'); // Reset editable title
      return;
    }
    
    try {
      // Call the hook function to update the title
      const updatedSermon = await updateSermonTitle(sermon.id, editableTitle.trim());
      if (updatedSermon) {
        setSermon(updatedSermon); // Update local state
        console.log("Sermon title updated successfully");
      } else {
        Alert.alert("Error", "Could not save the title. Please try again.");
        setEditableTitle(sermon.title || 'Sermon'); // Revert on error
      }
    } catch (e) {
      console.error("Error saving title:", e);
      Alert.alert("Error", "An unexpected error occurred while saving the title.");
      setEditableTitle(sermon.title || 'Sermon'); // Revert on error
    } finally {
      setIsEditingTitle(false);
    }
  };
  
  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    if (sermon) setEditableTitle(sermon.title || 'Sermon');
  };

  // Use the correct prop name for NotesTab
  const handleNotesSaved = (updatedSermon: SavedSermon) => {
    console.log("Sermon notes updated in parent:", updatedSermon);
    setSermon(updatedSermon);
  };

  // Render sermon metadata (date, time, duration)
  const renderSermonMetadata = () => {
    if (!sermon) return null;
    
    console.log(`[SermonDetail] Rendering metadata, sermon.durationMillis: ${sermon.durationMillis}`);

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
    
    // Calculate duration: Use stored durationMillis directly.
    const formattedDuration = formatMillisToMMSS(sermon.durationMillis);
    
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
    
    // *** Log the final formatted duration string ***
    console.log(`[SermonDetail] Final formattedDuration: ${formattedDuration}`);

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
          <Text style={styles.metadataText}>{formattedDuration}</Text>
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
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      backgroundColor: colors.background.primary,
      minHeight: 50,
    },
    titleText: {
      fontSize: theme.fontSizes.heading,
      fontWeight: fontWeight('bold'),
      color: colors.text.primary,
      flex: 1,
      marginRight: theme.spacing.sm,
      lineHeight: theme.fontSizes.heading * 1.2,
      paddingVertical: theme.spacing.xs,
    },
    editIcon: {
      padding: theme.spacing.xs,
      alignSelf: 'center',
    },
    titleInput: {
      fontSize: theme.fontSizes.heading,
      fontWeight: fontWeight('bold'),
      color: colors.text.primary,
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: colors.primary, 
      marginRight: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      alignSelf: 'stretch',
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colors.text.primary === '#F5F5F5' ? 'light-content' : 'dark-content'} />
      
      {/* Title Section - Conditional Rendering */}
      <View style={styles.titleContainer}>
        {isEditingTitle ? (
          <>
            <TextInput
              ref={titleInputRef}
              style={styles.titleInput}
              value={editableTitle}
              onChangeText={setEditableTitle}
              onBlur={handleSaveTitle}
              onSubmitEditing={handleSaveTitle}
              returnKeyType="done"
              selectTextOnFocus
            />
            <TouchableOpacity onPress={handleCancelEditTitle} style={styles.editIcon}>
              <Ionicons name="close-circle-outline" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
              {sermon?.title || 'Sermon'}
            </Text>
            <TouchableOpacity onPress={() => setIsEditingTitle(true)} style={styles.editIcon}>
              <Ionicons name="pencil-outline" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </>
        )}
      </View>

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
        {/* REMOVED: Keywords Tab Screen */}
        {/* <Tab.Screen name="Keywords">
          {(props: SermonDetailTabScreenProps<'Keywords'>) => 
            <KeywordsTab {...props} sermon={sermon!} />
          } 
        </Tab.Screen> */}
      </Tab.Navigator>
    </SafeAreaView>
  );
} 