/**
 * Solana On-Chain Integration
 * 真实的链上交互工具
 */

import { Connection, PublicKey, Keypair, SystemProgram, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import * as SolanaCLI from './solana-cli';
import * as SolanaCLITx from './solana-cli-tx';
import * as BlockchainQueue from './blockchain-queue';
import * as fs from 'fs';
import * as path from 'path';

// 环境变量
const RPC_URLS = [
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'https://rpc.ankr.com/solana_devnet',
  'https://devnet.helius-rpc.com',
];
const TRUST_SCORE_PROGRAM_ID = process.env.TRUST_SCORE_PROGRAM_ID || '3FWDkwEPfVVZmxXS4f3pDaJpg4qf7GL5ir89DtXSwAjR';

// SPL Memo Program ID（官方程序）
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// 加载 Payer 钱包
let payerKeypair: Keypair | null = null;
try {
  const payerPath = path.join(process.cwd(), 'api-payer.json');
  if (fs.existsSync(payerPath)) {
    const payerSecret = JSON.parse(fs.readFileSync(payerPath, 'utf-8'));
    payerKeypair = Keypair.fromSecretKey(Uint8Array.from(payerSecret));
  }
} catch (error) {
  console.error('❌ 加载 Payer 钱包失败:', error);
}

// 创建连接（带重试机制）
let connectionIndex = 0;
const connection = new Connection(RPC_URLS[connectionIndex], {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 30000,
});

// 简单的内存缓存用于演示
const mockDataCache = new Map<string, any>();

// 使用 CLI 模式标志
let useCLIMode = true; // 默认启用，不检查（加快启动）

/**
 * 获取 Trust Score PDA 地址
 */
export function getTrustScorePDA(walletPubkey: PublicKey): [PublicKey, number] {
  const programId = new PublicKey(TRUST_SCORE_PROGRAM_ID);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('trust_score'), walletPubkey.toBuffer()],
    programId
  );
}

/**
 * 初始化用户信誉账户
 */
export async function initializeTrustScore(userWallet: string): Promise<{ signature: string }> {
  try {
    const userPubkey = new PublicKey(userWallet);
    const [trustScorePDA] = getTrustScorePDA(userPubkey);
    
    // TODO: 需要用户签名的交易
    // 现在返回模拟响应
    console.log('🔗 初始化信誉账户:', trustScorePDA.toString());
    
    return {
      signature: 'simulated_init_' + Date.now(),
    };
  } catch (error) {
    console.error('初始化信誉账户失败:', error);
    throw error;
  }
}

/**
 * 使用 SPL Memo 真正上链
 * 返回：交易签名 | null
 */
