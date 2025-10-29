/**
 * OpenAI 统一配置
 * 支持代理配置（解决国内访问问题）
 */

import OpenAI from 'openai';
import { ProxyAgent } from 'undici';

// 代理配置
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

// 如果配置了代理，创建 ProxyAgent 并设置为全局 dispatcher
if (PROXY_URL) {
  console.log('🔧 OpenAI 使用代理:', PROXY_URL);
  const proxyAgent = new ProxyAgent(PROXY_URL);
  // @ts-ignore - undici 全局配置
  globalThis[Symbol.for('undici.globalDispatcher.1')] = proxyAgent;
} else {
  console.log('ℹ️ OpenAI 直连（未配置代理）');
}

/**
 * 创建配置好的 OpenAI 客户端
 */
export function createOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000, // 30秒超时
    maxRetries: 2,
  });
}

/**
 * 默认导出的 OpenAI 客户端实例
 */
export const openai = createOpenAIClient();

/**
 * 推荐的模型
 */
export const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

console.log('✅ OpenAI 配置完成，模型:', MODEL);

