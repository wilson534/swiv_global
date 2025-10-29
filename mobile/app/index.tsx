/**
 * Entry Point with Navigation
 * Application entry point with navigation
 */

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import FeedPage from './(tabs)/feed';
import MatchPage from './(tabs)/match';
import ChatPage from './(tabs)/chat';
import GrowthPage from './(tabs)/growth';
import PersonaQuizPage from './persona/index';
import { NavigationContext, TabName } from '../lib/context';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabName>('feed');
  const [hasPersona, setHasPersona] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has completed AI assessment
  useEffect(() => {
    checkPersonaStatus();
  }, []);

  const checkPersonaStatus = async () => {
    try {
      const personaCompleted = await AsyncStorage.getItem('persona_completed');
      // Default to false, only true if explicitly marked
      setHasPersona(personaCompleted === 'true');
      console.log('Persona completed status:', personaCompleted);
    } catch (error) {
      console.error('Failed to check persona status:', error);
      setHasPersona(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Callback after completing assessment
  const handlePersonaComplete = async () => {
    try {
      await AsyncStorage.setItem('persona_completed', 'true');
      setHasPersona(true);
    } catch (error) {
      console.error('Failed to save persona status:', error);
    }
  };

  // Dev only: Reset persona status
  const handleResetPersona = async () => {
    try {
      await AsyncStorage.removeItem('persona_completed');
      setHasPersona(false);
      console.log('Persona status reset');
    } catch (error) {
      console.error('Failed to reset persona:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading Swiv...</Text>
        {/* Dev reset button */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={async () => {
            await AsyncStorage.removeItem('persona_completed');
            setIsLoading(true);
            setTimeout(() => {
              checkPersonaStatus();
            }, 100);
          }}
        >
          <Text style={styles.resetButtonText}>🔄 Reset Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If assessment not completed, show AI assessment page
  if (!hasPersona) {
    // @ts-ignore
    return <PersonaQuizPage onComplete={handlePersonaComplete} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedPage />;
      case 'match':
        return <MatchPage />;
      case 'chat':
        return <ChatPage />;
      case 'growth':
        return <GrowthPage />;
      default:
        return <FeedPage />;
    }
  };

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      <View style={styles.container}>
        {/* Main content area */}
        <View style={styles.content}>
          {renderPage()}
        </View>

      {/* Bottom navigation bar - Minimalist X-style */}
      <View style={styles.tabBar}>
        {/* Feed */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('feed')}
          activeOpacity={0.6}
        >
          <Ionicons 
            name={activeTab === 'feed' ? 'home' : 'home-outline'} 
            size={26} 
            color={activeTab === 'feed' ? '#000000' : '#9CA3AF'} 
          />
        </TouchableOpacity>

        {/* Match */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('match')}
          activeOpacity={0.6}
        >
          <Ionicons 
            name={activeTab === 'match' ? 'heart' : 'heart-outline'} 
            size={26} 
            color={activeTab === 'match' ? '#000000' : '#9CA3AF'} 
          />
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('chat')}
          activeOpacity={0.6}
        >
          <Ionicons 
            name={activeTab === 'chat' ? 'mail' : 'mail-outline'} 
            size={26} 
            color={activeTab === 'chat' ? '#000000' : '#9CA3AF'} 
          />
        </TouchableOpacity>

        {/* Growth */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('growth')}
          activeOpacity={0.6}
        >
          <Ionicons 
            name={activeTab === 'growth' ? 'person' : 'person-outline'} 
            size={26} 
            color={activeTab === 'growth' ? '#000000' : '#9CA3AF'} 
          />
        </TouchableOpacity>
      </View>
      </View>
    </NavigationContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000000',
    fontSize: 16,
    marginTop: 16,
  },
  resetButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    paddingTop: 12,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabIcon: {
    fontSize: 28,
    color: '#9CA3AF',
  },
  activeIcon: {
    color: '#000000',
    fontWeight: 'bold',
  },
});
