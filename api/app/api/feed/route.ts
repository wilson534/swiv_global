/**
 * Feed API Route
 * 提供个性化学习内容流
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/feed?walletAddress=xxx&offset=0&limit=10
 * 获取个性化学习内容
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少钱包地址 / Missing wallet address' },
        { status: 400 }
      );
    }

    // Generate learning content (using mock data for now, will integrate AI later)
    const allFeedItems = [
      {
        id: '1',
        title: 'Risk Management Basics',
        content: 'Control losses while pursuing returns through diversification, stop-loss orders, and regular evaluation. Never invest more than you can afford to lose. Always have a clear exit strategy.',
        category: 'Basics',
        difficulty: 'beginner' as const,
        estimatedTime: 3,
      },
      {
        id: '2',
        title: 'What is DeFi?',
        content: 'DeFi recreates financial services on blockchain without banks. Lend, borrow, and trade through smart contracts. While offering high yields, be aware of smart contract risks.',
        category: 'DeFi',
        difficulty: 'intermediate' as const,
        estimatedTime: 4,
      },
      {
        id: '3',
        title: 'Why Solana is Fast',
        content: 'Solana uses Proof of History to process 50,000+ transactions per second with fees under $0.01. Perfect for DeFi, NFTs, and gaming.',
        category: 'Blockchain',
        difficulty: 'intermediate' as const,
        estimatedTime: 3,
      },
      {
        id: '4',
        title: 'Crypto Security',
        content: 'Use hardware wallets for storage. Enable 2FA on exchanges. Never share your seed phrase. Beware of phishing attacks and keep multiple backups.',
        category: 'Security',
        difficulty: 'beginner' as const,
        estimatedTime: 3,
      },
      {
        id: '5',
        title: 'NFT Investing',
        content: 'Research team, community, and utility before buying. Look for real use cases. Check trading volume and trends. Only invest what you can afford to lose.',
        category: 'NFT',
        difficulty: 'advanced' as const,
        estimatedTime: 4,
      },
      {
        id: '6',
        title: 'Yield Farming',
        content: 'Earn rewards by providing liquidity to pools. Get trading fees plus tokens, often 20-100% APY. Watch for impermanent loss. Start with established protocols.',
        category: 'DeFi',
        difficulty: 'advanced' as const,
        estimatedTime: 4,
      },
    ];

    // 分页
    const feedItems = allFeedItems.slice(offset, offset + limit);
    const hasMore = offset + limit < allFeedItems.length;

    return NextResponse.json({
      success: true,
      data: feedItems,
      pagination: {
        offset,
        limit,
        hasMore,
        total: allFeedItems.length,
      }
    });

  } catch (error) {
    console.error('Feed fetch error:', error);
    return NextResponse.json(
      { error: '服务器错误 / Server error' },
      { status: 500 }
    );
  }
}

