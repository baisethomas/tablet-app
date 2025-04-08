import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/theme-context';
import type { RootStackParamList } from '../navigation/app-navigator';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { createSampleSermonData, clearSermonData } from '../utils/dev-helpers';

// Define the structure for saved data
interface SavedSermon {
  id: string; 
  date: string; 
  title?: string; 
  transcript: string; 
}

// For grouped data in FlatList
interface GroupedData {
  date: string;
  data: SavedSermon[];
}

// Define navigation prop type for this screen
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Helper function to group sermons by date
function groupSermonsByDate(sermons: SavedSermon[]): GroupedData[] {
  const groups: Record<string, SavedSermon[]> = {};
  
  sermons.forEach(sermon => {
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
      // Format like "Friday, April 4"
      groupKey = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(sermon);
  });
  
  // Convert to array format for FlatList
  return Object.entries(groups).map(([date, sermons]) => ({
    date,
    data: sermons
  }));
}

export function HomeScreen() {
  const { colors } = useTheme();
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
      backgroundColor: '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 24,
      fontWeight: fontWeight('bold'),
      color: '#0077FF', // Brand blue, similar to Otter.ai
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F5F5F5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#E8E8E8',
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#0077FF',
    },
    tabText: {
      fontSize: 16,
      color: '#737373',
    },
    activeTabText: {
      color: '#0077FF',
      fontWeight: fontWeight('medium'),
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: fontWeight('semiBold'),
      marginVertical: 12,
      marginHorizontal: 16,
      color: '#333333',
    },
    sermonCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E8E8E8',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: fontWeight('semiBold'),
      color: '#333333',
    },
    cardTime: {
      fontSize: 14,
      color: '#737373',
    },
    cardPreview: {
      fontSize: 16,
      color: '#333333',
      lineHeight: 22,
    },
    commentCount: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      backgroundColor: '#F0F0F0',
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    commentText: {
      fontSize: 14,
      color: '#737373',
    },
    centeredInfo: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 18,
      color: '#737373',
      marginBottom: 20,
    },
    errorText: {
      fontSize: 16,
      color: '#B55A5A',
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: '#F0F0F0',
      borderRadius: 8,
    },
    newRecordingButton: {
      backgroundColor: '#0077FF',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    newRecordingText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: fontWeight('medium'),
    },
  });

  const loadSermons = useCallback(async () => {
    setError(null);
    try {
      const existingData = await AsyncStorage.getItem('savedSermons');
      let sermonsArray: SavedSermon[] = [];
      if (existingData !== null) {
        try {
          sermonsArray = JSON.parse(existingData);
          if (!Array.isArray(sermonsArray)) {
            console.warn('Saved sermons data is not an array, resetting.');
            sermonsArray = [];
          }
        } catch (parseError) {
          console.error('Error parsing saved sermons:', parseError);
          setError('Could not load saved sermons.');
          sermonsArray = [];
        }
      }
      setSermons(sermonsArray);
    } catch (e) {
      console.error('Failed to fetch sermons from storage:', e);
      setError('Failed to load sermons.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load sermons when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadSermons();
    }, [loadSermons])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadSermons();
  }, [loadSermons]);

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
    // Format the time like "5:04PM"
    const time = new Date(item.date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    // Calculate minutes based on transcript length (placeholder calculation)
    const words = item.transcript.split(' ').length;
    const minutes = Math.max(1, Math.round(words / 150)); // Approx 150 words per minute of speech
    
    // Get first line of transcript for preview
    const previewText = item.transcript.split('\n')[0] || 'No transcript available';
    
    return (
      <TouchableOpacity 
        style={styles.sermonCard} 
        onPress={() => handlePressItem(item.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title || 'Note'}</Text>
          <Text style={styles.cardTime}>
            {time} · {minutes} {minutes === 1 ? 'min' : 'mins'}
          </Text>
        </View>
        <Text style={styles.cardPreview}>• {previewText}</Text>
        
        {/* Placeholder for comments count, similar to Otter.ai UI */}
        <View style={styles.commentCount}>
          <Text style={styles.commentText}>2</Text>
        </View>
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
        <View style={styles.centeredInfo}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadSermons} style={styles.retryButton}>
            <Text style={{ color: colors.primary }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const groupedData = groupSermonsByDate(sermons);
    
    if (sermons.length === 0) {
      return (
        <View style={styles.centeredInfo}>
          <Text style={styles.emptyText}>No recordings yet</Text>
          <TouchableOpacity 
            style={styles.newRecordingButton}
            onPress={handleNewTranscription}
          >
            <Text style={styles.newRecordingText}>Start New Recording</Text>
          </TouchableOpacity>
          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.newRecordingButton, { backgroundColor: colors.ui.info, marginTop: 12 }]}
              onPress={handleGenerateDemoData}
            >
              <Text style={styles.newRecordingText}>Generate Demo Data</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return (
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{item.date}</Text>
            {item.data.map(sermon => (
              <View key={sermon.id}>
                {renderSermonItem({ item: sermon })}
              </View>
            ))}
          </View>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh} 
            tintColor={colors.primary}
          />
        }
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
        <TouchableOpacity style={styles.headerButton}>
          <Text>🔍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleNewTranscription}
        >
          <Text>+</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerButton}>
          <Text>🔔</Text>
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