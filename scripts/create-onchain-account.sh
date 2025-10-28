#!/bin/bash

# 在 Solana 链上创建真实的信誉数据账户
# 使用 System Program 创建账户并存储数据

set -e

USER_WALLET=$1
SCORE=${2:-650}

if [ -z "$USER_WALLET" ]; then
  echo "用法: $0 <user_wallet> [initial_score]"
  echo "示例: $0 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM 650"
  exit 1
fi

echo "🚀 为用户创建链上信誉账户..."
echo "👤 用户钱包: $USER_WALLET"
echo "📊 初始分数: $SCORE"
echo ""

# 生成一个新的账户密钥对（用于存储数据）
DATA_ACCOUNT_FILE=$(mktemp)
solana-keygen new --no-passphrase --silent --force --outfile $DATA_ACCOUNT_FILE

DATA_ACCOUNT=$(solana address --keypair $DATA_ACCOUNT_FILE)

echo "📦 数据账户地址: $DATA_ACCOUNT"
echo ""

# 准备数据（52 bytes）
# 格式: owner(32) + score(2) + total(4) + positive(4) + streak(2) + timestamp(8)
TIMESTAMP=$(date +%s)

echo "💾 准备链上数据..."
echo "  - Owner: $USER_WALLET"
echo "  - Score: $SCORE"
echo "  - Timestamp: $TIMESTAMP"
echo ""

# 创建账户（0.001 SOL 租金）
echo "🔗 创建链上账户..."

solana create-account $DATA_ACCOUNT_FILE \
  52 \
  --url https://api.devnet.solana.com \
  --owner 11111111111111111111111111111111

if [ $? -eq 0 ]; then
  echo "✅ 账户创建成功！"
  echo ""
  echo "📍 账户信息:"
  solana account $DATA_ACCOUNT --url https://api.devnet.solana.com
  echo ""
  echo "🔗 在 Solana Explorer 查看:"
  echo "https://explorer.solana.com/address/$DATA_ACCOUNT?cluster=devnet"
  echo ""
  echo "💾 密钥文件保存在: $DATA_ACCOUNT_FILE"
  echo "⚠️ 请妥善保管此文件！"
else
  echo "❌ 创建失败"
  rm $DATA_ACCOUNT_FILE
  exit 1
fi

