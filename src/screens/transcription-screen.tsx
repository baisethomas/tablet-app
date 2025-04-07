import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../contexts/theme-context';

export function TranscriptionScreen() {
  const { colors, theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [userNotes, setUserNotes] = useState<string>('');

  // This would be connected to the actual transcription API in a real implementation
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording logic would go here
      console.log('Started recording');
    } else {
      // Stop recording logic would go here
      console.log('Stopped recording');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {isRecording ? 'Recording...' : 'Ready to Record'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Live Transcription</Text>
          <ScrollView style={styles.transcriptionArea}>
            <Text style={[styles.transcriptionText, { color: colors.text.primary }]}>
              {transcription || 'Transcription will appear here...'}
            </Text>
          </ScrollView>
        </View>

        <View style={[styles.section, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Your Notes</Text>
          <TextInput
            style={[
              styles.notesInput,
              { 
                color: colors.text.primary,
                backgroundColor: colors.background.primary,
                borderColor: colors.ui.border
              }
            ]}
            placeholder="Add your notes here..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            value={userNotes}
            onChangeText={setUserNotes}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            { backgroundColor: isRecording ? colors.ui.error : colors.primary }
          ]}
          onPress={toggleRecording}
        >
          <Text style={[styles.recordButtonText, { color: colors.background.primary }]}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  section: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  transcriptionArea: {
    flex: 1,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  notesInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
  },
  recordButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 