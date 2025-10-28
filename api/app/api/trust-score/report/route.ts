/**
 * Trust Score Report API
 * 用户举报
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 举报用户
 * POST /api/trust-score/report
 */
export async function POST(request: NextRequest) {
  try {
    const { reporterWallet, reportedWallet, reason, evidence } = await request.json();

    // 验证输入
    if (!reporterWallet || !reportedWallet || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: 实际应该调用 Solana 程序记录到链上
    console.log('⚠️ 用户举报:', {
      reporterWallet,
      reportedWallet,
      reason,
      evidence,
    });

    return NextResponse.json({
      success: true,
      data: {
        reportId: Date.now().toString(),
        status: 'pending',
      }
    });

  } catch (error) {
    console.error('Report user error:', error);
    return NextResponse.json(
      { error: 'Failed to report user' },
      { status: 500 }
    );
  }
}

