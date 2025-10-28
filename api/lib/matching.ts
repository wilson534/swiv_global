/**
 * 匹配算法
 * 实现基于关键词、风险类型和信誉分的混合匹配
 */

import { Persona } from './supabase';

/**
 * 计算两个用户的匹配分数
 * score = 0.5 * keywordSimilarity + 0.3 * riskMatch + 0.2 * trustScoreNorm
 */
export function calculateMatchScore(
  userA: {
    persona: Persona;
    trustScore: number;
  },
  userB: {
    persona: Persona;
    trustScore: number;
  }
): number {
  // 1. 关键词相似度 (50% 权重)
  const keywordSimilarity = calculateKeywordSimilarity(
    userA.persona.keywords,
    userB.persona.keywords
  );

  // 2. 风险类型匹配 (30% 权重)
  const riskMatch = calculateRiskMatch(
    userA.persona.risk_type,
    userB.persona.risk_type
  );

  // 3. 信誉分归一化 (20% 权重)
  const trustScoreNorm = normalizeTrustScores(
    userA.trustScore,
    userB.trustScore
  );

  // 加权计算最终分数
  const score = 0.5 * keywordSimilarity + 0.3 * riskMatch + 0.2 * trustScoreNorm;

  return Math.round(score * 100); // 返回 0-100 的分数
}

/**
 * 计算关键词相似度（Jaccard 相似度）
 */
function calculateKeywordSimilarity(
  keywordsA: string[],
  keywordsB: string[]
): number {
  const setA = new Set(keywordsA.map(k => k.toLowerCase()));
  const setB = new Set(keywordsB.map(k => k.toLowerCase()));

  const intersection = new Set([...setA].filter(k => setB.has(k)));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0;

  return intersection.size / union.size;
}

/**
 * 计算风险类型匹配度
 */
function calculateRiskMatch(
  riskA: 'Conservative' | 'Balanced' | 'Aggressive',
  riskB: 'Conservative' | 'Balanced' | 'Aggressive'
): number {
  // 相同风险类型：完全匹配
  if (riskA === riskB) return 1.0;

  // 相邻风险类型：部分匹配
  const riskLevels = ['Conservative', 'Balanced', 'Aggressive'];
  const indexA = riskLevels.indexOf(riskA);
  const indexB = riskLevels.indexOf(riskB);
  const distance = Math.abs(indexA - indexB);

  if (distance === 1) return 0.5; // 相邻
  return 0.2; // 相差两级
}

/**
 * 信誉分归一化
 * 两个用户的信誉分越接近且越高，匹配度越高
 */
function normalizeTrustScores(scoreA: number, scoreB: number): number {
  // 信誉分差异惩罚
  const difference = Math.abs(scoreA - scoreB);
  const diffPenalty = 1 - (difference / 100);

  // 平均信誉分奖励（鼓励高信誉用户匹配）
  const avgScore = (scoreA + scoreB) / 2;
  const avgBonus = avgScore / 100;

  return (diffPenalty * 0.6 + avgBonus * 0.4);
}

/**
 * 获取推荐候选列表
 */
export function rankCandidates(
  currentUser: {
    persona: Persona;
    trustScore: number;
  },
  candidates: Array<{
    id: string;
    persona: Persona;
    trustScore: number;
  }>
): Array<{
  id: string;
  persona: Persona;
  trustScore: number;
  matchScore: number;
}> {
  return candidates
    .map(candidate => ({
      ...candidate,
      matchScore: calculateMatchScore(currentUser, candidate),
    }))
    .sort((a, b) => b.matchScore - a.matchScore); // 降序排列
}

/**
 * 过滤低质量候选
 */
export function filterCandidates(
  candidates: Array<any>,
  minMatchScore: number = 30,
  minTrustScore: number = 20
): Array<any> {
  return candidates.filter(
    c => c.matchScore >= minMatchScore && c.trustScore >= minTrustScore
  );
}




