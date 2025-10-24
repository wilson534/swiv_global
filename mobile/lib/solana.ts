/**
 * Solana 客户端工具库
 * 处理移动端的 Solana 连接和交易
 */

import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';

// 从环境变量获取配置
const SOLANA_RPC_URL = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet');
const SOLANA_NETWORK = process.env.EXPO_PUBLIC_SOLANA_NETWORK || 'devnet';

/**
 * 获取 Solana 连接
 */
export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

/**
 * 程序 ID
 */
export const PROGRAM_IDS = {
  personaNft: process.env.EXPO_PUBLIC_PERSONA_NFT_PROGRAM_ID
    ? new PublicKey(process.env.EXPO_PUBLIC_PERSONA_NFT_PROGRAM_ID)
    : null,
  trustScore: process.env.EXPO_PUBLIC_TRUST_SCORE_PROGRAM_ID
    ? new PublicKey(process.env.EXPO_PUBLIC_TRUST_SCORE_PROGRAM_ID)
    : null,
  socialGraph: process.env.EXPO_PUBLIC_SOCIAL_GRAPH_PROGRAM_ID
    ? new PublicKey(process.env.EXPO_PUBLIC_SOCIAL_GRAPH_PROGRAM_ID)
    : null,
};

/**
 * 获取钱包余额
 */
export async function getBalance(publicKey: string): Promise<number> {
  const connection = getConnection();
  const pubkey = new PublicKey(publicKey);
  const balance = await connection.getBalance(pubkey);
  return balance / 1e9; // 转换为 SOL
}

/**
 * 查询 PersonaNFT PDA
 */
export function getPersonaNftPDA(walletPublicKey: PublicKey): [PublicKey, number] {
  if (!PROGRAM_IDS.personaNft) {
    throw new Error('PersonaNFT Program ID not configured');
  }

  return PublicKey.findProgramAddressSync(
    [Buffer.from('persona_nft'), walletPublicKey.toBuffer()],
    PROGRAM_IDS.personaNft
  );
}

/**
 * 查询 TrustScore PDA
 */
export function getTrustScorePDA(walletPublicKey: PublicKey): [PublicKey, number] {
  if (!PROGRAM_IDS.trustScore) {
    throw new Error('TrustScore Program ID not configured');
  }

  return PublicKey.findProgramAddressSync(
    [Buffer.from('trust_score'), walletPublicKey.toBuffer()],
    PROGRAM_IDS.trustScore
  );
}

/**
 * 查询 MatchEdge PDA
 */
export function getMatchEdgePDA(userA: PublicKey, userB: PublicKey): [PublicKey, number] {
  if (!PROGRAM_IDS.socialGraph) {
    throw new Error('SocialGraph Program ID not configured');
  }

  // 按字典序排列
  const [minKey, maxKey] = [userA, userB].sort((a, b) =>
    a.toBuffer().compare(b.toBuffer())
  );

  return PublicKey.findProgramAddressSync(
    [Buffer.from('match_edge'), minKey.toBuffer(), maxKey.toBuffer()],
    PROGRAM_IDS.socialGraph
  );
}

/**
 * 验证 Solana 地址
 */
export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * 缩短地址显示
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}


