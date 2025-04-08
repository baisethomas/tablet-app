import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/theme-context';
import type { RootStackParamList } from '../navigation/app-navigator'; // Import shared param list

// Define the structure for saved data (copied again)
interface SavedSermon {
  id: string; 
  date: string; 
  title?: string; 
  transcript: string; 
}

// Define the route prop type for this screen
type SermonDetailScreenRouteProp = RouteProp<RootStackParamList, 'SermonDetail'>;

export function SermonDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<SermonDetailScreenRouteProp>();
  const { sermonId } = route.params;

  const [sermon, setSermon] = useState<SavedSermon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSermonDetail = async () => {
      setIsLoading(true);
      setError(null);
      setSermon(null);
      
      try {
        const existingData = await AsyncStorage.getItem('savedSermons');
        if (existingData === null) {
          throw new Error('No saved sermons found.');
        }

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

        const foundSermon = sermonsArray.find(s => s.id === sermonId);

        if (!foundSermon) {
          throw new Error(`Sermon with ID ${sermonId} not found.`);
        }

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
    }

  }, [sermonId]); // Re-run effect if sermonId changes

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
          <Text style={[styles.errorText, { color: colors.ui.error }]}>{error}</Text>
          {/* Optionally add a button to go back? */}
        </View>
      );
    }
    if (!sermon) { // Should ideally be covered by error state, but good fallback
      return (
         <View style={styles.centeredInfo}>
          <Text style={[styles.infoText, { color: colors.text.secondary }]}>Sermon not found.</Text>
        </View>
      )
    }

    // Display Sermon Details
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {sermon.title && (
          <Text style={[styles.title, { color: colors.text.primary }]}>{sermon.title}</Text>
        )}
        <Text style={[styles.date, { color: colors.text.secondary }]}>
          Recorded on: {new Date(sermon.date).toLocaleString()}
        </Text>
        <Text style={[styles.transcript, { color: colors.text.primary }]}>
          {sermon.transcript}
        </Text>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    marginBottom: 16,
  },
  transcript: {
    fontSize: 16,
    lineHeight: 24,
  },
  centeredInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
      fontSize: 16,
      textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 