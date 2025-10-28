/**
 * Learning Badge API
 * 处理学习勋章相关的API请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const connection = new Connection(SOLANA_RPC_URL);
    
    // 获取用户的勋章收藏PDA
    const [badgeCollectionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('badge_collection'), new PublicKey(walletAddress).toBuffer()],
      new PublicKey('BzpCwsmnX67zksx1BFgaDq1cmgK877WhtKgowiDQ4yAH')
    );

    // 获取账户数据
    const badgeCollectionAccount = await connection.getAccountInfo(badgeCollectionPDA);

    if (!badgeCollectionAccount) {
      return NextResponse.json({
        exists: false,
        badges: [],
        stats: {
          totalBadges: 0,
          totalCardsCompleted: 0,
          totalLearningDays: 0,
          currentStreak: 0,
          longestStreak: 0,
        }
      });
    }

    // 解析账户数据（简化版，实际需要使用Anchor deserialization）
    // TODO: 使用正确的Anchor IDL来解析
    
    return NextResponse.json({
      exists: true,
      badges: [], // TODO: 查询所有勋章NFTs
      stats: {
        totalBadges: 0, // 从账户数据解析
        totalCardsCompleted: 0,
        totalLearningDays: 0,
        currentStreak: 0,
        longestStreak: 0,
      }
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

/**
 * 记录学习会话
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, cardsCompleted, signature } = body;

    if (!walletAddress || !cardsCompleted) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 这里应该验证签名，确保请求来自真实用户
    // TODO: 实现签名验证

    // 调用链上程序记录学习会话
    // TODO: 实现链上调用

    return NextResponse.json({
      success: true,
      message: 'Learning session recorded',
      cardsCompleted,
    });
  } catch (error) {
    console.error('Error recording session:', error);
    return NextResponse.json(
      { error: 'Failed to record session' },
      { status: 500 }
    );
  }
}

