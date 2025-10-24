/**
 * PersonaNFT API Route
 * 处理用户人格创建和 NFT 铸造
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/persona
 * 创建用户投资人格并准备铸造 NFT
 * 
 * Body:
 * {
 *   walletAddress: string,
 *   answers: Record<string, any>,  // AI 测评答案
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, answers } = body;

    if (!walletAddress || !answers) {
      return NextResponse.json(
        { error: '缺少必要参数 / Missing required parameters' },
        { status: 400 }
      );
    }

    // TODO: 调用 OpenAI 生成人格
    // TODO: 计算人格哈希
    // TODO: 准备链上数据
    
    return NextResponse.json({
      success: true,
      message: '人格生成中 / Persona generation in progress',
      data: {
        // TODO: 返回人格数据
      }
    });

  } catch (error) {
    console.error('Persona creation error:', error);
    return NextResponse.json(
      { error: '服务器错误 / Server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/persona?walletAddress=xxx
 * 获取用户的 PersonaNFT 信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少钱包地址 / Missing wallet address' },
        { status: 400 }
      );
    }

    // TODO: 从链上查询 PersonaNFT
    // TODO: 从数据库查询详细信息
    
    return NextResponse.json({
      success: true,
      data: {
        // TODO: 返回人格数据
      }
    });

  } catch (error) {
    console.error('Persona fetch error:', error);
    return NextResponse.json(
      { error: '服务器错误 / Server error' },
      { status: 500 }
    );
  }
}


