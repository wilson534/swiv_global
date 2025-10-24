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

    // 生成学习内容（暂时使用模拟数据，后续接入 AI）
    const allFeedItems = [
      {
        id: '1',
        title: '什么是风险管理？',
        content: '风险管理是投资中最重要的概念之一，它帮助你在追求收益的同时控制潜在损失。通过分散投资、设置止损点和定期评估，你可以有效降低投资风险。',
        category: '基础知识',
        difficulty: 'beginner' as const,
        estimatedTime: 3,
      },
      {
        id: '2',
        title: 'DeFi 是什么？',
        content: 'DeFi（去中心化金融）是基于区块链的金融应用，无需传统金融中介。它包括借贷、交易、保险等服务，让用户完全掌控自己的资产。',
        category: '进阶知识',
        difficulty: 'intermediate' as const,
        estimatedTime: 5,
      },
      {
        id: '3',
        title: 'Solana 的优势是什么？',
        content: 'Solana 是一个高性能的区块链平台，具有低交易费用和高吞吐量的特点。它使用独特的 PoH（历史证明）机制，每秒可处理数千笔交易。',
        category: '区块链技术',
        difficulty: 'intermediate' as const,
        estimatedTime: 4,
      },
      {
        id: '4',
        title: '如何保护你的加密资产？',
        content: '保护加密资产的关键是使用硬件钱包、启用 2FA、定期备份私钥，并警惕钓鱼攻击。永远不要分享你的私钥或助记词。',
        category: '安全知识',
        difficulty: 'beginner' as const,
        estimatedTime: 4,
      },
      {
        id: '5',
        title: 'NFT 投资策略',
        content: 'NFT 投资需要关注项目的实用性、社区活跃度和团队背景。不要盲目追涨，要做好尽职调查，并只投资你能承受损失的金额。',
        category: '投资策略',
        difficulty: 'advanced' as const,
        estimatedTime: 6,
      },
      {
        id: '6',
        title: '什么是流动性挖矿？',
        content: '流动性挖矿是 DeFi 中的一种收益策略，用户向流动性池提供资金，获得交易手续费和代币奖励。但也要注意无常损失的风险。',
        category: '进阶知识',
        difficulty: 'advanced' as const,
        estimatedTime: 5,
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

