/**
 * Login Page
 * 登录页 - 钱包连接
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginPage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setConnecting(true);
    
    try {
      // TODO: 集成 Solana Mobile Wallet Adapter
      // TODO: 连接钱包（Phantom, Solflare, etc.）
      // TODO: 验证钱包地址
      // TODO: 检查是否有 PersonaNFT
      
      // 临时：模拟连接成功
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: 如果没有 PersonaNFT，跳转到 persona/index
      // TODO: 如果有 PersonaNFT，跳转到 (tabs)/feed
      
      router.replace('/persona');
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('钱包连接失败 / Wallet connection failed');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🧭</Text>
          <Text style={styles.title}>Swiv</Text>
          <Text style={styles.subtitle}>Learn like TikTok, Match like Tinder</Text>
          <Text style={styles.subtitle}>— but on Solana</Text>
        </View>

        {/* 说明 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            AI 驱动的社交投资学习平台
          </Text>
          <Text style={styles.description}>
            AI-Powered Social Investing Platform
          </Text>
        </View>

        {/* 连接按钮 */}
        <TouchableOpacity
          style={[styles.button, connecting && styles.buttonDisabled]}
          onPress={handleConnectWallet}
          disabled={connecting}
        >
          <Text style={styles.buttonText}>
            {connecting ? '连接中... / Connecting...' : '连接钱包 / Connect Wallet'}
          </Text>
        </TouchableOpacity>

        {/* 支持的钱包 */}
        <View style={styles.walletsContainer}>
          <Text style={styles.walletsText}>支持 Phantom、Solflare、Backpack</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  descriptionContainer: {
    marginBottom: 40,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 4,
  },
  button: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 280,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  walletsContainer: {
    marginTop: 20,
  },
  walletsText: {
    fontSize: 12,
    color: '#666',
  },
});


