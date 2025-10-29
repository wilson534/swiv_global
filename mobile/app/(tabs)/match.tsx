/**
 * Match Page - Tinder Style
 * Matching page (swipe left/right) - Using real data
 */

import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Animated, PanResponder, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '../../lib/context';
import { recordSwipe, getCandidates } from '@/lib/supabase';
import { recordInteraction, getTrustScoreColor } from '../../lib/trustScore';
import { GrowthBadge } from '../../components/GrowthBadge';

// Create animated component
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface Candidate {
  id: string;
  walletAddress: string;
  riskType: 'Conservative' | 'Balanced' | 'Aggressive';
  keywords: string[];
  description: string;
  trustScore: number;
  matchScore: number;
  showAssets?: boolean;
  level?: number;
  levelIcon?: string;
  assetIcon?: string;
}

export default function MatchPage() {
  const navigation = useNavigation();
  const [walletAddress, setWalletAddress] = useState<string>('demo_wallet_123');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize: Load wallet address and candidates
  useEffect(() => {
    loadWalletAddress();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      loadCandidates();
    }
  }, [walletAddress]);

  const loadWalletAddress = async () => {
    try {
      const address = await AsyncStorage.getItem('walletAddress');
      if (address) {
        setWalletAddress(address);
      }
    } catch (error) {
      console.error('Failed to load wallet address:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading candidates, wallet address:', walletAddress);
      const users = await getCandidates(walletAddress, 20);
      console.log(`✅✅ Candidates loaded, total ${users.length}`);
      console.log('🔍 First 3 user details:', users.slice(0, 3));
      
      // Ensure all users are valid
      const validUsers = users.filter(u => u && u.walletAddress);
      console.log(`✅ Valid user count: ${validUsers.length}`);
      
      setCandidates(validUsers);
      setCurrentIndex(0); // Reset index
    } catch (error) {
      console.error('❌ Failed to load candidates:', error);
      setCandidates([]);
      setCurrentIndex(0);
    } finally {
      setLoading(false);
    }
  };
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Button scale animation - Enlarge corresponding button when swiping
  const likeButtonScale = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [1, 1.2],
    extrapolate: 'clamp',
  });

  const passButtonScale = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  // Button background color animation - Change from white to colored when swiping
  const likeButtonBg = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: ['rgba(255, 255, 255, 1)', 'rgba(16, 185, 129, 1)'], // White -> Green
    extrapolate: 'clamp',
  });

  const passButtonBg = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: ['rgba(220, 38, 38, 1)', 'rgba(255, 255, 255, 1)'], // Red -> White
    extrapolate: 'clamp',
  });

  // Button icon color animation - Change from colored to white when swiping
  const likeIconColor = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: ['rgba(16, 185, 129, 1)', 'rgba(255, 255, 255, 1)'], // Green -> White
    extrapolate: 'clamp',
  });

  const passIconColor = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: ['rgba(255, 255, 255, 1)', 'rgba(220, 38, 38, 1)'], // White -> Red
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      // Always allow gestures (check when actually operating)
      return !loading;
    },
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        // Swipe right - Like
        swipeRight();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        // Swipe left - Pass
        swipeLeft();
      } else {
        // Return to original position
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      handleLike();
      position.setValue({ x: 0, y: 0 });
    });
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      handlePass();
      position.setValue({ x: 0, y: 0 });
    });
  };

  const handleLike = async () => {
    // Check array and index first
    if (!candidates || candidates.length === 0 || currentIndex >= candidates.length) {
      console.warn('⚠️ Candidate array is empty or index out of range');
      return;
    }
    
    const candidate = candidates[currentIndex];
    
    // Safety check
    if (!candidate || !candidate.walletAddress) {
      console.error('⚠️ Invalid candidate data:', candidate, 'currentIndex:', currentIndex, 'candidates.length:', candidates.length);
      moveToNext();
      return;
    }
    
    console.log('👍 Processing like:', candidate.walletAddress);
    console.log('👤 Current user wallet:', walletAddress);
    console.log('🎯 Target user wallet:', candidate.walletAddress);
    
    try {
      // Record like to Supabase (create match directly)
      console.log('📞 Calling recordSwipe...');
      const result = await recordSwipe(walletAddress, candidate.walletAddress, 'like');
      console.log('📥 recordSwipe result:', result);
      
      // 🆕 Record on-chain interaction (match quality score based on match score)
      const qualityScore = Math.min(100, 50 + candidate.matchScore / 2);
      await recordInteraction(walletAddress, 'match', qualityScore);
      console.log('✅ On-chain interaction recorded, quality score:', qualityScore);
      
      if (result.matched) {
        // Match successful
        console.log('✅ Match successful! Preparing alert...');
        Alert.alert(
          'Added Successfully! 💞',
          `${candidate.walletAddress} added to chat list\nMatch score: ${candidate.matchScore}%\n\nYou can start chatting now!`,
          [
            { text: 'Continue Matching', style: 'cancel', onPress: () => {
              console.log('User selected: Continue matching');
              moveToNext();
            }},
            { text: 'Go to Chat 💬', style: 'default', onPress: () => {
              console.log('User selected: Go to chat');
              navigation.setActiveTab('chat');
            }}
          ]
        );
      } else {
        // Continue to next
        console.log('⚠️ result.matched is false, continue to next');
        moveToNext();
      }
    } catch (error) {
      console.error('❌ Failed to add:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Add Failed', `Error: ${error.message || error}`);
      // Continue even if failed
      moveToNext();
    }
  };

  const handlePass = async () => {
    // Check array and index first
    if (!candidates || candidates.length === 0 || currentIndex >= candidates.length) {
      console.warn('⚠️ Candidate array is empty or index out of range');
      return;
    }
    
    const candidate = candidates[currentIndex];
    
    // Safety check
    if (!candidate || !candidate.walletAddress) {
      console.error('⚠️ Invalid candidate data:', candidate, 'currentIndex:', currentIndex, 'candidates.length:', candidates.length);
      moveToNext();
      return;
    }
    
    console.log('👎 Processing pass:', candidate.walletAddress);
    
    try {
      // Record pass to Supabase
      await recordSwipe(walletAddress, candidate.walletAddress, 'pass');
    } catch (error) {
      console.error('Failed to record pass:', error);
    }
    
    moveToNext();
  };

  const moveToNext = () => {
    if (!candidates || candidates.length === 0) {
      console.warn('⚠️ Cannot move to next, candidate array is empty');
      return;
    }
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < candidates.length) {
      console.log(`➡️ Moving to next: ${nextIndex}/${candidates.length}`);
      setCurrentIndex(nextIndex);
    } else {
      console.log('🔄 Back to first candidate');
      setCurrentIndex(0); // Loop
    }
  };

  const getAvatarUrl = (walletAddress: string) => {
    // Use DiceBear API to generate realistic avatar
    // lorelei style - minimalist modern portrait
    return `https://api.dicebear.com/7.x/lorelei/png?seed=${walletAddress}&size=300&backgroundColor=f3f4f6`;
  };

  const getUserName = (walletAddress: string) => {
    // Generate consistent username based on wallet address
    const names = [
      'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
      'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
      'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Luna', 'Jack', 'Grace',
      'Daniel', 'Chloe', 'Matthew', 'Zoe', 'Jackson', 'Lily', 'Sebastian',
      'Elena', 'Ryan', 'Aria', 'Nathan', 'Maya', 'David', 'Nora', 'Andrew'
    ];
    
    // Use wallet address to generate a fixed index
    let hash = 0;
    for (let i = 0; i < walletAddress.length; i++) {
      hash = ((hash << 5) - hash) + walletAddress.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % names.length;
    return names[index];
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'Conservative': return '🛡️';
      case 'Balanced': return '⚖️';
      case 'Aggressive': return '🚀';
      default: return '❓';
    }
  };

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'Conservative': return '#6B7280';
      case 'Balanced': return '#4B5563';
      case 'Aggressive': return '#374151';
      default: return '#9CA3AF';
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Match</Text>
          <Text style={styles.headerSubtitle}>Find like-minded investment partners</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading candidates...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (candidates.length === 0 || currentIndex >= candidates.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Match</Text>
          <Text style={styles.headerSubtitle}>Find like-minded investment partners</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyText}>
            {candidates.length === 0 ? 'No candidates available' : 'All done!'}
          </Text>
          <Text style={styles.emptySubtext}>
            {candidates.length === 0 ? 'Please create test users in Supabase' : 'You\'ve viewed all candidates'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setCurrentIndex(0);
              loadCandidates();
            }}
          >
            <Text style={styles.retryText}>🔄 Reload</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const candidate = candidates[currentIndex];

  // Safety check: If current candidate is invalid, show error
  if (!candidate || !candidate.walletAddress) {
    console.error('❌ Current candidate invalid:', currentIndex, candidate);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Match</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyText}>Data loading error</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setCurrentIndex(0);
              loadCandidates();
            }}
          >
            <Text style={styles.retryText}>🔄 Reload</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  console.log('📌 Currently displaying user:', candidate.walletAddress, `(${currentIndex + 1}/${candidates.length})`);

  return (
    <View style={styles.container}>
      {/* Top title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match</Text>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>🎯 {candidate.matchScore}%</Text>
        </View>
      </View>

      {/* Card area */}
      <View style={styles.cardContainer}>
        {/* Next card preview */}
        {currentIndex < candidates.length - 1 && (
          <View style={[styles.card, styles.nextCard]}>
            <View style={styles.cardContent}>
              <Text style={styles.nextCardText}>Next</Text>
            </View>
          </View>
        )}

        {/* Current card */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
        >
          {/* 滑动标签 */}
          <Animated.View style={[styles.swipeLabel, styles.likeLabel, { opacity: likeOpacity }]}>
            <Ionicons name="heart" size={48} color="#10B981" />
          </Animated.View>

          <Animated.View style={[styles.swipeLabel, styles.passLabel, { opacity: passOpacity }]}          >
            <Ionicons name="close" size={48} color="#DC2626" />
          </Animated.View>

          {/* Card content */}
          <View style={styles.cardContent}>
            {/* 🆕 Growth badge (includes reputation and level) */}
            <View style={styles.topBadges}>
              {/* Trust score badge */}
              <View style={styles.trustBadge}>
                <Text style={styles.trustLabel}>Trust Score</Text>
                <Text style={[styles.trustValue, { color: getTrustScoreColor(candidate.trustScore) }]}>
                  {candidate.trustScore}
                </Text>
              </View>

              {/* Level badge */}
              {candidate.level && (
                <GrowthBadge 
                  profile={{
                    level: candidate.level,
                    levelIcon: candidate.levelIcon || '🌱',
                    levelTitle: '',
                    daysActive: 0,
                    cardsLearned: 0,
                    questionsAsked: 0,
                    helpfulAnswers: 0,
                    mentorScore: 0,
                    nextLevelProgress: 0,
                    totalXP: 0,
                    showAssets: candidate.showAssets || false,
                    assetIcon: candidate.assetIcon,
                  }}
                  compact={true}
                />
              )}
            </View>

            {/* User avatar */}
            <Image 
              source={{ uri: getAvatarUrl(candidate.walletAddress) }}
              style={styles.avatarImage}
            />

            {/* User name */}
            <Text style={styles.userName}>{getUserName(candidate.walletAddress)}</Text>
            <Text style={styles.userWallet}>@{candidate.walletAddress.substring(0, 8)}...</Text>

            {/* Risk type */}
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(candidate.riskType) }]}>
              <Text style={styles.riskText}>{candidate.riskType}</Text>
            </View>

            {/* Keywords */}
            <View style={styles.keywordsContainer}>
              {candidate.keywords.map((keyword, index) => (
                <View key={index} style={styles.keyword}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.description}>{candidate.description}</Text>

            {/* Tinder style button group - At card bottom */}
            <View style={styles.actionButtons}>
              <AnimatedTouchable 
                style={[
                  styles.actionButton,
                  styles.passButton,
                  {
                    transform: [{ scale: passButtonScale }],
                    backgroundColor: passButtonBg,
                  }
                ]}
                onPress={swipeLeft}
                activeOpacity={0.7}
              >
                <Animated.Text style={[styles.buttonIcon, { color: passIconColor }]}>
                  ✕
                </Animated.Text>
              </AnimatedTouchable>
              
              <AnimatedTouchable 
                style={[
                  styles.actionButton,
                  styles.likeButton,
                  {
                    transform: [{ scale: likeButtonScale }],
                    backgroundColor: likeButtonBg,
                  }
                ]}
                onPress={swipeRight}
                activeOpacity={0.7}
              >
                <Animated.Text style={[styles.buttonIcon, { color: likeIconColor }]}>
                  ♥
                </Animated.Text>
              </AnimatedTouchable>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  matchBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  card: {
    width: width - 40,
    height: height - 240,
    maxHeight: 720,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  nextCard: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  swipeLabel: {
    position: 'absolute',
    top: 50,
    padding: 16,
    zIndex: 10,
  },
  likeLabel: {
    right: 30,
  },
  passLabel: {
    left: 30,
  },
  cardContent: {
    flex: 1,
    padding: 30,
    paddingTop: 70, // More top padding to avoid overlap with badge
    paddingBottom: 120, // Reserve space for action buttons
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // 🆕 顶部徽章栏
  topBadges: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    zIndex: 10,
  },
  trustBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10, // Ensure badge stays on top
  },
  trustLabel: {
    color: '#999',
    fontSize: 11,
  },
  trustValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginTop: 10,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  userName: {
    fontSize: 26,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userWallet: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  riskBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  riskText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  keyword: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  keywordText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 30,
    marginTop: 16,
    maxWidth: '90%',
    alignSelf: 'center',
    flex: 1, // Allow description to take remaining space
  },
  actionButtons: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  passButton: {
  },
  likeButton: {
  },
  buttonIcon: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  nextCardText: {
    color: '#6B7280',
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
