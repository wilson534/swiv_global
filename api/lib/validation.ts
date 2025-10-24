/**
 * 输入验证工具
 * 使用 Zod 进行数据验证
 */

import { z } from 'zod';

/**
 * Solana 地址验证
 */
export const solanaAddressSchema = z.string().regex(
  /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  'Invalid Solana address'
);

/**
 * PersonaNFT 创建验证
 */
export const createPersonaSchema = z.object({
  walletAddress: solanaAddressSchema,
  answers: z.record(z.any()),
});

/**
 * Feed 请求验证
 */
export const feedRequestSchema = z.object({
  walletAddress: solanaAddressSchema,
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(50).default(10),
});

/**
 * Match 请求验证
 */
export const matchRequestSchema = z.object({
  walletAddress: solanaAddressSchema,
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Like 操作验证
 */
export const likeActionSchema = z.object({
  fromWallet: solanaAddressSchema,
  toWallet: solanaAddressSchema,
  action: z.enum(['like', 'pass']),
});

/**
 * AI 问答验证
 */
export const askAISchema = z.object({
  walletAddress: solanaAddressSchema,
  question: z.string().min(1).max(1000),
  context: z.string().max(5000).optional(),
});

/**
 * 风险类型验证
 */
export const riskTypeSchema = z.enum(['Conservative', 'Balanced', 'Aggressive']);

/**
 * 验证辅助函数
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}


