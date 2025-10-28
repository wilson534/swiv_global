/**
 * 查询后台上链状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQueueStatus, getTaskSignature } from '../../../lib/blockchain-queue';

export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get('taskId');
  
  if (taskId) {
    // 查询特定任务的签名
    const signature = getTaskSignature(taskId);
    return NextResponse.json({
      taskId,
      signature,
      status: signature ? 'completed' : 'processing',
    });
  }
  
  // 查询队列状态
  return NextResponse.json(getQueueStatus());
}
