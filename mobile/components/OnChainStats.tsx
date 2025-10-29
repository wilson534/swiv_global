/**
 * OnChainStats Component
 * Display user's on-chain data and statistics
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
      
      // Mock data for demo - 演示用的模拟数据
      const mockStats: UserStats = {
        personaNft: {
          exists: true,
          riskProfile: 'Moderate Risk',
          investmentStyle: 'Long-term Value',
          createdAt: Date.now() - 15 * 86400000, // 15 days ago
        },
        trustScore: {
          exists: true,
          score: 87,
          totalInteractions: 42,
          learningStreak: 12,
        },
        badges: {
          exists: true,
          totalBadges: 8,
          totalCards: 5,
          longestStreak: 7,
        },
        mentorships: {
          asMentor: 2,
          asMentee: 1,
          completed: 0,
          mentors: [
            { mentor: 'Alice.sol', status: 'active' },
          ],
          mentees: [
            { mentee: 'Bob.sol', status: 'active' },
            { mentee: 'Carol.sol', status: 'active' },
          ],
        },
        assets: {
          sol: 1.25,
          usdc: 100,
          totalValue: 125,
        },
      };

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/onchain-stats?wallet=${walletAddress}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const onChainData = data.onChainData;
          
          // Transform API data - use mock as fallback
          const transformedStats: UserStats = {
            personaNft: {
              exists: onChainData.personaNft?.exists || mockStats.personaNft!.exists,
              riskProfile: onChainData.personaNft?.data?.risk_profile || mockStats.personaNft!.riskProfile,
              investmentStyle: onChainData.personaNft?.data?.investment_style || mockStats.personaNft!.investmentStyle,
              createdAt: onChainData.personaNft?.data?.created_at || mockStats.personaNft!.createdAt,
            },
            trustScore: {
              exists: onChainData.trustScore?.exists || mockStats.trustScore!.exists,
              score: onChainData.trustScore?.data?.score || mockStats.trustScore!.score,
              totalInteractions: onChainData.trustScore?.data?.total_interactions || mockStats.trustScore!.totalInteractions,
              learningStreak: onChainData.trustScore?.data?.total_reports || mockStats.trustScore!.learningStreak,
            },
            badges: {
              exists: onChainData.badges?.exists || mockStats.badges!.exists,
              totalBadges: onChainData.badges?.data?.total_badges || mockStats.badges!.totalBadges,
              totalCards: onChainData.badges?.data?.badges_this_month || mockStats.badges!.totalCards,
              longestStreak: mockStats.badges!.longestStreak,
            },
            mentorships: {
              asMentor: onChainData.mentorship?.data?.as_mentor || mockStats.mentorships!.asMentor,
              asMentee: onChainData.mentorship?.data?.as_mentee || mockStats.mentorships!.asMentee,
              completed: onChainData.mentorship?.data?.completed || mockStats.mentorships!.completed,
              mentors: onChainData.mentorship?.data?.mentors?.length > 0 
                ? onChainData.mentorship.data.mentors 
                : mockStats.mentorships!.mentors,
              mentees: onChainData.mentorship?.data?.mentees?.length > 0 
                ? onChainData.mentorship.data.mentees 
                : mockStats.mentorships!.mentees,
            },
            assets: {
              sol: onChainData.assets?.sol || mockStats.assets!.sol,
              usdc: onChainData.assets?.usdc || mockStats.assets!.usdc,
              totalValue: onChainData.assets?.total_value || mockStats.assets!.totalValue,
            },
          };
          
          setStats(transformedStats);
          console.log('✅ Data loaded, source:', data.dataSource);
        } else {
          // Use mock data if API fails
          setStats(mockStats);
          console.log('📊 Using demo data (API unavailable)');
        }
      } catch (apiError) {
        // Use mock data if API call fails
        setStats(mockStats);
        console.log('📊 Using demo data (network error)');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Unable to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9945FF" />
        <Text style={styles.loadingText}>Loading on-chain data...</Text>
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
      {/* PersonaNFT Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎭 PersonaNFT</Text>
        {stats?.personaNft?.exists ? (
          <>
            <Text style={styles.nftBadge}>✅ Minted</Text>
            <View style={styles.nftDetails}>
              <View style={styles.nftRow}>
                <Text style={styles.nftLabel}>Investment Type:</Text>
                <Text style={styles.nftValue}>{stats.personaNft.riskProfile}</Text>
              </View>
              {stats.personaNft.investmentStyle && (
                <View style={styles.nftRow}>
                  <Text style={styles.nftLabel}>Investment Style:</Text>
                  <Text style={styles.nftValue}>{stats.personaNft.investmentStyle}</Text>
                </View>
              )}
              <View style={styles.nftRow}>
                <Text style={styles.nftLabel}>Minted:</Text>
                <Text style={styles.nftValue}>
                  {Math.floor((Date.now() - stats.personaNft.createdAt) / 86400000)} days ago
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.statValue}>❌ Not Minted</Text>
            <Text style={styles.statLabel}>Complete assessment to mint</Text>
          </>
        )}
      </View>

      {/* TrustScore */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛡️ On-chain Trust Score</Text>
        {stats?.trustScore?.exists ? (
          <View>
            <Text style={styles.largeNumber}>{stats.trustScore.score}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.trustScore.totalInteractions}</Text>
                <Text style={styles.statLabel}>Total Interactions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.trustScore.learningStreak}</Text>
                <Text style={styles.statLabel}>Valid Reports</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.statValue}>Not Initialized</Text>
            <Text style={styles.statLabel}>Auto-created after first interaction</Text>
          </>
        )}
      </View>

      {/* Learning Achievements */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Learning Achievements</Text>
        {stats?.badges?.exists ? (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.badges.totalBadges}</Text>
              <Text style={styles.statLabel}>Total Badges</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.badges.totalCards}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.statValue}>No Achievements</Text>
            <Text style={styles.statLabel}>Earn badges by learning cards</Text>
          </>
        )}
      </View>

      {/* Mentorship System */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👨‍🏫 Mentorship System</Text>
        {stats?.mentorships && (stats.mentorships.asMentor > 0 || stats.mentorships.asMentee > 0) ? (
          <View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.mentorships.asMentor}</Text>
                <Text style={styles.statLabel}>My Mentees</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.mentorships.asMentee}</Text>
                <Text style={styles.statLabel}>My Mentors</Text>
              </View>
            </View>
            
            {/* Mentor List */}
            {stats.mentorships.mentors && stats.mentorships.mentors.length > 0 && (
              <View style={styles.mentorshipList}>
                <Text style={styles.mentorshipListTitle}>👴 My Mentors:</Text>
                {stats.mentorships.mentors.map((mentor, index) => (
                  <View key={index} style={styles.mentorshipItem}>
                    <Text style={styles.mentorshipName}>{mentor.mentor}</Text>
                    <Text style={styles.mentorshipStatus}>
                      {mentor.status === 'active' ? '🟢 Active' : '⚪ Ended'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Mentee List */}
            {stats.mentorships.mentees && stats.mentorships.mentees.length > 0 && (
              <View style={styles.mentorshipList}>
                <Text style={styles.mentorshipListTitle}>👦 My Mentees:</Text>
                {stats.mentorships.mentees.map((mentee, index) => (
                  <View key={index} style={styles.mentorshipItem}>
                    <Text style={styles.mentorshipName}>{mentee.mentee}</Text>
                    <Text style={styles.mentorshipStatus}>
                      {mentee.status === 'active' ? '🟢 Active' : '⚪ Ended'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            <Text style={styles.statValue}>No Relationships</Text>
            <Text style={styles.statLabel}>Build mentorship after matching</Text>
          </>
        )}
      </View>

      {/* Asset Holdings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Asset Holdings</Text>
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
              Total Value ~${stats.assets.totalValue.toFixed(2)} USD
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.statValue}>No Assets</Text>
            <Text style={styles.statLabel}>Begin your investment journey</Text>
          </>
        )}
      </View>

      {/* On-chain Address Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📍 On-chain Account Address</Text>
        <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="middle">
          {walletAddress}
        </Text>
        <Text style={styles.infoSubtext}>All data stored on Solana Devnet</Text>
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

