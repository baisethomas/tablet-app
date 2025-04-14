import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { ThemedText } from '../components/ThemedText';
import { ThemedButton } from '../components/ThemedButton';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { NoteModal } from '../components/NoteModal';
import { useTheme } from '../hooks/useTheme';
import { useSermons } from '../hooks/useSermons';
import { createNote } from '../services/sermon-storage';
import { SavedSermon } from '../types/sermon';
import { RootStackParamList } from '../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function HomeScreen() {
  const navigation = useNavigation();
  const { colors, typography, getFontWeight } = useTheme();
  const { isLoading, error, getSermons, deleteSermon } = useSermons();
  const [sermons, setSermons] = useState<SavedSermon[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // Load sermons on component mount and when screen comes into focus
  useEffect(() => {
    loadSermons();
    
    // Also reload data when the screen comes into focus (returning from recording/other screens)
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[HomeScreen] Screen focused, refreshing sermons');
      loadSermons();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Function to load sermons
  const loadSermons = async () => {
    console.log('[HomeScreen] Loading sermons...');
    const fetchedSermons = await getSermons();
    console.log(`[HomeScreen] Loaded ${fetchedSermons.length} sermons`);
    setSermons(fetchedSermons);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSermons();
    setIsRefreshing(false);
  };

  const handleCreateNote = async (title: string, content: string) => {
    try {
      await createNote(title, content);
      const updatedSermons = await getSermons();
      setSermons(updatedSermons);
      setIsNoteModalVisible(false);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  // Handle sermon deletion
  const handleDeleteSermon = useCallback(async (id: string) => {
    try {
      const success = await deleteSermon(id);
      if (success) {
        // Refresh sermon list after deletion
        await loadSermons();
      }
    } catch (error) {
      console.error('Failed to delete sermon:', error);
    }
  }, [deleteSermon]);

  const renderSermonItem = ({ item }: { item: SavedSermon }) => {
    const isNote = item.type === 'note';
    const handlePress = () => {
      if (isNote) {
        navigation.navigate('SermonDetail', { sermonId: item.id });
      } else {
        navigation.navigate('SermonDetail', { sermonId: item.id });
      }
    };

    const renderRightActions = () => (
      <View style={[styles.deleteButton, { backgroundColor: colors.error }]}>
        <Ionicons name="trash-outline" size={24} color={colors.text.inverse} />
      </View>
    );

    // Format time to show like "12:20 AM · 1 min"
    const formattedTime = new Date(item.date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    
    // For demo purposes, showing 2 as count for each item
    const commentCount = 2;

    return (
      <Swipeable
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => {
          Alert.alert(
            "Delete Sermon",
            "Are you sure you want to delete this sermon?",
            [
              { 
                text: "Cancel", 
                style: "cancel" 
              },
              { 
                text: "Delete", 
                style: "destructive",
                onPress: () => handleDeleteSermon(item.id)
              }
            ]
          );
        }}
      >
        <TouchableOpacity
          style={[
            styles.sermonItem,
            { 
              backgroundColor: colors.background.primary,
              borderRadius: 12,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }
          ]}
          onPress={handlePress}
        >
          <View style={styles.sermonContent}>
            <View style={styles.sermonHeader}>
              <ThemedText
                variant="primary"
                weight="bold"
                style={[
                  styles.sermonTitle, 
                  { 
                    fontWeight: getFontWeight('bold')
                  }
                ]}
                numberOfLines={2}
              >
                {isNote ? `Sermon - ${new Date(item.date).toLocaleDateString('en-US', { 
                  month: 'numeric', 
                  day: 'numeric', 
                  year: 'numeric'
                }).replace(/\//g, '/')}` : item.title}
              </ThemedText>
              <View style={styles.timeContainer}>
                <ThemedText
                  variant="secondary"
                  style={styles.timeText}
                >
                  {formattedTime} · 1 min
                </ThemedText>
              </View>
            </View>
            <View style={styles.sermonBody}>
              <ThemedText
                variant="secondary"
                style={styles.bulletText}
              >
                • {item.transcript ? item.transcript.substring(0, 100) + (item.transcript.length > 100 ? '...' : '') : 'No transcript available'}
              </ThemedText>
              {commentCount > 0 && (
                <View style={[styles.countBadge, { backgroundColor: colors.background.secondary }]}>
                  <ThemedText 
                    variant="primary"
                    style={styles.countText}
                  >
                    {commentCount}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (isLoading && !sermons.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <ErrorDisplay
          message={error}
          onRetry={handleRefresh}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[
        styles.header, 
        { 
          paddingTop: insets.top > 0 ? insets.top + 8 : 16,
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: colors.background.primary, // Ensure the background is solid
        }
      ]}>
        <ThemedText 
          variant="primary" 
          style={{
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
            letterSpacing: 0.5,
            color: colors.primary,
          }}
        >
          Tablet
        </ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.circleButton, { backgroundColor: colors.background.secondary }]}>
            <Ionicons name="search" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.circleButton, { backgroundColor: colors.background.secondary }]}
            onPress={() => setIsNoteModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.circleButton, { backgroundColor: colors.background.secondary }]}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabHeader}>
        <ThemedText
          variant="primary"
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: colors.primary,
            textAlign: 'center',
          }}
        >
          Conversations
        </ThemedText>
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.sectionHeader}>
        <ThemedText
          variant="secondary"
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          Today
        </ThemedText>
      </View>

      <FlatList
        data={sermons}
        renderItem={renderSermonItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />

      <NoteModal
        isVisible={isNoteModalVisible}
        onClose={() => setIsNoteModalVisible(false)}
        onSave={handleCreateNote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCCCCC', // Light border 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    zIndex: 10,
  },
  title: {
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  tabHeader: {
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#007AFF', // Default iOS blue color
  },
  divider: {
    height: 1,
    width: '100%',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  sermonItem: {
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  sermonContent: {
    flex: 1,
  },
  sermonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sermonTitle: {
    fontSize: 18,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
  },
  sermonBody: {
    position: 'relative',
    paddingRight: 40,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 22,
  },
  countBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
}); 