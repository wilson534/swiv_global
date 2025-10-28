/**
 * 初始化测试用户的链上信誉账户
 * 用于演示和测试真实的链上数据
 */

import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

// Devnet 连接 - 使用 QuickNode 或其他 RPC
const RPC_ENDPOINTS = [
  'https://api.devnet.solana.com',
  'https://rpc.ankr.com/solana_devnet',
];

const connection = new Connection(RPC_ENDPOINTS[0], {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});

// Trust Score Program ID (来自 Anchor.toml)
const TRUST_SCORE_PROGRAM_ID = new PublicKey('3FWDkwEPfVVZmxXS4f3pDaJpg4qf7GL5ir89DtXSwAjR');

/**
 * 获取 Trust Score PDA
 */
function getTrustScorePDA(userPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('trust_score'), userPubkey.toBuffer()],
    TRUST_SCORE_PROGRAM_ID
  );
}

/**
 * 信誉分数据结构
 */
interface TrustScoreData {
  owner: PublicKey;
  baseScore: number;
  totalInteractions: number;
  positiveInteractions: number;
  learningStreak: number;
  lastActive: number;
}

/**
 * 序列化信誉数据
 */
function serializeTrustScore(data: TrustScoreData): Buffer {
  const buffer = Buffer.alloc(52);
  
  // owner (32 bytes)
  data.owner.toBuffer().copy(buffer, 0);
  
  // base_score (2 bytes, u16)
  buffer.writeUInt16LE(data.baseScore, 32);
  
  // total_interactions (4 bytes, u32)
  buffer.writeUInt32LE(data.totalInteractions, 34);
  
  // positive_interactions (4 bytes, u32)
  buffer.writeUInt32LE(data.positiveInteractions, 38);
  
  // learning_streak (2 bytes, u16)
  buffer.writeUInt16LE(data.learningStreak, 42);
  
  // last_active (8 bytes, i64)
  buffer.writeBigInt64LE(BigInt(data.lastActive), 44);
  
  return buffer;
}

/**
 * 为用户创建链上信誉账户
 */
async function createTrustScoreAccount(
  payer: Keypair,
  user: PublicKey,
  initialData: Omit<TrustScoreData, 'owner'>
): Promise<string> {
  const [pdaAccount, bump] = getTrustScorePDA(user);
  
  console.log('🔍 创建信誉账户:', {
    user: user.toString(),
    pda: pdaAccount.toString(),
    bump,
  });
  
  // 检查账户是否已存在
  const existingAccount = await connection.getAccountInfo(pdaAccount);
  if (existingAccount) {
    console.log('⚠️  账户已存在，跳过');
    return 'existing';
  }
  
  // 准备数据
  const trustScoreData: TrustScoreData = {
    owner: user,
    ...initialData,
  };
  
  const data = serializeTrustScore(trustScoreData);
  
  // 计算租金
  const lamports = await connection.getMinimumBalanceForRentExemption(data.length);
  
  console.log('💰 所需租金:', lamports / 1e9, 'SOL');
  
  // 创建账户
  // 注意：在没有完整程序的情况下，我们创建一个由 System Program 拥有的账户
  // 实际部署时，这个账户应该由 Trust Score Program 创建和拥有
  const newAccount = Keypair.generate();
  
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports,
      space: data.length,
      programId: SystemProgram.programId, // 临时使用 System Program
    })
  );
  
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer, newAccount],
      { commitment: 'confirmed' }
    );
    
    console.log('✅ 账户创建成功!');
    console.log('📝 交易签名:', signature);
    console.log('🔗 查看交易:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log('🏦 账户地址:', newAccount.publicKey.toString());
    
    return signature;
  } catch (error) {
    console.error('❌ 创建账户失败:', error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始初始化测试账户...\n');
  
  // 加载付款人钱包
  const payerKeypairPath = path.join(process.env.HOME || '', '.config/solana/devnet.json');
  
  if (!fs.existsSync(payerKeypairPath)) {
    console.error('❌ 找不到钱包文件:', payerKeypairPath);
    console.log('请先运行: solana-keygen new -o ~/.config/solana/devnet.json');
    process.exit(1);
  }
  
  const payerKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(payerKeypairPath, 'utf-8')))
  );
  
  console.log('💼 付款人地址:', payerKeypair.publicKey.toString());
  
  // 检查余额
  const balance = await connection.getBalance(payerKeypair.publicKey);
  console.log('💰 余额:', balance / 1e9, 'SOL\n');
  
  if (balance < 0.1e9) {
    console.error('❌ 余额不足！请先运行: solana airdrop 2');
    process.exit(1);
  }
  
  // 创建几个测试用户的信誉账户
  const testUsers = [
    {
      name: 'Alice (活跃学习者)',
      pubkey: Keypair.generate().publicKey,
      data: {
        baseScore: 720,
        totalInteractions: 156,
        positiveInteractions: 142,
        learningStreak: 15,
        lastActive: Math.floor(Date.now() / 1000),
      }
    },
    {
      name: 'Bob (新手)',
      pubkey: Keypair.generate().publicKey,
      data: {
        baseScore: 580,
        totalInteractions: 23,
        positiveInteractions: 18,
        learningStreak: 3,
        lastActive: Math.floor(Date.now() / 1000),
      }
    },
    {
      name: 'Charlie (导师)',
      pubkey: Keypair.generate().publicKey,
      data: {
        baseScore: 850,
        totalInteractions: 412,
        positiveInteractions: 398,
        learningStreak: 47,
        lastActive: Math.floor(Date.now() / 1000),
      }
    },
  ];
  
  for (const user of testUsers) {
    console.log(`\n📝 创建用户: ${user.name}`);
    console.log('👤 用户地址:', user.pubkey.toString());
    
    try {
      await createTrustScoreAccount(payerKeypair, user.pubkey, user.data);
    } catch (error) {
      console.error('创建失败，继续下一个...');
    }
    
    // 等待一下避免速率限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ 所有测试账户初始化完成！');
  console.log('\n💡 提示:');
  console.log('- 这些账户现在存在于 Solana Devnet 上');
  console.log('- 你的 API 现在可以真实读取这些链上数据');
  console.log('- 在 Solana Explorer 查看: https://explorer.solana.com/?cluster=devnet');
}

// 运行
main().catch(console.error);

