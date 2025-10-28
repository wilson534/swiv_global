/**
 * Trust Score Learning API
 * 学习活动记录
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 记录学习活动
 * POST /api/trust-score/learning
 */
export async function POST(request: NextRequest) {
  try {
    const { walletAddress, cardsViewed, engagementScore } = await request.json();

    // 验证输入
    if (!walletAddress || !cardsViewed || engagementScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: 实际应该调用 Solana 程序记录到链上
    console.log('📚 记录学习活动:', {
      walletAddress,
      cardsViewed,
      engagementScore,
    });

    return NextResponse.json({
      success: true,
      data: {
        walletAddress,
        cardsViewed,
        engagementScore,
        recorded: true,
      }
    });

  } catch (error) {
    console.error('Record learning error:', error);
    return NextResponse.json(
      { error: 'Failed to record learning activity' },
      { status: 500 }
    );
  }
}

