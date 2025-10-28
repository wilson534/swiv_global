/**
 * 使用 Solana CLI 发送交易
 * 绕过 Node.js fetch 的 RPC 连接问题
 */

import { exec } from 'child_process';
import * as path from 'path';

/**
 * 使用 CLI 发送 Memo 交易
 */
export async function sendMemoViaCLI(
  userWallet: string,
  interactionType: string,
  qualityScore: number
): Promise<string | null> {
  return new Promise((resolve) => {
    // 构造极简 Memo 数据（减少字符数）
    const ts = Math.floor(Date.now() / 1000);
    const memoData = `swiv:${userWallet.slice(0, 6)}:${interactionType}:${qualityScore}:${ts}`;

    // payer 钱包路径
    const payerPath = path.join(process.cwd(), 'api-payer.json');

    // 🚀 极简 CLI 命令（无 JSON 解析，直接提取签名）
    // 使用 grep 直接从输出提取签名，避免 JSON 解析开销
    const cmd = `solana transfer $(solana address -k "${payerPath}") 0 \
      --from "${payerPath}" \
      --url https://api.devnet.solana.com \
      --with-memo "${memoData}" \
      --skip-seed-phrase-validation \
      --allow-unfunded-recipient 2>&1`;

    exec(cmd, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 上链失败:', error.message);
        console.error('stderr:', stderr);
        resolve(null);
        return;
      }

      // 从输出中提取签名 (格式: "Signature: <signature>")
      const signatureMatch = stdout.match(/Signature:\s*([1-9A-HJ-NP-Za-km-z]{87,88})/);
      
      if (signatureMatch && signatureMatch[1]) {
        const signature = signatureMatch[1];
        console.log('✅ 上链成功:', signature.slice(0, 8) + '...');
        resolve(signature);
      } else {
        console.error('❌ 无法提取签名');
        console.error('输出:', stdout);
        resolve(null);
      }
    });
  });
}

/**
 * 检查 CLI 可用性
 */
export async function checkCLIAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('solana --version', { timeout: 5000 }, (error, stdout) => {
      if (error) {
        console.error('❌ Solana CLI 不可用');
        resolve(false);
      } else {
        console.log('✅ Solana CLI 可用:', stdout.trim());
        resolve(true);
      }
    });
  });
}

