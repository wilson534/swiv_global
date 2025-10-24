/**
 * Generate Topic API Route
 * AI 实时生成学习主题
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const categories = ['基础知识', '进阶知识', '区块链技术', '安全知识', '投资策略', 'DeFi协议', 'NFT市场', '技术分析'];
const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

/**
 * POST /api/generate-topic
 * 生成新的学习主题
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, previousTopics = [] } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少钱包地址' },
        { status: 400 }
      );
    }

    // 随机选择类别和难度
    const category = categories[Math.floor(Math.random() * categories.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    // 构建提示词
    const systemPrompt = `你是一个专业的投资教育内容创作者。

任务：生成一个关于加密货币/投资的学习主题。

要求：
1. 主题要有教育价值
2. 内容要简洁（100-150字）
3. 适合${difficulty === 'beginner' ? '初学者' : difficulty === 'intermediate' ? '有一定基础的学习者' : '高级学习者'}
4. 类别：${category}
5. 不要重复以下主题：${previousTopics.join(', ')}

返回格式（纯JSON，不要markdown）：
{
  "title": "主题标题（8-15字）",
  "content": "主题内容（100-150字，通俗易懂）"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '生成一个新的学习主题' }
      ],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('生成失败');
    }

    const generated = JSON.parse(responseText);

    const topic = {
      id: `generated_${Date.now()}`,
      title: generated.title,
      content: generated.content,
      category,
      difficulty,
      estimatedTime: Math.floor(Math.random() * 3) + 3, // 3-5分钟
    };

    return NextResponse.json({
      success: true,
      data: topic,
    });

  } catch (error) {
    console.error('生成主题错误:', error);
    return NextResponse.json(
      { error: '生成失败' },
      { status: 500 }
    );
  }
}


