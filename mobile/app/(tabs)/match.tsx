/**
 * Match Page - Tinder Style
 * 匹配页面（左右滑动）- 使用真实数据
 */

import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Animated, PanResponder, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '../../lib/context';
import { recordSwipe, getCandidates } from '@/lib/supabase';
import { recordInteraction, getTrustScoreColor } from '../../lib/trustScore';
import { GrowthBadge } from '../../components/GrowthBadge';

// 创建动画组件
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

  // 初始化：加载钱包地址和候选用户
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
      console.error('加载钱包地址失败:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      setLoading(true);
      console.log('🔄 开始加载候选用户，钱包地址:', walletAddress);
      const users = await getCandidates(walletAddress, 20);
      console.log(`✅✅ 候选用户加载完成，共 ${users.length} 个`);
      console.log('🔍 前3个用户详情:', users.slice(0, 3));
      
      // 确保所有用户都有效
      const validUsers = users.filter(u => u && u.walletAddress);
      console.log(`✅ 有效用户数量: ${validUsers.length}`);
      
      setCandidates(validUsers);
      setCurrentIndex(0); // 重置索引
    } catch (error) {
      console.error('❌ 加载候选用户失败:', error);
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

  // 按钮缩放动画 - 滑动时对应按钮放大
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

  // 按钮背景颜色动画 - 滑动时从白色变为彩色
  const likeButtonBg = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: ['rgba(255, 255, 255, 1)', 'rgba(16, 185, 129, 1)'], // 白色 -> 绿色
    extrapolate: 'clamp',
  });

  const passButtonBg = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: ['rgba(220, 38, 38, 1)', 'rgba(255, 255, 255, 1)'], // 红色 -> 白色
    extrapolate: 'clamp',
  });

  // 按钮图标颜色动画 - 滑动时从彩色变为白色
  const likeIconColor = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: ['rgba(16, 185, 129, 1)', 'rgba(255, 255, 255, 1)'], // 绿色 -> 白色
    extrapolate: 'clamp',
  });

  const passIconColor = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: ['rgba(255, 255, 255, 1)', 'rgba(220, 38, 38, 1)'], // 白色 -> 红色
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      // 总是允许手势（在实际操作时再检查）
      return !loading;
    },
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        // 向右滑动 - 喜欢
        swipeRight();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        // 向左滑动 - 跳过
        swipeLeft();
      } else {
        // 回到原位
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
    // 先检查数组和索引
    if (!candidates || candidates.length === 0 || currentIndex >= candidates.length) {
      console.warn('⚠️ 候选用户数组为空或索引超出范围');
      return;
    }
    
    const candidate = candidates[currentIndex];
    
    // 安全检查
    if (!candidate || !candidate.walletAddress) {
      console.error('⚠️ 候选用户数据无效:', candidate, 'currentIndex:', currentIndex, 'candidates.length:', candidates.length);
      moveToNext();
      return;
    }
    
    console.log('👍 开始处理喜欢:', candidate.walletAddress);
    console.log('👤 当前用户钱包:', walletAddress);
    console.log('🎯 目标用户钱包:', candidate.walletAddress);
    
    try {
      // 记录 like 到 Supabase（直接创建匹配）
      console.log('📞 调用 recordSwipe...');
      const result = await recordSwipe(walletAddress, candidate.walletAddress, 'like');
      console.log('📥 recordSwipe 返回结果:', result);
      
      // 🆕 记录链上互动（匹配质量分基于匹配度）
      const qualityScore = Math.min(100, 50 + candidate.matchScore / 2);
      await recordInteraction(walletAddress, 'match', qualityScore);
      console.log('✅ 链上互动已记录，质量分:', qualityScore);
      
      if (result.matched) {
        // 匹配成功
        console.log('✅ 匹配成功！准备弹出提示...');
        Alert.alert(
          '添加成功！💞',
          `已将 ${candidate.walletAddress} 添加到聊天列表\n匹配度: ${candidate.matchScore}%\n\n现在可以开始聊天了！`,
          [
            { text: '继续匹配', style: 'cancel', onPress: () => {
              console.log('用户选择：继续匹配');
              moveToNext();
            }},
            { text: '去聊天 💬', style: 'default', onPress: () => {
              console.log('用户选择：去聊天');
              navigation.setActiveTab('chat');
            }}
          ]
        );
      } else {
        // 继续下一个
        console.log('⚠️ result.matched 为 false，继续下一个');
        moveToNext();
      }
    } catch (error) {
      console.error('❌ 添加失败:', error);
      console.error('❌ 错误详情:', JSON.stringify(error, null, 2));
      Alert.alert('添加失败', `错误: ${error.message || error}`);
      // 即使失败也继续
      moveToNext();
    }
  };

  const handlePass = async () => {
    // 先检查数组和索引
    if (!candidates || candidates.length === 0 || currentIndex >= candidates.length) {
      console.warn('⚠️ 候选用户数组为空或索引超出范围');
      return;
    }
    
    const candidate = candidates[currentIndex];
    
    // 安全检查
    if (!candidate || !candidate.walletAddress) {
      console.error('⚠️ 候选用户数据无效:', candidate, 'currentIndex:', currentIndex, 'candidates.length:', candidates.length);
      moveToNext();
      return;
    }
    
    console.log('👎 开始处理跳过:', candidate.walletAddress);
    
    try {
      // 记录 pass 到 Supabase
      await recordSwipe(walletAddress, candidate.walletAddress, 'pass');
    } catch (error) {
      console.error('记录跳过失败:', error);
    }
    
    moveToNext();
  };

  const moveToNext = () => {
    if (!candidates || candidates.length === 0) {
      console.warn('⚠️ 无法移动到下一个，候选用户数组为空');
      return;
    }
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < candidates.length) {
      console.log(`➡️ 移动到下一个: ${nextIndex}/${candidates.length}`);
      setCurrentIndex(nextIndex);
    } else {
      console.log('🔄 回到第一个候选用户');
      setCurrentIndex(0); // 循环
    }
  };

  const getAvatarUrl = (walletAddress: string) => {
    // 使用 DiceBear API 生成真实感头像
    // lorelei 风格 - 简约现代的人像头像
    return `https://api.dicebear.com/7.x/lorelei/png?seed=${walletAddress}&size=300&backgroundColor=f3f4f6`;
  };

  const getUserName = (walletAddress: string) => {
    // 根据钱包地址生成一致的用户名
    const names = [
      'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
      'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
      'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Luna', 'Jack', 'Grace',
      'Daniel', 'Chloe', 'Matthew', 'Zoe', 'Jackson', 'Lily', 'Sebastian',
      'Elena', 'Ryan', 'Aria', 'Nathan', 'Maya', 'David', 'Nora', 'Andrew'
    ];
    
    // 使用钱包地址生成一个固定的索引
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

  // 加载状态
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>匹配</Text>
          <Text style={styles.headerSubtitle}>找到志同道合的投资伙伴</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>加载候选用户中...</Text>
        </View>
      </View>
    );
  }

  // 空状态
  if (candidates.length === 0 || currentIndex >= candidates.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>匹配</Text>
          <Text style={styles.headerSubtitle}>找到志同道合的投资伙伴</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyText}>
            {candidates.length === 0 ? '暂无候选用户' : '全部看完了！'}
          </Text>
          <Text style={styles.emptySubtext}>
            {candidates.length === 0 ? '请在 Supabase 中创建测试用户' : '已经浏览完所有候选用户'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setCurrentIndex(0);
              loadCandidates();
            }}
          >
            <Text style={styles.retryText}>🔄 重新加载</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const candidate = candidates[currentIndex];

  // 安全检查：如果当前候选用户无效，显示错误
  if (!candidate || !candidate.walletAddress) {
    console.error('❌ 当前候选用户无效:', currentIndex, candidate);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>匹配</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyText}>数据加载异常</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setCurrentIndex(0);
              loadCandidates();
            }}
          >
            <Text style={styles.retryText}>🔄 重新加载</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  console.log('📌 当前显示用户:', candidate.walletAddress, `(${currentIndex + 1}/${candidates.length})`);

  return (
    <View style={styles.container}>
      {/* 顶部标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>匹配</Text>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>🎯 {candidate.matchScore}%</Text>
        </View>
      </View>

      {/* 卡片区域 */}
      <View style={styles.cardContainer}>
        {/* 下一张卡片预览 */}
        {currentIndex < candidates.length - 1 && (
          <View style={[styles.card, styles.nextCard]}>
            <View style={styles.cardContent}>
              <Text style={styles.nextCardText}>下一位</Text>
            </View>
          </View>
        )}

        {/* 当前卡片 */}
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

          <Animated.View style={[styles.swipeLabel, styles.passLabel, { opacity: passOpacity }]}>
            <Ionicons name="close" size={48} color="#DC2626" />
          </Animated.View>

          {/* 卡片内容 */}
          <View style={styles.cardContent}>
            {/* 🆕 成长徽章（包含信誉和等级） */}
            <View style={styles.topBadges}>
              {/* 信誉分徽章 */}
              <View style={styles.trustBadge}>
                <Text style={styles.trustLabel}>信誉分</Text>
                <Text style={[styles.trustValue, { color: getTrustScoreColor(candidate.trustScore) }]}>
                  {candidate.trustScore}
                </Text>
              </View>

              {/* 等级徽章 */}
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

            {/* 用户头像 */}
            <Image 
              source={{ uri: getAvatarUrl(candidate.walletAddress) }}
              style={styles.avatarImage}
            />

            {/* 用户名称 */}
            <Text style={styles.userName}>{getUserName(candidate.walletAddress)}</Text>
            <Text style={styles.userWallet}>@{candidate.walletAddress.substring(0, 8)}...</Text>

            {/* 风险类型 */}
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(candidate.riskType) }]}>
              <Text style={styles.riskText}>{candidate.riskType}</Text>
            </View>

            {/* 关键词 */}
            <View style={styles.keywordsContainer}>
              {candidate.keywords.map((keyword, index) => (
                <View key={index} style={styles.keyword}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>

            {/* 描述 */}
            <Text style={styles.description}>{candidate.description}</Text>

            {/* Tinder 风格按钮组 - 放在卡片底部 */}
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
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  userName: {
    fontSize: 28,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  userWallet: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  riskBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 24,
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
    gap: 10,
    marginBottom: 24,
    justifyContent: 'center',
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
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
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
