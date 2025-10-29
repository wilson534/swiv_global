/**
 * Ask API Route
 * AI 助手问答接口
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai-config';

// 使用Node.js runtime以支持代理
export const runtime = 'nodejs';

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

    // Build system prompt - English version
    const systemPrompt = `You are Swiv's AI Investment Learning Assistant 🤖

Responsibilities:
1. Explain investment and cryptocurrency concepts in simple English
2. Provide practical advice and risk warnings
3. Answer concisely, accurately, and friendly
4. Always remind about risks when discussing trading

Important:
- **Answer in English only**
- Keep answers under 150 words
- Use paragraphs (max 3 lines each)
- Use emojis for better readability

Current learning topic: ${context || 'General'}`;

    // Try OpenAI with timeout and fallback
    try {
      console.log('📤 发送OpenAI请求，问题:', question.substring(0, 50));
      
      const completion = await Promise.race([
        openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI timeout')), 20000) // 增加到20秒
        )
      ]);

      const answer = (completion as any).choices[0]?.message?.content || getFallbackAnswer(question, context);

      console.log('✅ OpenAI请求成功！回答长度:', answer.length);

      return NextResponse.json({
        success: true,
        data: {
          answer,
          question,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (openaiError) {
      console.log('❌ OpenAI失败:', openaiError instanceof Error ? openaiError.message : 'Unknown error');
      console.log('使用Fallback答案');
      const answer = getFallbackAnswer(question, context);
      
      return NextResponse.json({
        success: true,
        data: {
          answer,
          question,
          timestamp: new Date().toISOString(),
          fallback: true,
        }
      });
    }

  } catch (error) {
    console.error('Ask AI error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Fallback answers when OpenAI is unavailable
function getFallbackAnswer(question: string, context?: string): string {
  const q = question.toLowerCase();
  
  // DeFi related
  if (q.includes('defi') || q.includes('decentralized finance')) {
    return '💰 DeFi (Decentralized Finance) refers to financial services built on blockchain technology without traditional intermediaries like banks. It includes lending, borrowing, trading, and earning interest through smart contracts. Start with established protocols and always research security audits.';
  }
  
  // Risk related
  if (q.includes('risk') || q.includes('manage')) {
    return '⚠️ Risk management in crypto investing involves: diversifying your portfolio, only investing what you can afford to lose, using stop-loss orders, and regularly rebalancing. Start small and gradually increase exposure as you learn more.';
  }
  
  // NFT related
  if (q.includes('nft')) {
    return '🎨 NFTs (Non-Fungible Tokens) are unique digital assets verified on the blockchain. They can represent art, collectibles, or game items. When investing, research the project team, community strength, and utility before purchasing.';
  }
  
  // Staking related
  if (q.includes('stake') || q.includes('staking')) {
    return '🔒 Staking involves locking your crypto assets to support a blockchain network and earn rewards. It\'s generally lower risk than active trading. Check staking requirements, lock-up periods, and APY rates before committing your funds.';
  }
  
  // General investment
  if (q.includes('invest') || q.includes('start')) {
    return '🚀 Start by learning blockchain and cryptocurrency basics. Begin with small amounts in established coins like Bitcoin or Ethereum. Use reputable exchanges, enable two-factor authentication, and consider hardware wallets for security.';
  }
  
  // Context-based answer
  if (context) {
    return `Great question about ${context}! 📚 This topic covers important cryptocurrency investing concepts. I recommend starting with the basics, doing thorough research (DYOR), and only investing amounts you're comfortable with. What specific aspect would you like to explore?`;
  }
  
  // Default answer
  return '🤔 That\'s an interesting question! In cryptocurrency investing, always do your own research (DYOR), understand the risks, and start small. Consider project fundamentals, team background, and community support. What specific aspect would you like to explore further?';
}
