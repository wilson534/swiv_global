/**
 * Mentorship API
 * 处理师徒关系相关的API请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// 仅在配置了 Supabase 时初始化
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
  : null;

/**
 * 获取导师列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'mentors' or 'mentorships'
    const walletAddress = searchParams.get('wallet');

    if (type === 'mentors') {
      // 获取所有可用导师列表
      // 结合链上数据（导师档案）和链下数据（用户信息）
      
      const connection = new Connection(SOLANA_RPC_URL);
      
      // TODO: 查询所有导师Profile PDAs
      // 这里需要使用getProgramAccounts来查找所有导师
      
      // 如果没有配置 Supabase，返回演示数据
      if (!supabase) {
        console.log('Note: Supabase not configured, returning demo data');
      }
      
      // 临时返回模拟数据
      return NextResponse.json({
        mentors: [
          {
            walletAddress: 'mentor1...',
            specialty: 'DeFi Trading',
            maxMentees: 5,
            currentMentees: 2,
            reputationScore: 850,
            isActive: true,
          }
        ]
      });
    }

    if (type === 'mentorships' && walletAddress) {
      // 获取特定用户的师徒关系
      const [mentorshipPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('mentorship'),
          // mentor pubkey
          // mentee pubkey
        ],
        new PublicKey('MentorshipProgramID1111111111111111111111')
      );

      // TODO: 查询链上数据

      return NextResponse.json({
        mentorships: []
      });
    }

    return NextResponse.json({ error: 'Invalid query type' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching mentorship data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentorship data' },
      { status: 500 }
    );
  }
}

/**
 * 创建师徒关系或记录会话
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, mentorWallet, menteeWallet, data } = body;

    if (!action || !mentorWallet || !menteeWallet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create':
        // 创建新的师徒关系
        // TODO: 调用链上程序创建 mentorship
        return NextResponse.json({
          success: true,
          message: 'Mentorship created',
        });

      case 'record_session':
        // 记录指导会话
        // TODO: 调用链上程序记录会话
        return NextResponse.json({
          success: true,
          message: 'Session recorded',
        });

      case 'complete':
        // 完成师徒关系
        // TODO: 调用链上程序完成 mentorship
        return NextResponse.json({
          success: true,
          message: 'Mentorship completed',
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing mentorship action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

