/**
 * Asset Profile System
 * 资产展示系统（可选功能）
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const RPC_URL = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export interface AssetProfile {
  walletAddress: string;
  solBalance: number;
  usdcBalance: number;
  totalTokens: number;
  nftCount: number;
  totalValueUSD: number;
  assetLevel: 'whale' | 'dolphin' | 'fish' | 'shrimp';
  levelIcon: string;
  levelColor: string;
}

/**
 * 获取用户完整资产画像
 */
export async function getUserAssetProfile(walletAddress: string): Promise<AssetProfile> {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const publicKey = new PublicKey(walletAddress);

    // 1. 获取 SOL 余额
    const solBalance = await connection.getBalance(publicKey);
    const solAmount = solBalance / LAMPORTS_PER_SOL;

    // 2. 获取 SPL Token 账户
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    // 3. 统计 Token 数量和 NFT
    let totalTokens = 0;
    let nftCount = 0;
    let usdcBalance = 0;

    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Mainnet USDC

    for (const { account } of tokenAccounts.value) {
      const tokenAmount = account.data.parsed.info.tokenAmount;
      const mint = account.data.parsed.info.mint;
      
      if (tokenAmount.uiAmount > 0) {
        // 判断是否为 NFT（decimals = 0 且 amount = 1）
        if (tokenAmount.decimals === 0 && tokenAmount.uiAmount === 1) {
          nftCount++;
        } else {
          totalTokens++;
          
          // 如果是 USDC，记录余额
          if (mint === USDC_MINT) {
            usdcBalance = tokenAmount.uiAmount;
          }
        }
      }
    }

    // 4. 计算总价值（简化版，实际应该调用价格 API）
    const totalValueUSD = solAmount * 150 + usdcBalance; // 假设 SOL = $150

    // 5. 确定资产等级
    const { assetLevel, levelIcon, levelColor } = getAssetLevel(totalValueUSD);

    return {
      walletAddress,
      solBalance: solAmount,
      usdcBalance,
      totalTokens,
      nftCount,
      totalValueUSD,
      assetLevel,
      levelIcon,
      levelColor,
    };
  } catch (error) {
    console.error('获取资产失败:', error);
    return {
      walletAddress,
      solBalance: 0,
      usdcBalance: 0,
      totalTokens: 0,
      nftCount: 0,
      totalValueUSD: 0,
      assetLevel: 'shrimp',
      levelIcon: '🦐',
      levelColor: '#666',
    };
  }
}

/**
 * 根据总资产确定等级
 */
function getAssetLevel(totalValueUSD: number): {
  assetLevel: 'whale' | 'dolphin' | 'fish' | 'shrimp';
  levelIcon: string;
  levelColor: string;
} {
  if (totalValueUSD >= 100000) {
    return { assetLevel: 'whale', levelIcon: '🐋', levelColor: '#FFD700' };
  } else if (totalValueUSD >= 10000) {
    return { assetLevel: 'dolphin', levelIcon: '🐬', levelColor: '#00D084' };
  } else if (totalValueUSD >= 1000) {
    return { assetLevel: 'fish', levelIcon: '🐟', levelColor: '#14F195' };
  } else {
    return { assetLevel: 'shrimp', levelIcon: '🦐', levelColor: '#999' };
  }
}

/**
 * 格式化资产显示（简化版本）
 */
export function formatAssetValue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}

/**
 * 快速检查是否为鲸鱼用户
 */
export async function isWhaleUser(walletAddress: string): Promise<boolean> {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL >= 100;
  } catch {
    return false;
  }
}