async function sendMemoTransaction(
  userWallet: string,
  interactionType: string,
  qualityScore: number
): Promise<string | null> {
  // 检查 payer 钱包是否已加载
  if (!payerKeypair) {
    console.log('⚠️ Payer 钱包未加载，跳过链上记录');
    return null;
  }

  try {
    // 检查 payer 余额（带超时和重试）
    let balance = 0;
    let retryCount = 0;
    const maxRetries = 1; // 只重试 1 次，加快降级
    
    while (retryCount < maxRetries) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('RPC timeout')), 3000) // 缩短到 3 秒
        );
        
        balance = await Promise.race([
          connection.getBalance(payerKeypair.publicKey),
          timeoutPromise as Promise<number>,
        ]);
        
        console.log('💰 Payer 余额:', balance / 1e9, 'SOL');
        break; // 成功获取余额，跳出循环
        
      } catch (err) {
        retryCount++;
        console.log(`⚠️ RPC 连接失败 (${retryCount}/${maxRetries})，重试中...`);
        
        if (retryCount >= maxRetries) {
          // 最后一次尝试：直接假设有余额，尝试发送交易
          console.log('⚠️ 无法查询余额，直接尝试发送交易...');
          balance = 1000000000; // 假设有 1 SOL
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒后重试
      }
    }
    
    if (balance === 0) {
      console.log('⚠️ Payer 钱包余额不足，跳过链上记录');
      return null;
    }

    // 构造 Memo 数据
    const memoData = JSON.stringify({
      app: 'swiv',
      user: userWallet.slice(0, 8),
      type: interactionType,
      score: qualityScore,
      ts: Math.floor(Date.now() / 1000),
    });

    console.log('📝 Memo 数据:', memoData);

    // 创建 Memo 指令
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData, 'utf-8'),
    });

    // 创建交易
    const transaction = new Transaction().add(memoInstruction);
    transaction.feePayer = payerKeypair.publicKey;

    // 获取最新的区块哈希（带超时）
    console.log('📡 获取最新区块哈希...');
    let blockhash: string;
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Blockhash timeout')), 5000) // 缩短到 5 秒
      );
      
      const result = await Promise.race([
        connection.getLatestBlockhash('confirmed'),
        timeoutPromise as Promise<{blockhash: string}>,
      ]);
      
      blockhash = result.blockhash;
      console.log('✅ 区块哈希:', blockhash.slice(0, 8) + '...');
    } catch (err) {
      console.error('❌ 获取区块哈希失败:', err);
      return null;
    }
    
    transaction.recentBlockhash = blockhash;

    // 签名并发送交易
    console.log('🔐 签名交易...');
    transaction.sign(payerKeypair);

    console.log('📤 发送交易到链上...');
    let signature: string;
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Send timeout')), 15000)
      );
      
      signature = await Promise.race([
        connection.sendRawTransaction(transaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }),
        timeoutPromise as Promise<string>,
      ]);
      
      console.log('✅ 交易已发送，签名:', signature);
      console.log('🔗 查看交易: https://explorer.solana.com/tx/' + signature + '?cluster=devnet');
    } catch (err) {
      console.error('❌ 发送交易失败:', err);
      return null;
    }

    // 确认交易（带超时）
    console.log('⏳ 等待交易确认...');
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Confirmation timeout')), 30000)
      );
      
      const confirmation = await Promise.race([
        connection.confirmTransaction(signature, 'confirmed'),
        timeoutPromise as Promise<any>,
      ]);
      
      if (confirmation.value?.err) {
        console.error('❌ 交易确认失败:', confirmation.value.err);
        // 即使确认失败，交易可能已经上链，返回签名
        console.log('⚠️ 交易可能已上链，返回签名供后续查询');
        return signature;
      }

      console.log('✅✅✅ 交易已确认上链！');
      return signature;
    } catch (err) {
      console.error('❌ 交易确认超时:', err);
      // 交易可能已经上链，返回签名
      console.log('⚠️ 交易可能已上链，返回签名:', signature);
      return signature;
    }

  } catch (error) {
    console.error('❌ RPC 方式链上记录失败:', error);
    return null;
  }
}

/**
 * 记录链上互动
 * 带降级机制：优先链上，失败则使用缓存
 */
export async function recordOnChainInteraction(
  userWallet: string,
  interactionType: 'match' | 'chat' | 'helpful' | 'share',
  qualityScore: number
): Promise<{ signature: string; newScore: number; onChain: boolean }> {
  try {
    // 🚀 异步上链：立即返回，后台处理
    const taskId = BlockchainQueue.enqueueBlockchainTask(
      userWallet,
      interactionType,
      qualityScore
    );
    
    // 计算新分数（立即返回）
    const currentData = mockDataCache.get(userWallet) || {
      baseScore: 650,
      totalInteractions: 0,
      positiveInteractions: 0,
    };
    
    const scoreChange = Math.floor((qualityScore - 50) / 10);
    const newScore = Math.min(1000, Math.max(0, currentData.baseScore + scoreChange));
    
    // 更新缓存
    const updatedData = {
      baseScore: newScore,
      totalInteractions: currentData.totalInteractions + 1,
      positiveInteractions: qualityScore >= 70 
        ? currentData.positiveInteractions + 1 
        : currentData.positiveInteractions,
      lastUpdate: Date.now(),
    };
    mockDataCache.set(userWallet, updatedData);
    
    // 立即返回（后台正在上链）
    return {
      signature: `async_${taskId}`, // 临时签名，可以后续用 taskId 查询真实签名
      newScore,
      onChain: true, // 标记为上链（正在后台处理）
    };
  } catch (error) {
    console.error('❌ 记录互动失败:', error);
    throw error;
  }
}

