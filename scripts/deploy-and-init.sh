#!/bin/bash
# 部署所有智能合约到 Solana Devnet 并初始化测试数据

set -e

echo "🚀 开始部署 Solana 智能合约..."

# 1. 检查 Solana 配置
echo "📋 检查 Solana 配置..."
solana config set --url devnet
solana balance

# 2. 申请空投（如果余额不足）
BALANCE=$(solana balance | awk '{print $1}')
if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "💰 余额不足，申请空投..."
    solana airdrop 2
fi

# 3. 构建程序
echo "🔨 构建 Anchor 程序..."
anchor build

# 4. 部署程序
echo "📤 部署到 Devnet..."
anchor deploy

# 5. 获取部署的程序 ID
echo "📝 程序 ID:"
echo "PersonaNFT: $(solana address -k target/deploy/persona_nft-keypair.json)"
echo "TrustScore: $(solana address -k target/deploy/trust_score-keypair.json)"
echo "SocialGraph: $(solana address -k target/deploy/social_graph-keypair.json)"

# 6. 初始化测试账户
echo "🎭 初始化测试账户..."

# 获取钱包地址
WALLET=$(solana address)
echo "使用钱包: $WALLET"

# 调用初始化脚本
cd /Users/musk/swiv
ts-node scripts/init-test-accounts.ts

echo "✅ 部署和初始化完成！"
echo "📱 现在可以在移动端查看真实的链上数据了！"


