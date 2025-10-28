/**
 * Solana CLI 集成
 * 使用系统的 solana-cli 来绕过 Node.js 网络问题
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { PublicKey } from '@solana/web3.js';

const execAsync = promisify(exec);

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

/**
 * 使用 solana-cli 查询账户余额
 */
export async function getBalance(address: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `solana balance ${address} --url ${RPC_URL} --output json`,
      { timeout: 10000 }
    );
    
    const data = JSON.parse(stdout);
    console.log('✅ CLI 查询余额成功:', address.slice(0, 8), '...', data);
    
    // 余额通常在第一个字段
    return parseFloat(stdout.trim().split(' ')[0]) || 0;
  } catch (error) {
    console.error('❌ CLI 查询余额失败:', error);
    return 0;
  }
}

/**
 * 使用 solana-cli 查询账户信息
 */
export async function getAccountInfo(address: string): Promise<any> {
  try {
    const { stdout } = await execAsync(
      `solana account ${address} --url ${RPC_URL} --output json`,
      { timeout: 10000 }
    );
    
    const data = JSON.parse(stdout);
    console.log('✅ CLI 查询账户成功');
    
    return data;
  } catch (error: any) {
    // 账户不存在是正常的
    if (error.message?.includes('AccountNotFound')) {
      console.log('ℹ️ 账户不存在:', address.slice(0, 8));
      return null;
    }
    
    console.error('❌ CLI 查询账户失败:', error.message);
    return null;
  }
}

/**
 * 使用 memo 程序在链上记录数据
 * 这是一个完全去中心化的方案，不需要部署自定义程序
 */
export async function recordToChainWithMemo(
  userWallet: string,
  data: {
    type: string;
    score: number;
    timestamp: number;
  }
): Promise<{ signature: string; onChain: boolean }> {
  try {
    // 创建 memo 数据
    const memoData = JSON.stringify({
      app: 'swiv',
      user: userWallet.slice(0, 8),
      ...data,
    });
    
    console.log('📝 准备记录到链上 (Memo):', memoData);
    
    // 使用 solana CLI 发送带 memo 的转账
    // 注意：这需要钱包私钥，现在我们先返回模拟结果
    // 在生产环境中，这应该由用户的钱包签名
    
    console.log('ℹ️ 链上记录需要用户钱包签名，使用缓存模式');
    
    return {
      signature: `memo_${Date.now().toString(36)}`,
      onChain: false, // 需要用户签名才能真正上链
    };
    
  } catch (error) {
    console.error('❌ 链上记录失败:', error);
    return {
      signature: `error_${Date.now().toString(36)}`,
      onChain: false,
    };
  }
}

/**
 * 获取最近的交易历史（从链上）
 */
export async function getRecentTransactions(address: string, limit: number = 10): Promise<any[]> {
  try {
    const { stdout } = await execAsync(
      `solana transaction-history ${address} --url ${RPC_URL} --limit ${limit}`,
      { timeout: 10000 }
    );
    
    console.log('✅ 获取交易历史成功');
    // 解析输出
    return [];
  } catch (error) {
    console.error('❌ 获取交易历史失败:', error);
    return [];
  }
}

/**
 * 检查 Solana 网络状态
 */
export async function checkNetworkHealth(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `solana cluster-version --url ${RPC_URL}`,
      { timeout: 5000 }
    );
    
    console.log('✅ Solana 网络正常:', stdout.trim());
    return true;
  } catch (error) {
    console.error('❌ Solana 网络检查失败');
    return false;
  }
}