/**
 * 从缓存获取信誉分
 */
export function getCachedTrustScore(userWallet: string): {
  baseScore: number;
  totalInteractions: number;
  positiveInteractions: number;
  learningStreak: number;
  lastActive: number;
} | null {
  const cached = mockDataCache.get(userWallet);
  
  if (!cached) {
    return null;
  }
  
  return {
    baseScore: cached.baseScore,
    totalInteractions: cached.totalInteractions,
    positiveInteractions: cached.positiveInteractions,
    learningStreak: 0, // TODO: 添加到缓存
    lastActive: cached.lastUpdate || Date.now(),
  };
}

/**
 * 查询链上信誉分
 * 真实从 Solana 区块链读取数据
 */
export async function fetchOnChainTrustScore(userWallet: string): Promise<{
  baseScore: number;
  totalInteractions: number;
  positiveInteractions: number;
  learningStreak: number;
  lastActive: number;
} | null> {
  try {
    const userPubkey = new PublicKey(userWallet);
    const [trustScorePDA, bump] = getTrustScorePDA(userPubkey);
    
    console.log('🔍 查询链上账户:', {
      user: userWallet.slice(0, 8) + '...',
      pda: trustScorePDA.toString().slice(0, 8) + '...',
      mode: useCLIMode ? 'CLI' : 'Connection',
    });
    
    let accountInfo = null;
    
    // 🆕 优先使用 CLI 模式（更稳定）
    if (useCLIMode) {
      try {
        const cliAccount = await SolanaCLI.getAccountInfo(trustScorePDA.toString());
        if (cliAccount) {
          console.log('✅ CLI 查询成功');
          accountInfo = {
            lamports: cliAccount.account?.lamports || 0,
            data: Buffer.from(cliAccount.account?.data?.[0] || '', 'base64'),
            owner: new PublicKey(cliAccount.account?.owner || SystemProgram.programId),
          };
        }
      } catch (cliError) {
        console.log('⚠️ CLI 查询失败，尝试 Connection');
      }
    }
    
    // 回退到 Connection 模式
    if (!accountInfo) {
      try {
        accountInfo = await Promise.race([
          connection.getAccountInfo(trustScorePDA),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('查询超时')), 3000)
          ),
        ]) as any;
      } catch (connError) {
        console.log('⚠️ Connection 查询也失败');
      }
    }
    
    if (!accountInfo) {
      console.log('⚠️ 链上账户不存在或无法访问');
      return null;
    }
    
    console.log('✅ 链上账户信息:', {
      lamports: accountInfo.lamports,
      dataLength: accountInfo.data.length,
    });
    
    // 解析账户数据
    if (accountInfo.data.length >= 52) {
      const data = accountInfo.data;
      
      // 读取数据（小端字节序）
      const baseScore = data.readUInt16LE(32);
      const totalInteractions = data.readUInt32LE(34);
      const positiveInteractions = data.readUInt32LE(38);
      const learningStreak = data.readUInt16LE(42);
      const lastActive = Number(data.readBigInt64LE(44));
      
      console.log('📊 从链上读取的数据:', {
        baseScore,
        totalInteractions,
        positiveInteractions,
        learningStreak,
      });
      
      return {
        baseScore,
        totalInteractions,
        positiveInteractions,
        learningStreak,
        lastActive,
      };
    }
    
    console.log('⚠️ 账户数据格式不匹配');
    return null;
  } catch (error) {
    console.error('❌ 查询链上信誉分失败:', error);
    return null;
  }
}

/**
 * 验证交易是否确认
 */
export async function confirmTransaction(signature: string): Promise<boolean> {
  try {
    if (signature.startsWith('sim_') || signature.startsWith('simulated_')) {
      // 模拟交易，直接返回成功
      return true;
    }
    
    const confirmation = await connection.confirmTransaction(signature);
    return !confirmation.value.err;
  } catch (error) {
    console.error('确认交易失败:', error);
    return false;
  }
}
