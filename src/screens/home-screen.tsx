import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  SectionList,
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme-context';
import type { RootStackParamList } from '../navigation/app-navigator';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { createSampleSermonData, clearSermonData } from '../utils/dev-helpers';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { getAllSermons } from '../services/sermon-storage';

// Define the structure for saved data
interface SavedSermon {
  id: string; 
  date: string; 
  title?: string; 
  transcript: string; 
  processingStatus?: string;
  processingError?: string;
}

// Rename interface for SectionList structure
interface SectionData {
  title: string; // Renamed from 'date' to 'title' for clarity
  data: SavedSermon[];
}

// Define navigation prop type for this screen
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Helper function to group sermons by date for SectionList
function groupSermonsByDate(sermons: SavedSermon[]): SectionData[] {
  const groups: Record<string, SavedSermon[]> = {};
  
  // Sort sermons newest first before grouping
  const sortedSermons = [...sermons].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedSermons.forEach(sermon => {
    const date = new Date(sermon.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey;
    
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(sermon);
  });
  
  // Convert to SectionList array format
  // Define desired order of sections
  const sectionOrder = ['Today', 'Yesterday']; 
  const sections: SectionData[] = [];

  // Add Today and Yesterday first if they exist
  sectionOrder.forEach(key => {
    if (groups[key]) {
      sections.push({ title: key, data: groups[key] });
      delete groups[key]; // Remove from groups to avoid duplication
    }
  });

  // Add remaining date groups (sorted chronologically implicitly by how they were added)
  Object.entries(groups)
    .sort(([dateA], [dateB]) => new Date(sermons.find(s => s.date === dateB)?.date || 0).getTime() - new Date(sermons.find(s => s.date === dateA)?.date || 0).getTime()) // Attempt to sort remaining dates
    .forEach(([title, data]) => {
       sections.push({ title, data });
    });

  return sections;
}

// Helper to format duration
function formatSermonDuration(transcript: string): string {
  if (!transcript) return '0 secs';
  const words = transcript.split(' ').length;
  const totalSeconds = Math.max(1, Math.round(words / 150 * 60)); // Approx 150 wpm

  if (totalSeconds < 60) {
    return `${totalSeconds} secs`;
  } else {
    const minutes = Math.round(totalSeconds / 60);
    return `${minutes} mins`;
  }
}

export function HomeScreen() {
  const { colors, theme } = useTheme();
  const { fontWeight } = useThemeStyles();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [sermons, setSermons] = useState<SavedSermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Define styles inside the component to access theme hooks
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.ui.border,
      backgroundColor: colors.background.primary,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 24,
      fontWeight: fontWeight('bold'),
      color: colors.primary,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.ui.border,
      backgroundColor: colors.background.primary,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 16,
      color: colors.text.secondary,
    },
    activeTabText: {
      color: colors.primary,
      fontWeight: fontWeight('medium'),
    },
    section: {
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: fontWeight('semiBold'),
      paddingVertical: 12,
      paddingHorizontal: 16,
      color: colors.text.secondary,
      backgroundColor: colors.background.primary,
    },
    sermonCard: {
      backgroundColor: colors.background.secondary, 
      borderRadius: 8,
      marginHorizontal: theme.spacing.md, 
      marginVertical: theme.spacing.sm, 
      padding: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.ui.border, 
    },
    processingCard: {
      opacity: 0.6,
    },
    errorCard: {
      borderColor: colors.ui.error,
      borderWidth: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center', // Align time better vertically
      marginBottom: theme.spacing.xs, // Slightly reduce bottom margin
    },
    cardTitle: {
      fontSize: theme.fontSizes.body, 
      fontWeight: fontWeight('semiBold'),
      color: colors.text.primary,
      flexShrink: 1, 
      marginRight: theme.spacing.sm, 
      // Remove marginBottom as header handles spacing
    },
    cardTime: {
      fontSize: theme.fontSizes.caption, 
      color: colors.text.secondary,
      flexShrink: 0, 
    },
    cardPreview: {
      fontSize: theme.fontSizes.button, 
      color: colors.text.secondary, 
      lineHeight: theme.lineHeights.button, 
      marginTop: theme.spacing.xs, 
      marginLeft: theme.spacing.sm, // Add left margin for indent
    },
    cardStatusContainer: {
        marginTop: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardStatusText: {
        marginLeft: theme.spacing.xs,
        fontSize: theme.fontSizes.caption,
        color: colors.text.secondary,
        fontStyle: 'italic',
    },
    cardErrorText: {
        color: colors.ui.error,
    },
    centeredInfo: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.background.primary,
    },
    emptyText: {
      fontSize: 18,
      color: colors.text.secondary,
      marginBottom: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.ui.error,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: colors.background.secondary,
      borderRadius: 8,
    },
    newRecordingButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    newRecordingText: {
      color: '#FFFFFF',
      fontSize: theme.fontSizes.body,
      fontWeight: fontWeight('medium'),
      marginLeft: theme.spacing.sm,
    },
    listContentContainer: {
      paddingBottom: theme.spacing.md, // Add padding at the bottom of the list
    },
  });

  const loadSermonsFromStorage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sermonsArray = await getAllSermons();
      setSermons(sermonsArray);
    } catch (e: any) {
      console.error('[HomeScreen] Failed to fetch sermons:', e);
      setError('Failed to load saved recordings. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load sermons when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSermonsFromStorage();
    }, [loadSermonsFromStorage])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadSermonsFromStorage();
  }, [loadSermonsFromStorage]);

  const handlePressItem = (sermonId: string) => {
    navigation.navigate('SermonDetail', { sermonId });
  };

  const handleNewTranscription = () => {
    navigation.navigate('Transcription');
  };

  const handleGenerateDemoData = async () => {
    if (__DEV__) {
      try {
        await createSampleSermonData();
        // Reload sermons after creating sample data
        handleRefresh();
      } catch (error) {
        console.error("Error generating demo data:", error);
      }
    }
  };

  const renderSermonItem = ({ item }: { item: SavedSermon }) => {
    // Format time
    const time = new Date(item.date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    // Format duration using helper
    const duration = formatSermonDuration(item.transcript);
    
    // Get preview text (first line, no bullet)
    const previewText = item.transcript?.split('\n')[0] || 'No transcript available';
    
    const handleCardPress = () => {
      if (item.processingStatus === 'error') {
        Alert.alert(
          'Processing Error',
          item.processingError || 'An unknown error occurred during processing.',
          [{ text: 'OK' }]
        );
      } else if (item.processingStatus !== 'processing') {
        // Only navigate if not processing and no error
        navigation.navigate('SermonDetail', { sermonId: item.id });
      }
      // Do nothing if processing
    };

    const cardStyle = [
      styles.sermonCard,
      item.processingStatus === 'processing' && styles.processingCard,
      item.processingStatus === 'error' && styles.errorCard
    ];

    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={handleCardPress}
        activeOpacity={item.processingStatus === 'processing' ? 1 : 0.7} // Prevent opacity change if processing
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Note'}</Text>
          {/* Combine time and duration */}
          <Text style={styles.cardTime}>
            {time} · {duration}
          </Text>
        </View>
        {/* Render preview text directly */}
        <Text style={styles.cardPreview} numberOfLines={2}>{previewText}</Text>

        {/* Add Status Indicator */}
        {(item.processingStatus === 'processing' || item.processingStatus === 'error') && (
          <View style={styles.cardStatusContainer}>
            {item.processingStatus === 'processing' && (
              <ActivityIndicator size="small" color={colors.text.secondary} />
            )}
            {item.processingStatus === 'error' && (
              <Ionicons name="alert-circle-outline" size={16} color={colors.ui.error} />
            )}
            <Text 
              style={[styles.cardStatusText, item.processingStatus === 'error' && styles.cardErrorText]}
            >
              {item.processingStatus === 'processing' ? 'Processing...' : 'Error'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredInfo}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    
    if (error) {
      return (
        <ErrorDisplay 
          message={error} 
          onRetry={loadSermonsFromStorage} 
        />
      );
    }
    
    const sections = groupSermonsByDate(sermons);
    
    if (sections.length === 0 && !isLoading && !error) {
      return (
        <View style={styles.centeredInfo}>
          <Text style={styles.emptyText}>No recordings yet</Text>
          <TouchableOpacity 
            style={styles.newRecordingButton}
            onPress={handleNewTranscription}
          >
            <Ionicons name="mic-outline" size={20} color="#FFFFFF" />
            <Text style={styles.newRecordingText}>Start New Recording</Text>
          </TouchableOpacity>
          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.newRecordingButton, { backgroundColor: colors.ui.info, marginTop: theme.spacing.md }]}
              onPress={handleGenerateDemoData}
            >
              <Text style={[styles.newRecordingText, { color: '#FFFFFF' }]}>Generate Demo Data</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return (
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id + index}
        renderItem={renderSermonItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh} 
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContentContainer}
      />
    );
  };

  // Simplified tab bar with just Conversations
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <View style={[styles.tab, styles.activeTab]}>
        <Text style={[styles.tabText, styles.activeTabText]}>
          Conversations
        </Text>
      </View>
    </View>
  );

  // App header with logo and actions like in the Otter.ai UI
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Tablet</Text>
      </View>
      
      <View style={styles.headerActions}>
        {/* Search Icon */}
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
        
        {/* Add Icon */}
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleNewTranscription}
        >
          <Ionicons name="add" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        
        {/* Notifications Icon */}
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      {renderTabs()}
      {renderContent()}
    </SafeAreaView>
  );
} 