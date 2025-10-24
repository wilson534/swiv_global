/**
 * Match Page - Tinder Style
 * 匹配页面（左右滑动）
 */

import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Animated, PanResponder } from 'react-native';
import { useNavigation } from '../../lib/context';

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
}

export default function MatchPage() {
  const navigation = useNavigation();
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: '1',
      walletAddress: '7xKXtg2CW87d...',
      riskType: 'Balanced',
      keywords: ['DeFi', 'NFT', 'Solana'],
      description: '对 DeFi 和 NFT 感兴趣的平衡型投资者，喜欢研究新项目',
      trustScore: 75,
      matchScore: 88,
    },
    {
      id: '2',
      walletAddress: '9pQRst3DX92f...',
      riskType: 'Aggressive',
      keywords: ['GameFi', 'Meme', '高频交易'],
      description: '激进型玩家，喜欢高风险高收益的项目',
      trustScore: 62,
      matchScore: 72,
    },
    {
      id: '3',
      walletAddress: '4mNOuv5EY83g...',
      riskType: 'Conservative',
      keywords: ['稳定币', '质押', '长期投资'],
      description: '保守型投资者，注重资产安全和长期价值',
      trustScore: 92,
      matchScore: 65,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
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
    })
  ).current;

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

  const handleLike = () => {
    const candidate = candidates[currentIndex];
    Alert.alert(
      '匹配成功！💞',
      `你喜欢了 ${candidate.walletAddress}\n匹配度: ${candidate.matchScore}%\n\n恭喜！对方也喜欢你，现在可以开始聊天了！`,
      [
        { text: '继续匹配', style: 'cancel', onPress: () => {
          if (currentIndex < candidates.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            setCurrentIndex(0);
          }
        }},
        { text: '去聊天 💬', style: 'default', onPress: () => {
          // 跳转到聊天标签
          navigation.setActiveTab('chat');
        }}
      ]
    );
  };

  const handlePass = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // 循环
    }
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
      case 'Conservative': return '#14F195';
      case 'Balanced': return '#FFD700';
      case 'Aggressive': return '#FF4500';
      default: return '#666';
    }
  };

  if (candidates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyText}>暂无候选用户</Text>
        <Text style={styles.emptySubtext}>请稍后再来</Text>
      </View>
    );
  }

  const candidate = candidates[currentIndex];

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
            <Text style={styles.swipeLabelText}>喜欢 ❤️</Text>
          </Animated.View>

          <Animated.View style={[styles.swipeLabel, styles.passLabel, { opacity: passOpacity }]}>
            <Text style={styles.swipeLabelText}>跳过 👋</Text>
          </Animated.View>

          {/* 卡片内容 */}
          <View style={styles.cardContent}>
            {/* 信誉分徽章 */}
            <View style={styles.trustBadge}>
              <Text style={styles.trustText}>信誉 {candidate.trustScore}</Text>
            </View>

            {/* 风险类型图标 */}
            <Text style={styles.riskIcon}>{getRiskIcon(candidate.riskType)}</Text>

            {/* 钱包地址 */}
            <Text style={styles.walletAddress}>{candidate.walletAddress}</Text>

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

            {/* 滑动提示 */}
            <View style={styles.hint}>
              <Text style={styles.hintText}>👈 左滑跳过 | 右滑喜欢 👉</Text>
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
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  matchBadge: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  matchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  card: {
    width: width - 40,
    height: height - 340,
    maxHeight: 600,
    backgroundColor: '#111',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#333',
    position: 'absolute',
  },
  nextCard: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  swipeLabel: {
    position: 'absolute',
    top: 50,
    padding: 16,
    borderRadius: 12,
    borderWidth: 4,
    zIndex: 10,
  },
  likeLabel: {
    right: 30,
    borderColor: '#14F195',
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
  },
  passLabel: {
    left: 30,
    borderColor: '#FF4500',
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
  },
  swipeLabelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContent: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#14F195',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trustText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  riskIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  walletAddress: {
    fontSize: 18,
    color: '#9945FF',
    fontWeight: '600',
    marginBottom: 16,
  },
  riskBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
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
    backgroundColor: '#222',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  keywordText: {
    color: '#fff',
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  hint: {
    position: 'absolute',
    bottom: 40,
  },
  hintText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  nextCardText: {
    color: '#666',
    fontSize: 18,
  },
});
