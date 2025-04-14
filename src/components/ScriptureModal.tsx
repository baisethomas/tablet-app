import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface ScriptureModalProps {
  isVisible: boolean;
  onClose: () => void;
  verseContent: string;
  reference: string;
  isLoading: boolean;
  error?: string;
}

export function ScriptureModal({
  isVisible,
  onClose,
  verseContent,
  reference,
  isLoading,
  error,
}: ScriptureModalProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const scrollRef = useRef<ScrollView>(null);
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (error) {
      console.error('ScriptureModal error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (isVisible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          mass: 1,
          stiffness: 120,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          damping: 15,
          mass: 1,
          stiffness: 120,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isVisible]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[
          styles.errorContainer,
          {
            backgroundColor: colors.error + '20',
            padding: spacing.sm,
            borderRadius: borderRadius.sm,
          }
        ]}>
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <Text style={[
            styles.errorText,
            {
              color: colors.error,
              marginLeft: spacing.sm,
              fontSize: typography.fontSize.sm,
            }
          ]}>
            {error}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.scrollContainer, { maxHeight: windowHeight * 0.6 }]}>
        <View 
          style={[
            styles.scrollFade, 
            styles.scrollFadeTop, 
            { backgroundColor: colors.background.primary }
          ]} 
          pointerEvents="none"
        />
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingVertical: spacing.md }
          ]}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
          bounces={false}
        >
          <Text style={[
            styles.verseText,
            {
              color: colors.text.primary,
              fontSize: typography.fontSize.md,
              lineHeight: typography.fontSize.md * 1.6,
            }
          ]}>
            {verseContent}
          </Text>
        </ScrollView>
        <View 
          style={[
            styles.scrollFade, 
            styles.scrollFadeBottom,
            { backgroundColor: colors.background.primary }
          ]} 
          pointerEvents="none"
        />
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              backgroundColor: colors.background.primary,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              {
                color: colors.text.primary,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
              }
            ]}>
              {reference}
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          {renderContent()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
  },
  scrollContainer: {
    position: 'relative',
    minHeight: 100,
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  verseText: {
    textAlign: 'left',
  },
  scrollFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
    opacity: 0.9,
  },
  scrollFadeTop: {
    top: 0,
  },
  scrollFadeBottom: {
    bottom: 0,
  },
}); 