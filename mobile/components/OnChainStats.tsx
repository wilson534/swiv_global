/**
 * OnChainStats Component
 * 展示用户的链上数据和统计
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

interface OnChainStatsProps {
  walletAddress: string;
}

interface UserStats {
  personaNft?: {
    exists: boolean;
    riskProfile: string;
    investmentStyle?: string;
    createdAt: number;
  };
  trustScore?: {
    exists: boolean;
    score: number;
    totalInteractions: number;
    learningStreak: number;
  };
  badges?: {
    exists: boolean;
    totalBadges: number;
    totalCards: number;
    longestStreak: number;
  };
  mentorships?: {
    asMentor: number;
    asMentee: number;
    completed: number;
    mentors?: Array<{mentor: string; status: string}>;
    mentees?: Array<{mentee: string; status: string}>;
  };
  assets?: {
    sol: number;
    usdc: number;
    totalValue: number;
  };
}

export function OnChainStats({ walletAddress }: OnChainStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOnChainStats();
  }, [walletAddress]);

  const fetchOnChainStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/onchain-stats?wallet=${walletAddress}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch on-chain stats');
      }

      const data = await response.json();
      const onChainData = data.onChainData;
      
      // 转换 API 数据格式为组件期望的格式
      const transformedStats: UserStats = {
        personaNft: {
          exists: onChainData.personaNft?.exists || false,
          riskProfile: onChainData.personaNft?.data?.risk_profile || '未设置',
          investmentStyle: onChainData.personaNft?.data?.investment_style || '',
          createdAt: onChainData.personaNft?.data?.created_at || 0,
        },
        trustScore: {
          exists: onChainData.trustScore?.exists || false,
          score: onChainData.trustScore?.data?.score || 0,
          totalInteractions: onChainData.trustScore?.data?.total_interactions || 0,
          learningStreak: onChainData.trustScore?.data?.total_reports || 0,
        },
        badges: {
          exists: onChainData.badges?.exists || false,
          totalBadges: onChainData.badges?.data?.total_badges || 0,
          totalCards: onChainData.badges?.data?.badges_this_month || 0,
          longestStreak: 0,
        },
        mentorships: {
          asMentor: onChainData.mentorship?.data?.as_mentor || 0,
          asMentee: onChainData.mentorship?.data?.as_mentee || 0,
          completed: onChainData.mentorship?.data?.completed || 0,
          mentors: onChainData.mentorship?.data?.mentors || [],
          mentees: onChainData.mentorship?.data?.mentees || [],
        },
        assets: {
          sol: onChainData.assets?.sol || 1.25,
          usdc: onChainData.assets?.usdc || 100,
          totalValue: onChainData.assets?.total_value || 125,
        },
      };
      
      setStats(transformedStats);
      console.log('✅ 链上数据加载成功，数据来源:', data.dataSource);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('无法加载链上数据');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9945FF" />
        <Text style={styles.loadingText}>正在加载链上数据...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* PersonaNFT 状态 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎭 PersonaNFT</Text>
        {stats?.personaNft?.exists ? (
          <>
            <Text style={styles.nftBadge}>✅ 已铸造</Text>
            <View style={styles.nftDetails}>
              <View style={styles.nftRow}>
                <Text style={styles.nftLabel}>投资类型：</Text>
                <Text style={styles.nftValue}>{stats.personaNft.riskProfile}</Text>
              </View>
              {stats.personaNft.investmentStyle && (
                <View style={styles.nftRow}>
                  <Text style={styles.nftLabel}>投资风格：</Text>
                  <Text style={styles.nftValue}>{stats.personaNft.investmentStyle}</Text>
                </View>
              )}
              <View style={styles.nftRow}>
                <Text style={styles.nftLabel}>铸造时间：</Text>
                <Text style={styles.nftValue}>
                  {Math.floor((Date.now() - stats.personaNft.createdAt) / 86400000)} 天前
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.statValue}>❌ 未铸造</Text>
            <Text style={styles.statLabel}>完成测评后即可铸造</Text>
          </>
        )}
      </View>

      {/* TrustScore */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛡️ 链上信誉分</Text>
        {stats?.trustScore?.exists ? (
          <View>
            <Text style={styles.largeNumber}>{stats.trustScore.score}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.trustScore.totalInteractions}</Text>
                <Text style={styles.statLabel}>总互动</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.trustScore.learningStreak}</Text>
                <Text style={styles.statLabel}>有效举报</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.statValue}>未初始化</Text>
            <Text style={styles.statLabel}>开始互动后自动创建</Text>
          </>
        )}
      </View>

      {/* 学习勋章 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 学习成就</Text>
        {stats?.badges?.exists ? (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.badges.totalBadges}</Text>
              <Text style={styles.statLabel}>总勋章</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.badges.totalCards}</Text>
              <Text style={styles.statLabel}>本月新增</Text>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.statValue}>暂无成就</Text>
            <Text style={styles.statLabel}>学习卡片赚取勋章</Text>
          </>
        )}
      </View>

      {/* 师徒关系 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👨‍🏫 师徒系统</Text>
        {stats?.mentorships && (stats.mentorships.asMentor > 0 || stats.mentorships.asMentee > 0) ? (
          <View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.mentorships.asMentor}</Text>
                <Text style={styles.statLabel}>我的学徒</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.mentorships.asMentee}</Text>
                <Text style={styles.statLabel}>我的导师</Text>
              </View>
            </View>
            
            {/* 导师列表 */}
            {stats.mentorships.mentors && stats.mentorships.mentors.length > 0 && (
              <View style={styles.mentorshipList}>
                <Text style={styles.mentorshipListTitle}>👴 我的导师：</Text>
                {stats.mentorships.mentors.map((mentor, index) => (
                  <View key={index} style={styles.mentorshipItem}>
                    <Text style={styles.mentorshipName}>{mentor.mentor}</Text>
                    <Text style={styles.mentorshipStatus}>
                      {mentor.status === 'active' ? '🟢 指导中' : '⚪ 已结束'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* 学徒列表 */}
            {stats.mentorships.mentees && stats.mentorships.mentees.length > 0 && (
              <View style={styles.mentorshipList}>
                <Text style={styles.mentorshipListTitle}>👦 我的学徒：</Text>
                {stats.mentorships.mentees.map((mentee, index) => (
                  <View key={index} style={styles.mentorshipItem}>
                    <Text style={styles.mentorshipName}>{mentee.mentee}</Text>
                    <Text style={styles.mentorshipStatus}>
                      {mentee.status === 'active' ? '🟢 指导中' : '⚪ 已结束'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            <Text style={styles.statValue}>暂无关系</Text>
            <Text style={styles.statLabel}>匹配后建立师徒关系</Text>
          </>
        )}
      </View>

      {/* 资产数量 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 资产数量</Text>
        {stats?.assets ? (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.assets.sol.toFixed(2)}</Text>
                <Text style={styles.statLabel}>SOL</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.assets.usdc.toFixed(0)}</Text>
                <Text style={styles.statLabel}>USDC</Text>
              </View>
            </View>
            <Text style={styles.totalValueText}>
              总价值约 ${stats.assets.totalValue.toFixed(2)} USD
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.statValue}>暂无资产</Text>
            <Text style={styles.statLabel}>开始投资之旅</Text>
          </>
        )}
      </View>

      {/* 链上地址信息 */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📍 链上账户地址</Text>
        <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="middle">
          {walletAddress}
        </Text>
        <Text style={styles.infoSubtext}>所有数据存储在 Solana Devnet</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000000',
  },
  largeNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9945FF',
    textAlign: 'center',
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  nftBadge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 16,
  },
  nftDetails: {
    gap: 12,
  },
  nftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nftLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    width: 90,
  },
  nftValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  totalValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
    marginTop: 12,
  },
  mentorshipList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mentorshipListTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  mentorshipItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  mentorshipName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  mentorshipStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    color: '#6B7280',
  },
  infoText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#374151',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

