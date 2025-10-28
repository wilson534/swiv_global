/**
 * Asset Settings Page
 * 资产设置页面
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AssetBadge } from '../components/AssetBadge';

export default function AssetSettingsPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  // 隐私设置
  const [showAssets, setShowAssets] = useState(true);
  const [showSolBalance, setShowSolBalance] = useState(true);
  const [showTokenHoldings, setShowTokenHoldings] = useState(true);
  const [showNftCount, setShowNftCount] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const address = await AsyncStorage.getItem('walletAddress');
      if (address) {
        setWalletAddress(address);
      }
      
      // 加载用户设置
      const settings = await AsyncStorage.getItem('assetDisplaySettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setShowAssets(parsed.showAssets ?? true);
        setShowSolBalance(parsed.showSolBalance ?? true);
        setShowTokenHoldings(parsed.showTokenHoldings ?? true);
        setShowNftCount(parsed.showNftCount ?? true);
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        showAssets,
        showSolBalance,
        showTokenHoldings,
        showNftCount,
      };
      
      await AsyncStorage.setItem('assetDisplaySettings', JSON.stringify(settings));
      
      // TODO: 同步到链上 PersonaNFT
      
      Alert.alert('成功', '设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      Alert.alert('错误', '保存失败');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>资产展示设置</Text>
        <TouchableOpacity onPress={saveSettings}>
          <Text style={styles.saveButton}>保存</Text>
        </TouchableOpacity>
      </View>

      {/* 资产预览 */}
      {walletAddress && (
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>预览效果</Text>
          <AssetBadge walletAddress={walletAddress} showDetails={true} />
        </View>
      )}

      {/* 隐私设置 */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>隐私设置</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>💰 展示资产信息</Text>
            <Text style={styles.settingDesc}>
              在匹配卡片中展示你的链上资产
            </Text>
          </View>
          <Switch
            value={showAssets}
            onValueChange={setShowAssets}
            trackColor={{ false: '#333', true: '#9945FF' }}
            thumbColor={showAssets ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, !showAssets && styles.disabled]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>◎ 展示 SOL 余额</Text>
            <Text style={styles.settingDesc}>
              显示你的 SOL 持仓数量
            </Text>
          </View>
          <Switch
            value={showSolBalance}
            onValueChange={setShowSolBalance}
            disabled={!showAssets}
            trackColor={{ false: '#333', true: '#9945FF' }}
            thumbColor={showSolBalance ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, !showAssets && styles.disabled]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🪙 展示 Token 持仓</Text>
            <Text style={styles.settingDesc}>
              显示你持有的 Token 种类
            </Text>
          </View>
          <Switch
            value={showTokenHoldings}
            onValueChange={setShowTokenHoldings}
            disabled={!showAssets}
            trackColor={{ false: '#333', true: '#9945FF' }}
            thumbColor={showTokenHoldings ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, !showAssets && styles.disabled]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🖼️ 展示 NFT 数量</Text>
            <Text style={styles.settingDesc}>
              显示你拥有的 NFT 数量
            </Text>
          </View>
          <Switch
            value={showNftCount}
            onValueChange={setShowNftCount}
            disabled={!showAssets}
            trackColor={{ false: '#333', true: '#9945FF' }}
            thumbColor={showNftCount ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* 说明 */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 关于资产展示</Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>数据来源：</Text>
          所有资产数据直接从 Solana 区块链读取，无法伪造
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>隐私保护：</Text>
          你可以随时关闭资产展示，只有在你开启后其他用户才能看到
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>匹配优势：</Text>
          展示资产的高净值用户会获得更高的匹配优先级
        </Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>资产等级：</Text>
          🐋 鲸鱼($100K+) | 🐬 海豚($10K+) | 🐟 鱼($1K+) | 🦐 虾(&lt;$1K)
        </Text>
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
  saveButton: {
    fontSize: 16,
    color: '#9945FF',
    fontWeight: 'bold',
  },
  previewSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  settingsSection: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  disabled: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#111',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 8,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

