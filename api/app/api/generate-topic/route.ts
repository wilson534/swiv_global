/**
 * Generate Topic API Route
 * AI 实时生成学习主题
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai-config';

// 使用 Node.js runtime 以支持代理
export const runtime = 'nodejs';

const categories = ['Basics', 'Advanced', 'Blockchain', 'Security', 'Investment', 'DeFi', 'NFT', 'Analysis'];
const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

/**
 * POST /api/generate-topic
 * Generate new learning topic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, previousTopics = [] } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    // Randomly select category and difficulty
    const category = categories[Math.floor(Math.random() * categories.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    // Build prompt
    const systemPrompt = `You are a professional investment education content creator.

Task: Generate a learning topic about cryptocurrency/investment.

STRICT Requirements:
1. Content MUST be 50-70 words ONLY (absolutely no more!)
2. Use 2-3 short sentences maximum
3. Be direct and concise, no fluff
4. Suitable for ${difficulty === 'beginner' ? 'beginners' : difficulty === 'intermediate' ? 'intermediate learners' : 'advanced learners'}
5. Category: ${category}
6. Don't repeat: ${previousTopics.slice(-5).join(', ')}

Return format (pure JSON):
{
  "title": "4-8 words max",
  "content": "50-70 words max, 2-3 sentences"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate ONE short learning topic. Maximum 70 words for content.' }
      ],
      temperature: 0.7,
      max_tokens: 180,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Generation failed');
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
    console.error('Generate topic error:', error);
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}




