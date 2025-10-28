/**
 * 类型定义
 * 统一的数据类型定义
 */

/**
 * 风险类型
 */
export type RiskType = 'Conservative' | 'Balanced' | 'Aggressive';

/**
 * 用户人格
 */
export interface Persona {
  riskType: RiskType;
  keywords: string[];
  description: string;
  aiSummary: string;
  keywordsHash?: string;
  aiHash?: string;
}

/**
 * 用户资料
 */
export interface UserProfile {
  id: string;
  walletAddress: string;
  personaNftMint?: string;
  trustScore: number;
  createdAt: string;
  persona?: Persona;
}

/**
 * 学习卡片
 */
export interface FeedCard {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // 分钟
  imageUrl?: string;
}

/**
 * 匹配候选
 */
export interface MatchCandidate {
  id: string;
  walletAddress: string;
  persona: Persona;
  trustScore: number;
  matchScore: number;
}

/**
 * 匹配关系
 */
export interface Match {
  id: string;
  userA: string;
  userB: string;
  matchedAt: string;
  onChainTx?: string;
  isActive: boolean;
}

/**
 * 消息
 */
export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  flagged: boolean;
  createdAt: string;
}

/**
 * 滑动操作
 */
export interface SwipeAction {
  fromProfile: string;
  toProfile: string;
  action: 'like' | 'pass';
  createdAt: string;
}

/**
 * API 响应
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  offset: number;
  limit: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    offset: number;
    limit: number;
    total?: number;
    hasMore: boolean;
  };
}




