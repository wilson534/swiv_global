/**
 * Wallet Button Component
 * Solana 钱包连接按钮
 */

import { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';

interface WalletButtonProps {
  onConnect?: (publicKey: string) => void;
  onDisconnect?: () => void;
}

export function WalletButton({ onConnect, onDisconnect }: WalletButtonProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<string>('');

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // TODO: 实际的钱包连接逻辑
      // 使用 @solana-mobile/mobile-wallet-adapter-protocol
      
      // 模拟连接
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockPublicKey = '7xKXtg2CW87d97X7C5cLZCePTF6nxNFWbPL6qpVGKqYg';
      
      setPublicKey(mockPublicKey);
      setConnected(true);
      onConnect?.(mockPublicKey);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('钱包连接失败 / Wallet connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setPublicKey('');
    onDisconnect?.();
  };

  if (connected) {
    return (
      <View style={styles.connectedContainer}>
        <Text style={styles.addressText}>
          {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
        </Text>
        <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
          <Text style={styles.disconnectText}>断开</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, connecting && styles.buttonDisabled]}
      onPress={handleConnect}
      disabled={connecting}
    >
      {connecting ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>连接钱包</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14F195',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 12,
  },
  addressText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  disconnectButton: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  disconnectText: {
    color: '#14F195',
    fontSize: 12,
    fontWeight: '600',
  },
});




