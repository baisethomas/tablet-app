import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/theme-context';
import type { RootStackParamList } from '../navigation/app-navigator'; // Import shared param list

// Define the structure for saved data (copied from TranscriptionScreen)
interface SavedSermon {
  id: string; 
  date: string; 
  title?: string; 
  transcript: string; 
}

// Define navigation prop type for this screen
type LibraryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Library'>;

export function LibraryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const [sermons, setSermons] = useState<SavedSermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      setIsLoading(true); // Show loading indicator on focus
      loadSermons();
    }, [loadSermons])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadSermons();
  }, [loadSermons]);

  const handlePressItem = (sermonId: string) => {
    // Navigate to SermonDetail screen, passing the ID
    navigation.navigate('SermonDetail', { sermonId });
  };

  const renderItem = ({ item }: { item: SavedSermon }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, { backgroundColor: colors.background.secondary }]} 
      onPress={() => handlePressItem(item.id)}
    >
      <Text style={[styles.itemTitle, { color: colors.text.primary }]}>
        {item.title || `Sermon on ${new Date(item.date).toLocaleDateString()}`}
      </Text>
      <Text style={[styles.itemDate, { color: colors.text.secondary }]}>
        {new Date(item.date).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.centeredInfo}>
      <Text style={[styles.infoText, { color: colors.text.secondary }]}>
        No saved sermons found.
      </Text>
      <Text style={[styles.infoText, { color: colors.text.secondary }]}>
        Go to the Home tab and start a new transcription to save one.
      </Text>
    </View>
  );

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
          <TouchableOpacity onPress={loadSermons} style={styles.retryButton}>
            <Text style={{ color: colors.primary }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={sermons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary}/>
        }
      />
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
  listContainer: {
    padding: 16,
    flexGrow: 1, // Needed for ListEmptyComponent centering
  },
  itemContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0', // Use theme border color later
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
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
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    padding: 10,
  },
}); 