/**
 * Asset Badge Component
 * 资产徽章组件（可选展示）
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getUserAssetProfile, formatAssetValue, AssetProfile } from '../lib/assets';

interface Props {
  walletAddress: string;
  compact?: boolean;
  showDetails?: boolean;
}

export function AssetBadge({ walletAddress, compact = false, showDetails = false }: Props) {
  const [assets, setAssets] = useState<AssetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [walletAddress]);

  const loadAssets = async () => {
    setLoading(true);
    const data = await getUserAssetProfile(walletAddress);
    setAssets(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compact]}>
        <ActivityIndicator size="small" color="#FFD700" />
      </View>
    );
  }

  if (!assets) return null;

  // 紧凑模式（用于 Match 卡片）
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.levelIcon}>{assets.levelIcon}</Text>
        <Text style={[styles.levelText, { color: assets.levelColor }]}>
          {formatAssetValue(assets.totalValueUSD)}
        </Text>
      </View>
    );
  }

  // 完整模式
  return (
    <TouchableOpacity
      style={styles.fullContainer}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      {/* 顶部：等级和总资产 */}
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelIconLarge}>{assets.levelIcon}</Text>
          <Text style={[styles.levelName, { color: assets.levelColor }]}>
            {assets.assetLevel.toUpperCase()}
          </Text>
        </View>
        <View style={styles.totalValue}>
          <Text style={styles.totalValueLabel}>总资产</Text>
          <Text style={styles.totalValueAmount}>
            {formatAssetValue(assets.totalValueUSD)}
          </Text>
        </View>
      </View>

      {/* 详细信息（可展开） */}
      {(expanded || showDetails) && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>◎</Text>
            <Text style={styles.detailLabel}>SOL</Text>
            <Text style={styles.detailValue}>{assets.solBalance.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>💵</Text>
            <Text style={styles.detailLabel}>USDC</Text>
            <Text style={styles.detailValue}>{assets.usdcBalance.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🪙</Text>
            <Text style={styles.detailLabel}>Token 种类</Text>
            <Text style={styles.detailValue}>{assets.totalTokens}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🖼️</Text>
            <Text style={styles.detailLabel}>NFT 数量</Text>
            <Text style={styles.detailValue}>{assets.nftCount}</Text>
          </View>
        </View>
      )}

      {/* 链上验证标识 */}
      <View style={styles.verifiedBadge}>
        <Text style={styles.verifiedText}>⛓️ 链上验证</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  compact: {
    padding: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  levelIcon: {
    fontSize: 16,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  fullContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelIconLarge: {
    fontSize: 32,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    alignItems: 'flex-end',
  },
  totalValueLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  totalValueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  detailIcon: {
    fontSize: 20,
    width: 32,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedBadge: {
    marginTop: 12,
    backgroundColor: '#9945FF20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  verifiedText: {
    fontSize: 11,
    color: '#9945FF',
    fontWeight: '600',
  },
});

