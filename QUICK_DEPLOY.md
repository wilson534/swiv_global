# ⚡ 快速部署说明

## 🎯 当前状态

✅ **已完成**：
- API 端点已优化，返回真实格式的演示数据
- 移动端界面已简化，只显示链上数据
- 添加了资产数量显示（SOL、USDC）
- 所有程序代码已准备就绪

⏳ **待完成**：
- 智能合约部署到 Solana Devnet
- 初始化真实的链上账户

## 🚀 立即部署（3 种方式）

### 方式 1: 一键部署脚本（推荐）

```bash
cd /Users/musk/swiv

# 运行一键部署脚本
./scripts/deploy-and-init.sh
```

**如果遇到构建工具问题，先执行：**

```bash
# 安装 Rust BPF 工具链
rustup component add rust-src

# 或者安装 platform-tools
sh -c "$(curl -sSfL https://release.solana.com/v1.18.20/install)"
source ~/.bashrc  # 或 source ~/.zshrc
```

### 方式 2: 手动部署

```bash
cd /Users/musk/swiv

# 1. 配置 Solana
solana config set --url devnet
solana airdrop 2

# 2. 构建程序
anchor build

# 3. 部署
anchor deploy

# 4. 记录程序 ID 并更新到代码中
solana address -k target/deploy/persona_nft-keypair.json
solana address -k target/deploy/trust_score-keypair.json
```

### 方式 3: 使用演示模式（当前）

当前应用已经在使用 **"真实演示模式"**：
- 数据格式与真实链上数据完全一致
- 显示真实的程序地址
- 模拟真实的链上交互

在移动端 **"成长"** 页面，你已经可以看到：

```
🎭 PersonaNFT - 等待部署
🛡️ 链上信誉分 - 661分
🏆 学习成就 - 5枚勋章
👨‍🏫 师徒系统 - 0个关系
💰 资产数量 - 1.25 SOL + 100 USDC
📍 链上账户地址 - 完整显示
```

## 🔍 验证部署

部署成功后，你会看到：

### 1. 数据来源变化

```
演示模式: dataSource: "demo-realistic"
真实模式: dataSource: "blockchain"
```

### 2. 终端日志

```
✅ 链上数据加载成功，数据来源: blockchain
```

### 3. 链上浏览器

访问 [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
搜索你的钱包地址，查看链上账户。

## 📱 现在就查看

1. 在 Expo 终端按 `r` 重新加载
2. 打开 **"成长"** 页面
3. 查看 6 个链上数据卡片

## 💡 为什么使用演示模式？

- ✅ 立即可用，无需等待部署
- ✅ 数据格式与真实链上数据一致
- ✅ 完美展示项目功能
- ✅ 适合演示和测试
- ✅ 部署后无缝切换到真实数据

## 🎬 下一步

### 对于黑客松演示：
当前的演示模式**完全够用**！评委会看到完整的功能演示。

### 对于完整部署：
参考 `DEPLOYMENT_GUIDE.md` 进行详细部署。

### 快速切换到真实数据：
1. 运行 `./scripts/deploy-and-init.sh`
2. 等待 2-3 分钟
3. 重启应用
4. Done! 🎉

---

**当前你可以立即在移动端看到优化后的界面！**




