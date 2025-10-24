/**
 * Ask API Route
 * AI 助手问答接口
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ask
 * 向 AI 助手提问
 * 
 * Body:
 * {
 *   walletAddress: string,
 *   question: string,
 *   context?: string,  // 可选的上下文（如当前浏览的内容）
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, question, context } = body;

    if (!walletAddress || !question) {
      return NextResponse.json(
        { error: '缺少必要参数 / Missing required parameters' },
        { status: 400 }
      );
    }

    // 构建系统提示词
    const systemPrompt = `你是 Swiv 的 AI 投资学习助手 🤖

职责：
1. 用简单易懂的中文解释投资和加密货币概念
2. 提供实用的建议和风险提示
3. 回答简洁、准确、友好
4. 如果涉及交易，务必提醒风险

重要：
- **只用中文回答**，不要中英双语
- 分段回答，每段不超过3行
- 使用emoji增加可读性
- 回答控制在150字以内

当前学习内容：${context || '无'}`;

    // 调用 OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content || '抱歉，我无法回答这个问题。';

    return NextResponse.json({
      success: true,
      data: {
        answer,
        question,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Ask AI error:', error);
    return NextResponse.json(
      { error: '服务器错误 / Server error' },
      { status: 500 }
    );
  }
}
