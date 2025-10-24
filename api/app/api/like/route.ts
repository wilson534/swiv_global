/**
 * Like API Route
 * 处理用户滑动操作（喜欢/跳过）
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/like
 * 处理用户滑动操作
 * 
 * Body:
 * {
 *   fromWallet: string,
 *   toWallet: string,
 *   action: 'like' | 'pass',
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromWallet, toWallet, action } = body;

    if (!fromWallet || !toWallet || !action) {
      return NextResponse.json(
        { error: '缺少必要参数 / Missing required parameters' },
        { status: 400 }
      );
    }

    if (action !== 'like' && action !== 'pass') {
      return NextResponse.json(
        { error: '无效的操作 / Invalid action' },
        { status: 400 }
      );
    }

    // TODO: 记录滑动操作到数据库
    
    if (action === 'like') {
      // TODO: 检查对方是否也喜欢（双向匹配）
      // TODO: 如果双向匹配，创建 match 记录
      // TODO: 调用 SocialGraph 合约记录链上关系
      // TODO: 更新双方的 TrustScore
      
      const isMatch = false; // TODO: 检查是否匹配
      
      if (isMatch) {
        return NextResponse.json({
          success: true,
          match: true,
          message: '匹配成功！/ It\'s a match!',
          data: {
            // TODO: 返回匹配信息
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      match: false,
      message: action === 'like' ? '已喜欢 / Liked' : '已跳过 / Passed'
    });

  } catch (error) {
    console.error('Like action error:', error);
    return NextResponse.json(
      { error: '服务器错误 / Server error' },
      { status: 500 }
    );
  }
}


