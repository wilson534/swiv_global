# 🚀 Solana 智能合约部署指南

## 📋 前置要求

### 1. 安装 Solana 工具链

```bash
# 安装 Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.20/install)"

# 验证安装
solana --version
```

### 2. 安装 Anchor Framework

```bash
# 通过 cargo 安装 Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli

# 验证安装
anchor --version
```

### 3. 安装 Solana BPF 工具链

```bash
# 安装 cargo-build-sbf
cargo install --git https://github.com/solana-labs/cargo-build-sbf

# 或者使用 solana 命令安装 BPF 工具
solana-install init 1.18.20
```

## 🔧 配置

### 1. 设置 Solana 为 Devnet

```bash
cd /Users/musk/swiv

# 配置网络为 devnet
solana config set --url devnet

# 检查配置
solana config get
```

### 2. 创建或导入钱包

```bash
# 创建新钱包（如果没有）
solana-keygen new

# 或者使用已有钱包
solana config set --keypair ~/.config/solana/id.json

# 查看钱包地址
solana address
```

### 3. 获取 Devnet SOL（空投）

```bash
# 申请 2 SOL 用于部署
solana airdrop 2

# 检查余额
solana balance
```

## 🏗️ 构建和部署

### 1. 清理和构建

```bash
cd /Users/musk/swiv

# 清理之前的构建
anchor clean

# 构建所有程序
anchor build
```

### 2. 部署到 Devnet

```bash
# 部署所有程序
anchor deploy

# 或者单独部署
solana program deploy target/deploy/persona_nft.so
solana program deploy target/deploy/trust_score.so
solana program deploy target/deploy/social_graph.so
solana program deploy target/deploy/learning_badge.so
solana program deploy target/deploy/mentorship.so
```

### 3. 获取部署的程序 ID

```bash
# PersonaNFT
solana address -k target/deploy/persona_nft-keypair.json

# TrustScore
solana address -k target/deploy/trust_score-keypair.json

# SocialGraph
solana address -k target/deploy/social_graph-keypair.json

# LearningBadge
solana address -k target/deploy/learning_badge-keypair.json

# Mentorship
solana address -k target/deploy/mentorship-keypair.json
```

## 📝 更新程序 ID

部署后，需要更新以下文件中的程序 ID：

### 1. 更新 `Anchor.toml`

```toml
[programs.devnet]
persona_nft = "<新的程序ID>"
trust_score = "<新的程序ID>"
social_graph = "<新的程序ID>"
learning_badge = "<新的程序ID>"
mentorship = "<新的程序ID>"
```

### 2. 更新程序源代码中的 `declare_id!`

```bash
# programs/persona-nft/src/lib.rs
# programs/trust-score/src/lib.rs
# programs/social-graph/src/lib.rs
# programs/learning-badge/src/lib.rs
# programs/mentorship/src/lib.rs
```

### 3. 更新 API 中的程序 ID

```typescript
// api/app/api/onchain-stats/route.ts
const PROGRAM_IDS = {
  personaNft: '<新的程序ID>',
  trustScore: '<新的程序ID>',
  socialGraph: '<新的程序ID>',
  learningBadge: '<新的程序ID>',
  mentorship: '<新的程序ID>',
};
```

## 🎭 初始化测试数据

### 1. 使用一键部署脚本

```bash
cd /Users/musk/swiv

# 运行部署和初始化脚本
./scripts/deploy-and-init.sh
```

### 2. 手动初始化账户

```bash
# 使用 TypeScript 脚本初始化
cd /Users/musk/swiv
ts-node scripts/init-test-accounts.ts
```

## 🧪 验证部署

### 1. 检查程序状态

```bash
# 检查程序是否部署成功
solana program show <程序ID> --url devnet

# 查看程序日志
solana logs <程序ID> --url devnet
```

### 2. 测试 API 端点

```bash
# 测试链上数据 API
curl http://localhost:3000/api/onchain-stats?wallet=<你的钱包地址>

# 测试学习勋章 API
curl http://localhost:3000/api/badge
```

### 3. 在移动端测试

1. 确保 API 服务运行中：`cd api && npm run dev`
2. 确保移动端运行中：`cd mobile && npx expo start`
3. 打开 **成长** 页面
4. 查看链上数据是否显示

## 🐛 常见问题

### 问题 1: `cargo build-sbf` 命令不存在

**解决方案：**
```bash
# 安装 cargo-build-sbf
cargo install --git https://github.com/solana-labs/cargo-build-sbf
```

### 问题 2: 余额不足

**解决方案：**
```bash
# 申请更多 SOL
solana airdrop 2

# 如果空投失败，尝试使用 devnet faucet
# https://faucet.solana.com/
```

### 问题 3: 程序 ID 不匹配

**解决方案：**
```bash
# 1. 获取实际部署的程序 ID
solana address -k target/deploy/persona_nft-keypair.json

# 2. 更新 lib.rs 中的 declare_id!
# 3. 重新构建和部署
anchor build && anchor deploy
```

### 问题 4: anchor build 失败

**解决方案：**
```bash
# 清理并重新构建
anchor clean
cargo clean
anchor build
```

## 📊 查看链上数据

部署成功后，你可以通过以下方式查看链上数据：

1. **移动端应用**: 打开 "成长" 页面
2. **Solana Explorer**: https://explorer.solana.com/?cluster=devnet
3. **直接查询**:
```bash
solana account <账户地址> --url devnet
```

## 🎉 部署成功标志

部署成功后，你应该看到：

✅ 所有程序成功部署到 Devnet
✅ 程序 ID 已更新到所有相关文件
✅ API 能够查询到链上账户
✅ 移动端显示真实的链上数据
✅ 数据来源显示为 "blockchain" 而不是 "demo"

---

## 📚 更多资源

- [Solana 文档](https://docs.solana.com/)
- [Anchor 文档](https://www.anchor-lang.com/)
- [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet)
- [Solana Devnet Faucet](https://faucet.solana.com/)




