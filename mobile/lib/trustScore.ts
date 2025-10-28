/**
 * Trust Score System
 * 信誉系统核心库
 */

import { Connection, PublicKey } from '@solana/web3.js';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const TRUST_SCORE_PROGRAM_ID = process.env.EXPO_PUBLIC_TRUST_SCORE_PROGRAM_ID;
const RPC_URL = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export interface TrustScoreData {
  baseScore: number;
  totalInteractions: number;
  positiveInteractions: number;
  learningStreak: number;
  qualityRate: number;
  reportsReceived: number;
  lastActive: number;
}

export type InteractionType = 'match' | 'chat' | 'helpful' | 'share';

/**
 * 获取用户信誉分
 */
export async function getUserTrustScore(walletAddress: string): Promise<TrustScoreData> {
  try {
    const response = await fetch(
      `${API_URL}/api/trust-score?wallet=${walletAddress}`
    );
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error('Failed to fetch trust score');
  } catch (error) {
    console.error('Get trust score error:', error);
    // 返回默认值
    return {
      baseScore: 100,
      totalInteractions: 0,
      positiveInteractions: 0,
      learningStreak: 0,
      qualityRate: 0,
      reportsReceived: 0,
      lastActive: Date.now(),
    };
  }
}

/**
 * 记录互动（匹配、聊天等）
 */
export async function recordInteraction(
  walletAddress: string,
  interactionType: InteractionType,
  qualityScore: number
): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/trust-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        interactionType,
        qualityScore,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 链上互动已记录:', interactionType, '质量分:', qualityScore);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Record interaction error:', error);
    return false;
  }
}

/**
 * 记录学习活动
 */
export async function recordLearningActivity(
  walletAddress: string,
  cardsViewed: number,
  engagementScore: number
): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/trust-score/learning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        cardsViewed,
        engagementScore,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 学习活动已记录:', cardsViewed, '张卡片，参与度:', engagementScore);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Record learning error:', error);
    return false;
  }
}

/**
 * 举报用户
 */
export async function reportUser(
  reporterWallet: string,
  reportedWallet: string,
  reason: string,
  evidence?: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/trust-score/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporterWallet,
        reportedWallet,
        reason,
        evidence,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Report user error:', error);
    return false;
  }
}

/**
 * 根据信誉分获取颜色
 */
export function getTrustScoreColor(score: number): string {
  if (score >= 800) return '#00D084';
  if (score >= 600) return '#14F195';
  if (score >= 400) return '#FFA500';
  return '#FF4444';
}

/**
 * 根据信誉分获取等级
 */
export function getTrustScoreLevel(score: number): string {
  if (score >= 900) return '传奇 🏆';
  if (score >= 800) return '大师 💎';
  if (score >= 700) return '专家 ⭐';
  if (score >= 600) return '进阶 📈';
  if (score >= 400) return '新手 🌱';
  return '观察中 👀';
}

