/**
 * 后台异步上链队列
 * 立即返回，后台处理
 */

import * as SolanaCLITx from './solana-cli-tx';

interface QueueTask {
  userWallet: string;
  interactionType: string;
  qualityScore: number;
  timestamp: number;
}

// 内存队列（生产环境可用 Redis）
const queue: QueueTask[] = [];
let isProcessing = false;

// 已完成的交易签名缓存
const signatureCache = new Map<string, string>();

/**
 * 添加上链任务到队列（立即返回）
 */
export function enqueueBlockchainTask(
  userWallet: string,
  interactionType: string,
  qualityScore: number
): string {
  const taskId = `${userWallet}_${Date.now()}`;
  
  queue.push({
    userWallet,
    interactionType,
    qualityScore,
    timestamp: Date.now(),
  });

  // 启动后台处理（如果还没在处理）
  if (!isProcessing) {
    processQueue();
  }

  return taskId;
}

/**
 * 后台处理队列
 */
async function processQueue() {
  if (isProcessing || queue.length === 0) {
    return;
  }

  isProcessing = true;

  while (queue.length > 0) {
    const task = queue.shift();
    if (!task) break;

    try {
      // 真正上链
      const signature = await SolanaCLITx.sendMemoViaCLI(
        task.userWallet,
        task.interactionType,
        task.qualityScore
      );

      if (signature) {
        // 缓存签名
        const taskId = `${task.userWallet}_${task.timestamp}`;
        signatureCache.set(taskId, signature);
        
        // 清理旧缓存（保留最近 100 个）
        if (signatureCache.size > 100) {
          const firstKey = signatureCache.keys().next().value;
          signatureCache.delete(firstKey);
        }
      }
    } catch (error) {
      console.error('❌ 后台上链失败:', error);
    }

    // 避免阻塞，每个任务之间稍微延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  isProcessing = false;
}

/**
 * 查询任务的真实签名（可选）
 */
export function getTaskSignature(taskId: string): string | null {
  return signatureCache.get(taskId) || null;
}

/**
 * 获取队列状态
 */
export function getQueueStatus() {
  return {
    queueLength: queue.length,
    isProcessing,
    cachedSignatures: signatureCache.size,
  };
}





