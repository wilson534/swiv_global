/**
 * 通用工具函数
 */

import crypto from 'crypto';

/**
 * 计算字符串的 SHA256 哈希
 */
export function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 计算数组的 SHA256 哈希
 */
export function hashArray(arr: string[]): Buffer {
  const combined = arr.sort().join('|');
  return crypto.createHash('sha256').update(combined).digest();
}

/**
 * 生成随机 ID
 */
export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number | string): string {
  const date = new Date(timestamp);
  return date.toISOString();
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 缩短文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * 计算两个数组的交集
 */
export function arrayIntersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter(item => set2.has(item));
}

/**
 * 计算两个数组的并集
 */
export function arrayUnion<T>(arr1: T[], arr2: T[]): T[] {
  return Array.from(new Set([...arr1, ...arr2]));
}

/**
 * 休眠并重试
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await delay(baseDelay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError!;
}




