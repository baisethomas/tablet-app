import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Transcription: undefined;
  TranscriptionTest: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const { colors, theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Tablet</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Sermon note-taking made simple
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Transcription')}
          >
            <Text style={[styles.actionButtonText, { color: colors.background.primary }]}>
              Start New Transcription
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          >
            <Text style={[styles.actionButtonText, { color: colors.background.primary }]}>
              My Notes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('TranscriptionTest')}
          >
            <Text style={[styles.actionButtonText, { color: colors.background.primary }]}>
              Test Transcription
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
  },
  actionsContainer: {
    width: '100%',
    marginTop: 20,
    gap: 16,
  },
  actionButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 