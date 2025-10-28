/**
 * Growth Page
 * 成长页面 - 显示信誉分、徽章、成就
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { OnChainStats } from '../../components/OnChainStats';

export default function GrowthPage() {
  const [walletAddress, setWalletAddress] = useState<string>('7xKXtg2CW87d97HnrbyShgg2pzgz6qXZDmJJdoMN6eE');

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
    }
  };

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
        {/* 链上数据 */}
        <OnChainStats walletAddress={walletAddress} />
      </ScrollView>
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
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingTop: 12,
  },
});

