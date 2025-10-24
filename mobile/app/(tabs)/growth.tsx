/**
 * Growth Page
 * 成长页面 - 显示信誉分、徽章、成就
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GrowthPage() {
  // TODO: 从 API 获取用户数据
  const userData = {
    walletAddress: '7xKXtg2CW87d...',
    trustScore: 75,
    level: 5,
    totalPoints: 1250,
    stats: {
      cardsRead: 45,
      matches: 8,
      chats: 23,
      validReports: 2,
    },
  };

  const achievements = [
    { id: 1, emoji: '📚', name: '初级学习者', unlocked: true },
    { id: 2, emoji: '💞', name: '社交达人', unlocked: true },
    { id: 3, emoji: '🛡️', name: '守护者', unlocked: false },
    { id: 4, emoji: '🏆', name: '投资大师', unlocked: false },
  ];

  const handleResetPersona = async () => {
    Alert.alert(
      '重置测评',
      '确定要重置AI测评吗？这将清除你的人格数据。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('persona_completed');
              Alert.alert('成功', '请重启应用以重新开始测评');
            } catch (error) {
              Alert.alert('错误', '重置失败');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>成长</Text>
        <TouchableOpacity onPress={handleResetPersona}>
          <Text style={styles.headerIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 信誉分卡片 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>信誉分</Text>
          <View style={styles.trustScoreContainer}>
            <Text style={styles.trustScore}>{userData.trustScore}</Text>
            <Text style={styles.trustScoreMax}> / 100</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${userData.trustScore}%` }]} />
          </View>
          <Text style={styles.levelText}>等级 Level {userData.level}</Text>
        </View>

        {/* 统计数据 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>活动统计</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.stats.cardsRead}</Text>
              <Text style={styles.statLabel}>学习卡片</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.stats.matches}</Text>
              <Text style={styles.statLabel}>成功匹配</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.stats.chats}</Text>
              <Text style={styles.statLabel}>聊天互动</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.stats.validReports}</Text>
              <Text style={styles.statLabel}>有效举报</Text>
            </View>
          </View>
        </View>

        {/* 成就徽章 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>成就徽章 / Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map(achievement => (
              <View 
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  !achievement.unlocked && styles.achievementLocked
                ]}
              >
                <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 积分规则 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>积分规则 / Points Rules</Text>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>📖</Text>
              <Text style={styles.ruleText}>阅读学习卡片</Text>
              <Text style={styles.rulePoints}>+2</Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>💞</Text>
              <Text style={styles.ruleText}>成功匹配</Text>
              <Text style={styles.rulePoints}>+5</Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>💬</Text>
              <Text style={styles.ruleText}>聊天互动</Text>
              <Text style={styles.rulePoints}>+1</Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>🚨</Text>
              <Text style={styles.ruleText}>有效举报</Text>
              <Text style={styles.rulePoints}>+3</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#111',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  trustScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 16,
  },
  trustScore: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#14F195',
  },
  trustScoreMax: {
    fontSize: 24,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14F195',
  },
  levelText: {
    fontSize: 14,
    color: '#9945FF',
    textAlign: 'center',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.3,
  },
  achievementEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 8,
  },
  ruleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  rulePoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14F195',
  },
});

