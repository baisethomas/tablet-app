import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AudioRecorder } from '../components/AudioRecorder';

interface Transcript {
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export function TranscriptionTestScreen() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentPartial, setCurrentPartial] = useState<string>('');

  const handleTranscriptionUpdate = (text: string, isFinal: boolean) => {
    if (isFinal) {
      setTranscripts(prev => [...prev, {
        text,
        isFinal,
        timestamp: Date.now()
      }]);
      setCurrentPartial('');
    } else {
      setCurrentPartial(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real-time Transcription Test</Text>
      
      <AudioRecorder onTranscriptionUpdate={handleTranscriptionUpdate} />
      
      <ScrollView style={styles.transcriptContainer}>
        {transcripts.map((transcript, index) => (
          <View key={index} style={styles.transcriptItem}>
            <Text style={styles.transcriptText}>
              {transcript.text}
            </Text>
            <Text style={styles.transcriptMeta}>
              {new Date(transcript.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
        {currentPartial && (
          <View style={[styles.transcriptItem, styles.partialTranscript]}>
            <Text style={styles.transcriptText}>
              {currentPartial}
            </Text>
            <Text style={styles.transcriptMeta}>
              (In progress...)
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  transcriptContainer: {
    flex: 1,
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  transcriptItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  partialTranscript: {
    opacity: 0.7,
    backgroundColor: '#f0f0f0',
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  transcriptMeta: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
}); 