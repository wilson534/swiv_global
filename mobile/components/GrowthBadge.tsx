/**
 * Growth Badge Component
 * Growth badge component (Learning level system)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GrowthProfile } from '../lib/levels';

interface Props {
  profile: GrowthProfile;
  compact?: boolean;
}

export function GrowthBadge({ profile, compact = false }: Props) {
  if (compact) {
    // Compact mode: For Match cards
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.levelIcon}>{profile.levelIcon}</Text>
        <Text style={styles.levelText}>Lv.{profile.level}</Text>
        {profile.showAssets && profile.assetIcon && (
          <>
            <View style={styles.divider} />
            <Text style={styles.assetIcon}>{profile.assetIcon}</Text>
          </>
        )}
      </View>
    );
  }

  // Full mode
  return (
    <View style={styles.fullContainer}>
      {/* Level and title */}
      <View style={styles.header}>
        <Text style={styles.levelIconLarge}>{profile.levelIcon}</Text>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{profile.levelTitle}</Text>
          <Text style={styles.levelNumber}>Level {profile.level}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${profile.nextLevelProgress}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(profile.nextLevelProgress)}% to next level
        </Text>
      </View>

      {/* Statistics */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>📚</Text>
          <Text style={styles.statValue}>{profile.cardsLearned}</Text>
          <Text style={styles.statLabel}>Learned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💡</Text>
          <Text style={styles.statValue}>{profile.questionsAsked}</Text>
          <Text style={styles.statLabel}>Asked</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🤝</Text>
          <Text style={styles.statValue}>{profile.helpfulAnswers}</Text>
          <Text style={styles.statLabel}>Helped</Text>
        </View>
      </View>

      {/* Optional: Asset badge (only when user enables) */}
      {profile.showAssets && profile.assetIcon && (
        <View style={styles.assetBadge}>
          <Text style={styles.assetBadgeIcon}>{profile.assetIcon}</Text>
          <Text style={styles.assetBadgeText}>On-chain Assets Verified</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelIcon: {
    fontSize: 16,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#14F195',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  assetIcon: {
    fontSize: 16,
  },
  fullContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  levelIconLarge: {
    fontSize: 48,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  levelNumber: {
    fontSize: 14,
    color: '#14F195',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14F195',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  assetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9945FF20',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  assetBadgeIcon: {
    fontSize: 16,
  },
  assetBadgeText: {
    fontSize: 12,
    color: '#9945FF',
    fontWeight: '600',
  },
});

