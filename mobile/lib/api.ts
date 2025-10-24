/**
 * API 客户端
 * 封装所有 API 请求
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * 基础请求函数
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

/**
 * 创建 PersonaNFT
 */
export async function createPersona(
  walletAddress: string,
  answers: Record<string, any>
) {
  return request('/api/persona', {
    method: 'POST',
    body: JSON.stringify({ walletAddress, answers }),
  });
}

/**
 * 获取 PersonaNFT
 */
export async function getPersona(walletAddress: string) {
  return request(`/api/persona?walletAddress=${walletAddress}`);
}

/**
 * 获取学习内容
 */
export async function getFeed(
  walletAddress: string,
  offset: number = 0,
  limit: number = 10
) {
  return request(`/api/feed?walletAddress=${walletAddress}&offset=${offset}&limit=${limit}`);
}

/**
 * 获取匹配候选
 */
export async function getMatchCandidates(
  walletAddress: string,
  limit: number = 20
) {
  return request(`/api/match?walletAddress=${walletAddress}&limit=${limit}`);
}

/**
 * 发送滑动操作
 */
export async function sendLikeAction(
  fromWallet: string,
  toWallet: string,
  action: 'like' | 'pass'
) {
  return request('/api/like', {
    method: 'POST',
    body: JSON.stringify({ fromWallet, toWallet, action }),
  });
}

/**
 * 向 AI 提问
 */
export async function askAI(
  walletAddress: string,
  question: string,
  context?: string
) {
  return request('/api/ask', {
    method: 'POST',
    body: JSON.stringify({ walletAddress, question, context }),
  });
}


