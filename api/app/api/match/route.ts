/**
 * Match API Route
 * 处理用户匹配逻辑
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/match?walletAddress=xxx&limit=20
 * 获取匹配候选用户
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少钱包地址 / Missing wallet address' },
        { status: 400 }
      );
    }

    // TODO: 获取用户的 PersonaNFT 和 TrustScore
    // TODO: 实现匹配算法
    // score = 0.5 * keywordSimilarity + 0.3 * riskMatch + 0.2 * trustScoreNorm
    // TODO: 过滤已匹配和已拒绝的用户
    
    return NextResponse.json({
      success: true,
      data: {
        candidates: [
          // TODO: 返回候选用户数组
          // {
          //   walletAddress: string,
          //   persona: {...},
          //   trustScore: number,
          //   matchScore: number,
          // }
        ]
      }
    });

  } catch (error) {
    console.error('Match fetch error:', error);
    return NextResponse.json(
      { error: '服务器错误 / Server error' },
      { status: 500 }
    );
  }
}




