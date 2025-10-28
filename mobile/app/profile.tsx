/**
 * Profile Page
 * 个人信誉页面
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TrustScoreDisplay } from '../components/TrustScoreDisplay';
import { OnChainStats } from '../components/OnChainStats';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilePage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletAddress();
  }, []);

  const loadWalletAddress = async () => {
    try {
      const address = await AsyncStorage.getItem('walletAddress');
      if (address) {
        setWalletAddress(address);
      }
    } catch (error) {
      console.error('加载钱包地址失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的信誉</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 钱包地址 */}
      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>钱包地址</Text>
        <Text style={styles.walletAddress}>
          {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
        </Text>
      </View>

      {/* 信誉分显示 */}
      <TrustScoreDisplay walletAddress={walletAddress} showAnimation={true} />

      {/* 🆕 链上数据统计 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⛓️ 链上数据概览</Text>
      </View>
      <OnChainStats walletAddress={walletAddress} />

      {/* 信誉分说明 */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 信誉分如何计算？</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>✅</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>匹配互动：</Text>
            每次成功匹配 +2-5 分
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>💬</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>聊天质量：</Text>
            高质量对话 +3-8 分
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>📚</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>学习活跃度：</Text>
            连续学习 7 天 +10 分
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>⚠️</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>举报惩罚：</Text>
            被举报 -25 分/次
          </Text>
        </View>
      </View>

      {/* 等级说明 */}
      <View style={styles.levelCard}>
        <Text style={styles.levelTitle}>🏆 信誉等级</Text>
        {[
          { level: '传奇', icon: '🏆', score: '900+', color: '#FFD700' },
          { level: '大师', icon: '💎', score: '800-899', color: '#00D084' },
          { level: '专家', icon: '⭐', score: '700-799', color: '#14F195' },
          { level: '进阶', icon: '📈', score: '600-699', color: '#9945FF' },
          { level: '新手', icon: '🌱', score: '400-599', color: '#FFA500' },
          { level: '观察中', icon: '👀', score: '<400', color: '#FF4444' },
        ].map((item, index) => (
          <View key={index} style={styles.levelItem}>
            <Text style={styles.levelIcon}>{item.icon}</Text>
            <Text style={styles.levelName}>{item.level}</Text>
            <Text style={[styles.levelScore, { color: item.color }]}>{item.score}</Text>
          </View>
        ))}
      </View>

      {/* Solana 链上验证 */}
      <View style={styles.blockchainCard}>
        <Text style={styles.blockchainTitle}>⛓️ 链上验证</Text>
        <Text style={styles.blockchainText}>
          你的信誉分存储在 Solana 区块链上，完全透明且不可篡改。
        </Text>
        <TouchableOpacity style={styles.viewOnChainButton}>
          <Text style={styles.viewOnChainText}>🔍 在 Solscan 上查看</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletCard: {
    backgroundColor: '#111',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  walletLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'monospace',
  },
  infoCard: {
    backgroundColor: '#111',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  levelCard: {
    backgroundColor: '#111',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  levelIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  levelName: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  levelScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  blockchainCard: {
    backgroundColor: '#9945FF20',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9945FF',
    marginBottom: 40,
  },
  blockchainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  blockchainText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewOnChainButton: {
    backgroundColor: '#9945FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewOnChainText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loading: {
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

