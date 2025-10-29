/**
 * Feed Page - TikTok Style
 * Learning Feed Page (Vertical Swipe Full-Screen Cards)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, ActivityIndicator, FlatList, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.102:3000';

interface FeedItem {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function FeedPage() {
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [trustScore, setTrustScore] = useState(100);
  
  // AI对话相关
  const [showAIChat, setShowAIChat] = useState(false);
  const [currentContext, setCurrentContext] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAILoading] = useState(false);

  // Category tabs
  const categories = ['All', 'Blockchain', 'DeFi', 'NFT', 'Web3', 'DAO', 'Smart Contracts'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allFeedItems, setAllFeedItems] = useState<FeedItem[]>([]);

  const walletAddress = 'demo_wallet_123';

  // Generate new learning content (AI real-time generation)
  const generateNewContent = async () => {
    if (generating) return;
    
    try {
      setGenerating(true);
      
      // Get existing topic titles
      const previousTopics = feedItems.map(item => item.title);
      
      // Call AI to generate new topic
      const response = await fetch(`${API_URL}/api/generate-topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          previousTopics,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('AI generated new topic:', result.data.title);
          setFeedItems(prev => [...prev, result.data]);
        }
      } else {
        // If generation fails, fallback to pre-made content
        const fallbackResponse = await fetch(
          `${API_URL}/api/feed?walletAddress=${walletAddress}&offset=${feedItems.length}&limit=1`
        );
        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          if (fallbackResult.success && fallbackResult.data.length > 0) {
            setFeedItems(prev => [...prev, ...fallbackResult.data]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Initial loading
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/feed?walletAddress=${walletAddress}&offset=0&limit=10`
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAllFeedItems(result.data);
            setFeedItems(result.data);
          }
        }
      } catch (error) {
        console.error('Loading failed:', error);
        Alert.alert('Error', 'Unable to load content');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitial();
    // eslint-disable-next-line
  }, []);

  // Category filtering
  useEffect(() => {
    filterContent();
    // eslint-disable-next-line
  }, [selectedCategory, searchQuery]);

  const filterContent = () => {
    let filtered = [...allFeedItems];
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search keywords
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.content.toLowerCase().includes(query)
      );
    }
    
    setFeedItems(filtered);
    setCurrentIndex(0);
  };

  // Auto-load when scrolling to next card
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const cardHeight = height - 220;
    const index = Math.round((offsetY - (Platform.OS === 'ios' ? 160 : 130)) / cardHeight);
    
    if (index !== currentIndex && index >= 0) {
      setCurrentIndex(index);
      
      // Auto-generate new content when approaching the last card
      if (index >= feedItems.length - 1) {
        generateNewContent();
      }
    }
  };

  // Open AI chat page
  const handleAskAI = (item: FeedItem) => {
    setCurrentContext(item.title);
    setMessages([{
      id: '0',
      role: 'ai',
      content: `Hello! I'm Swiv AI Assistant 🤖\n\nCurrent learning topic: ${item.title}\n\nWhat would you like to ask me?`,
      timestamp: new Date(),
    }]);
    setInput('');
    setShowAIChat(true);
  };

  // Send AI message
  const sendAIMessage = async () => {
    if (!input.trim() || aiLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAILoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          question: userMessage.content,
          context: `Current learning topic: ${currentContext}`,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: result.data.answer,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Sorry, I encountered an issue. Please try again later.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setAILoading(false);
    }
  };

  // Complete learning
  const handleComplete = async (item: FeedItem) => {
    try {
      console.log('📚 Learning card completed:', item.title);
      console.log('👤 Wallet address:', walletAddress);
      
      // 📞 Call API to record learning activity on-chain
      const response = await fetch(`${API_URL}/api/trust-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress,
          interactionType: 'helpful', // Use 'helpful' type to indicate learning completion
          qualityScore: 85, // Learning completion score
        }),
      });

      const result = await response.json();
      console.log('✅ Learning activity recorded on-chain:', result);

      // Update local score
      const newScore = Math.min(trustScore + 2, 100);
      setTrustScore(newScore);
      
      Alert.alert(
        'Completed ✅',
        `Great! Learning record on-chain\n\nTrust Score +2 → ${newScore}\n\nOn-chain confirmation: ${result.success ? 'Success' : 'Failed'}`,
        [{ text: 'Continue', style: 'default' }]
      );
    } catch (error) {
      console.error('❌ Failed to record learning activity:', error);
      
      // Update local score even if on-chain recording fails
      const newScore = Math.min(trustScore + 2, 100);
      setTrustScore(newScore);
      
      Alert.alert(
        'Completed ✅',
        `Great!\n\nTrust Score +2 → ${newScore}\n\n(On-chain record will sync later)`,
        [{ text: 'Continue', style: 'default' }]
      );
    }
  };

  // Render single card
  const renderCard = ({ item, index }: { item: FeedItem; index: number }) => (
    <View style={styles.card}>
      {/* Top badges row */}
      <View style={styles.badgesRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{trustScore}</Text>
        </View>
      </View>

      {/* Content area - scrollable */}
      <ScrollView 
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {item.difficulty === 'beginner' ? '🟢 Beginner' : 
                 item.difficulty === 'intermediate' ? '🟡 Intermediate' : '🔴 Advanced'}
              </Text>
            </View>
            <Text style={styles.timeText}>⏱ {item.estimatedTime} min</Text>
          </View>

          <Text style={styles.content}>{item.content}</Text>
        </View>
      </ScrollView>

      {/* Bottom buttons - always at bottom */}
      <View style={styles.bottomSection}>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.askButton]}
            onPress={() => handleAskAI(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>💬 Ask AI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleComplete(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.completeButtonText}>✓ Complete</Text>
          </TouchableOpacity>
        </View>

        {/* Swipe hint - always show */}
        <View style={styles.swipeHint}>
          <Text style={styles.hintText}>👆 Swipe up for more</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed header */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerTop}>
          {/* Left logo and name */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <View style={styles.logoNetwork}>
                <View style={[styles.logoDot, styles.logoDotTopLeft]} />
                <View style={[styles.logoDot, styles.logoDotTopRight]} />
                <View style={[styles.logoDot, styles.logoDotBottom]} />
                <View style={styles.logoLineVertical} />
                <View style={styles.logoLineLeft} />
                <View style={styles.logoLineRight} />
              </View>
            </View>
            <Text style={styles.appName}>Swiv</Text>
          </View>

          {/* Right search icon */}
          <TouchableOpacity 
            style={styles.searchButton} 
            activeOpacity={0.7}
            onPress={() => setShowSearch(true)}
          >
            <Ionicons name="search-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Category tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category && styles.categoryTabTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search status hint */}
        {searchQuery.trim() && (
          <View style={styles.searchStatusBar}>
            <Text style={styles.searchStatusText}>
              Search: "{searchQuery}"
            </Text>
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.searchStatusClose}
            >
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content list */}
      <FlatList
        ref={flatListRef}
        data={feedItems}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={height - 220}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={feedItems.length === 0 ? styles.emptyListContent : styles.flatListContent}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Ionicons name="file-tray-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyListText}>
              {selectedCategory !== 'All' ? 'No content in this category' : 'No learning content'}
            </Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          generating ? (
            <View style={styles.generatingFooter}>
              <ActivityIndicator size="small" color="#000000" />
              <Text style={styles.generatingText}>AI is generating new content...</Text>
            </View>
          ) : null
        }
      />

      {/* Search Modal */}
      <Modal
        visible={showSearch}
        animationType="slide"
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowSearch(false);
              }}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search learning content..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={() => {
                // Close modal after search, show results on main page
                if (searchQuery.trim()) {
                  setShowSearch(false);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView style={styles.searchResultsScroll}>
            {searchQuery.trim() === '' ? (
              <View style={styles.searchEmptyContainer}>
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text style={styles.searchEmptyText}>Enter keywords to search learning content</Text>
              </View>
            ) : feedItems.length > 0 ? (
              <View style={styles.searchResultsList}>
                <Text style={styles.searchResultCount}>Found {feedItems.length} result(s)</Text>
                {feedItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.searchResultItem}
                    onPress={() => {
                      setShowSearch(false);
                      // 找到该项在原始数据中的索引
                      const originalIndex = feedItems.findIndex(f => f.id === item.id);
                      setCurrentIndex(originalIndex);
                      setTimeout(() => {
                        flatListRef.current?.scrollToIndex({ 
                          index: originalIndex, 
                          animated: false 
                        });
                      }, 100);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchResultBadge}>
                      <Text style={styles.searchResultCategory}>{item.category}</Text>
                    </View>
                    <Text style={styles.searchResultTitle}>{item.title}</Text>
                    <Text style={styles.searchResultContent} numberOfLines={2}>
                      {item.content}
                    </Text>
                    <View style={styles.searchResultMeta}>
                      <Text style={styles.searchResultMetaText}>{item.estimatedTime} minutes</Text>
                      <Text style={styles.searchResultMetaBullet}>•</Text>
                      <Text style={styles.searchResultMetaText}>
                        {item.difficulty === 'beginner' ? 'Beginner' : 
                         item.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.searchEmptyContainer}>
                <Ionicons name="sad-outline" size={64} color="#D1D5DB" />
                <Text style={styles.searchEmptyText}>No content found</Text>
                <Text style={styles.searchEmptySubtext}>Try other keywords</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* AI Chat Modal */}
      <Modal
        visible={showAIChat}
        animationType="slide"
        onRequestClose={() => setShowAIChat(false)}
      >
        <KeyboardAvoidingView 
          style={styles.aiChatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Top navigation */}
          <View style={styles.aiChatHeader}>
            <TouchableOpacity 
              onPress={() => setShowAIChat(false)}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.aiChatHeaderText}>AI Assistant</Text>
              <Text style={styles.aiChatHeaderSubtext}>🤖 Swiv Learning Assistant</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Message list */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.aiBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userText : styles.aiText
                ]}>
                  {message.content}
                </Text>
                <Text style={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            ))}

            {aiLoading && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color="#000000" />
                <Text style={styles.aiLoadingText}>AI is thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input box */}
          <View style={styles.aiInputContainer}>
            <TextInput
              style={styles.aiInput}
              value={input}
              onChangeText={setInput}
              placeholder="Enter your question..."
              placeholderTextColor="#666"
              multiline
              maxLength={500}
              editable={!aiLoading}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!input.trim() || aiLoading) && styles.sendButtonDisabled
              ]}
              onPress={sendAIMessage}
              disabled={!input.trim() || aiLoading}
            >
              <Text style={styles.sendIcon}>
                {aiLoading ? '⏳' : '🚀'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoNetwork: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  logoDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  logoDotTopLeft: {
    top: 0,
    left: 2,
  },
  logoDotTopRight: {
    top: 0,
    right: 2,
  },
  logoDotBottom: {
    bottom: 0,
    left: '50%',
    marginLeft: -2.5,
  },
  logoLineVertical: {
    position: 'absolute',
    width: 1.5,
    height: 14,
    backgroundColor: '#FFFFFF',
    top: 5,
    left: '50%',
    marginLeft: -0.75,
  },
  logoLineLeft: {
    position: 'absolute',
    width: 8,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    top: 6,
    left: 4,
    transform: [{ rotate: '45deg' }],
  },
  logoLineRight: {
    position: 'absolute',
    width: 8,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    top: 6,
    right: 4,
    transform: [{ rotate: '-45deg' }],
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#000000',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 8,
  },
  searchStatusText: {
    fontSize: 14,
    color: '#374151',
  },
  searchStatusClose: {
    padding: 4,
  },
  flatListContent: {
    paddingTop: Platform.OS === 'ios' ? 160 : 130,
  },
  emptyListContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 160 : 130,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyListText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 14,
  },
  card: {
    width: width,
    height: height - 220,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  contentScrollView: {
    maxHeight: height - 420,
  },
  contentScrollContent: {
    paddingBottom: 24,
  },
  categoryBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  scoreBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  scoreText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
    lineHeight: 38,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  difficultyBadge: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 30,
    marginTop: 4,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  askButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  completeButton: {
    backgroundColor: '#000000',
  },
  actionText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  swipeHint: {
    alignItems: 'center',
  },
  hintText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  // 搜索样式
  searchContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#000000',
  },
  clearButton: {
    padding: 8,
  },
  searchResultsScroll: {
    flex: 1,
  },
  searchEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  searchEmptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  searchEmptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 8,
  },
  searchResultsList: {
    padding: 20,
  },
  searchResultCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  searchResultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchResultBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  searchResultCategory: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  searchResultContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  searchResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchResultMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  searchResultMetaBullet: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  generatingFooter: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  generatingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 16,
  },
  // AI对话样式
  aiChatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  aiChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#000000',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  aiChatHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  aiChatHeaderSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  aiText: {
    color: '#374151',
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  aiLoadingText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  aiInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
    gap: 12,
  },
  aiInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#000000',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 24,
  },
});
