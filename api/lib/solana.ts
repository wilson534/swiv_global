/**
 * Solana 工具库
 * 处理 Solana 连接和程序交互
 */

import { Connection, PublicKey, Commitment } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

// Solana 网络配置
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const COMMITMENT: Commitment = 'confirmed';

/**
 * 获取 Solana 连接
 */
export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, COMMITMENT);
}

/**
 * 程序 ID（部署后需要更新）
 */
export const PROGRAM_IDS = {
  personaNft: process.env.PERSONA_NFT_PROGRAM_ID 
    ? new PublicKey(process.env.PERSONA_NFT_PROGRAM_ID)
    : null,
  trustScore: process.env.TRUST_SCORE_PROGRAM_ID
    ? new PublicKey(process.env.TRUST_SCORE_PROGRAM_ID)
    : null,
  socialGraph: process.env.SOCIAL_GRAPH_PROGRAM_ID
    ? new PublicKey(process.env.SOCIAL_GRAPH_PROGRAM_ID)
    : null,
};

/**
 * 验证 Solana 地址
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * 查询 PersonaNFT
 */
export async function fetchPersonaNFT(walletAddress: string) {
  const connection = getConnection();
  const walletPubkey = new PublicKey(walletAddress);
  
  // TODO: 实现 PDA 查询
  // TODO: 解析账户数据
  
  return null;
}

/**
 * 查询 TrustScore
 */
export async function fetchTrustScore(walletAddress: string): Promise<number> {
  const connection = getConnection();
  const walletPubkey = new PublicKey(walletAddress);
  
  // TODO: 实现 TrustScore 查询
  
  return 50; // 默认分数
}

/**
 * 查询匹配关系
 */
export async function fetchMatches(walletAddress: string) {
  const connection = getConnection();
  const walletPubkey = new PublicKey(walletAddress);
  
  // TODO: 从 SocialGraph 程序查询匹配关系
  
  return [];
}


