/**
 * Trust Score Display Component
 * 信誉分展示组件
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getUserTrustScore, getTrustScoreColor, getTrustScoreLevel, TrustScoreData } from '../lib/trustScore';

interface Props {
  walletAddress: string;
  showAnimation?: boolean;
}

export function TrustScoreDisplay({ walletAddress, showAnimation = true }: Props) {
  const [trustScore, setTrustScore] = useState<TrustScoreData | null>(null);
  const [animatedScore] = useState(new Animated.Value(0));

  useEffect(() => {
    loadTrustScore();
  }, [walletAddress]);

  const loadTrustScore = async () => {
    const data = await getUserTrustScore(walletAddress);
    setTrustScore(data);

    if (showAnimation) {
      Animated.spring(animatedScore, {
        toValue: data.baseScore,
        useNativeDriver: false,
        tension: 20,
        friction: 7,
      }).start();
    }
  };

  if (!trustScore) {
    return <Text style={styles.loading}>加载中...</Text>;
  }

  const getScoreColor = (score: number) => getTrustScoreColor(score);
  const getScoreLevel = (score: number) => getTrustScoreLevel(score);

  return (
    <View style={styles.container}>
      {/* 信誉分数 */}
      <View style={styles.scoreContainer}>
        <Text style={styles.label}>链上信誉分</Text>
        <Animated.Text 
          style={[
            styles.score, 
            { color: getScoreColor(trustScore.baseScore) }
          ]}
        >
          {Math.round(trustScore.baseScore)}
        </Animated.Text>
        <Text style={styles.level}>{getScoreLevel(trustScore.baseScore)}</Text>
      </View>

      {/* 进度条 */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${(trustScore.baseScore / 1000) * 100}%`,
              backgroundColor: getScoreColor(trustScore.baseScore)
            }
          ]} 
        />
      </View>

      {/* 统计信息 */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trustScore.totalInteractions}</Text>
          <Text style={styles.statLabel}>总互动</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trustScore.qualityRate}%</Text>
          <Text style={styles.statLabel}>好评率</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trustScore.learningStreak}天</Text>
          <Text style={styles.statLabel}>学习连胜</Text>
        </View>
      </View>

      {/* 链上验证标识 */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>⛓️ Solana 链上验证</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  level: {
    fontSize: 16,
    color: '#14F195',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  badge: {
    backgroundColor: '#9945FF20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: '#9945FF',
    fontWeight: '600',
  },
  loading: {
    color: '#666',
    textAlign: 'center',
  },
});

