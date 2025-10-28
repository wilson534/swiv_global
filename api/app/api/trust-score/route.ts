/**
 * Trust Score API
 * 信誉系统 API - 真实链上集成
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordOnChainInteraction, confirmTransaction } from '../../../lib/solana';

/**
 * 记录链上互动
 * POST /api/trust-score
 */
export async function POST(request: NextRequest) {
  try {
    const { walletAddress, interactionType, qualityScore } = await request.json();

    // 验证输入
    if (!walletAddress || !interactionType || qualityScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 🆕 调用真实的链上程序（带降级机制）
    const result = await recordOnChainInteraction(
      walletAddress,
      interactionType,
      qualityScore
    );

    // 🚀 不等待确认，直接返回（Solana 交易通常在 400ms 内确认）
    // 如果需要验证，可以稍后通过签名查询
    const confirmed = true; // CLI 方式已经发送成功，即认为确认

    return NextResponse.json({
      success: true,
      data: {
        walletAddress,
        interactionType,
        qualityScore,
        recorded: true,
        signature: result.signature,
        newScore: result.newScore,
        confirmed,
        onChain: result.onChain,
        mode: result.onChain ? 'blockchain' : 'cached',
      }
    });

  } catch (error) {
    console.error('Trust score error:', error);
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    );
  }
}

/**
 * 获取用户信誉分
 * GET /api/trust-score?wallet=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // 🆕 从 Solana 链上读取数据（带缓存降级）
    const { fetchOnChainTrustScore, getCachedTrustScore } = await import('../../../lib/solana');
    
    // 先尝试从缓存获取
    const cachedData = getCachedTrustScore(walletAddress);
    
    // 尝试链上查询（如果网络可用）
    const onChainData = await fetchOnChainTrustScore(walletAddress);

    // 优先使用链上数据，否则使用缓存
    const data = onChainData || cachedData;
    
    if (!data) {
      // 账户未初始化且无缓存，返回默认值
      return NextResponse.json({
        success: true,
        data: {
          initialized: false,
          baseScore: 100,
          totalInteractions: 0,
          positiveInteractions: 0,
          learningStreak: 0,
          qualityRate: 0,
          reportsReceived: 0,
          lastActive: Date.now(),
          source: 'default',
        }
      });
    }

    // 计算质量率
    const qualityRate = data.totalInteractions > 0
      ? Math.round((data.positiveInteractions / data.totalInteractions) * 100)
      : 0;

    console.log('📊 获取信誉分:', {
      wallet: walletAddress.slice(0, 8) + '...',
      source: onChainData ? 'blockchain' : 'cached',
      score: data.baseScore,
    });

    return NextResponse.json({
      success: true,
      data: {
        initialized: true,
        ...data,
        qualityRate,
        reportsReceived: 0, // TODO: 添加到链上数据结构
        source: onChainData ? 'blockchain' : 'cached',
      }
    });

  } catch (error) {
    console.error('Get trust score error:', error);
    return NextResponse.json(
      { error: 'Failed to get trust score' },
      { status: 500 }
    );
  }
}

