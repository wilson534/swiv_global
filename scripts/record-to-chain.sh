#!/bin/bash

# 使用 SPL Memo 程序在链上记录互动数据
# 每次调用会生成一笔真实的 Solana 交易

set -e

USER_WALLET=$1
INTERACTION_TYPE=$2
QUALITY_SCORE=$3

if [ -z "$USER_WALLET" ] || [ -z "$INTERACTION_TYPE" ] || [ -z "$QUALITY_SCORE" ]; then
  echo "用法: $0 <user_wallet> <interaction_type> <quality_score>"
  echo "示例: $0 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM match 85"
  exit 1
fi

# 创建 memo 数据
TIMESTAMP=$(date +%s)
MEMO_DATA="{\"app\":\"swiv\",\"user\":\"${USER_WALLET:0:8}\",\"type\":\"$INTERACTION_TYPE\",\"score\":$QUALITY_SCORE,\"ts\":$TIMESTAMP}"

echo "🔗 记录到 Solana 链上..."
echo "📝 Memo: $MEMO_DATA"
echo ""

# 使用 transfer 命令附带 memo（转 0.000001 SOL 给自己，附带 memo）
SIGNATURE=$(solana transfer \
  --allow-unfunded-recipient \
  --url https://api.devnet.solana.com \
  --with-memo "$MEMO_DATA" \
  $USER_WALLET 0.000001 \
  --output json | jq -r '.signature')

if [ ! -z "$SIGNATURE" ]; then
  echo "✅ 交易成功！"
  echo "📜 签名: $SIGNATURE"
  echo "🔗 查看交易:"
  echo "   https://explorer.solana.com/tx/$SIGNATURE?cluster=devnet"
  echo ""
  echo "🎉 数据已永久记录在 Solana 链上！"
else
  echo "❌ 交易失败"
  exit 1
fi

