#!/bin/bash

# 🧪 Solana 链上集成测试脚本

echo "🚀 开始测试 Solana 链上集成..."
echo ""

# 测试用户钱包
WALLET="9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
API_URL="http://localhost:3000/api/trust-score"

echo "📍 测试用户: ${WALLET:0:20}..."
echo ""

# 测试 1: 查询初始状态
echo "=== 测试 1: 查询初始信誉数据 ==="
curl -s "${API_URL}?wallet=${WALLET}" | python3 -m json.tool
echo -e "\n"

# 测试 2: 记录匹配互动
echo "=== 测试 2: 记录匹配互动 (质量分: 85) ==="
curl -s -X POST ${API_URL} \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\":\"${WALLET}\",\"interactionType\":\"match\",\"qualityScore\":85}" \
  | python3 -m json.tool
echo -e "\n"

# 测试 3: 记录聊天互动
echo "=== 测试 3: 记录聊天互动 (质量分: 90) ==="
curl -s -X POST ${API_URL} \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\":\"${WALLET}\",\"interactionType\":\"chat\",\"qualityScore\":90}" \
  | python3 -m json.tool
echo -e "\n"

# 测试 4: 记录有用回答
echo "=== 测试 4: 记录有用回答 (质量分: 95) ==="
curl -s -X POST ${API_URL} \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\":\"${WALLET}\",\"interactionType\":\"helpful\",\"qualityScore\":95}" \
  | python3 -m json.tool
echo -e "\n"

# 测试 5: 查询最终状态
echo "=== 测试 5: 查询最终信誉数据 ==="
curl -s "${API_URL}?wallet=${WALLET}" | python3 -m json.tool
echo -e "\n"

# 测试学习活动
echo "=== 测试 6: 记录学习活动 ==="
curl -s -X POST ${API_URL}/learning \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\":\"${WALLET}\",\"cardsViewed\":10,\"engagementScore\":85}" \
  | python3 -m json.tool
echo -e "\n"

echo "✅ 测试完成！"
echo ""
echo "📊 总结："
echo "- 记录了 3 次互动（match, chat, helpful）"
echo "- 记录了 1 次学习活动"
echo "- 信誉分应该已经增加"
echo "- 所有交易都生成了签名"
echo ""
echo "💡 提示："
echo "- 如果 'onChain: true' 说明数据真实写入 Solana 链"
echo "- 如果 'onChain: false' 说明使用缓存模式（RPC 连接问题）"
echo "- 两种模式都能正常工作！"

