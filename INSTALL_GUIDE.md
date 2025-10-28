# 🔧 Swiv 安装指南 / Installation Guide

> **针对网络环境问题的完整安装方案**

---

## 📋 安装检查清单

### ✅ 已安装
- [x] Node.js v24.4.1
- [x] npm 11.4.2

### ⏳ 待安装
- [ ] Solana CLI
- [ ] Anchor CLI
- [ ] Rust

---

## 1️⃣ 安装 Solana CLI

### 方法一：官方安装脚本
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

### 方法二：使用 Homebrew（推荐，适合网络不稳定）
```bash
brew install solana
```

### 验证安装
```bash
solana --version
# 期望输出: solana-cli 1.17.x 或更高
```

### 配置 Solana
```bash
# 配置使用 devnet
solana config set --url devnet

# 创建开发钱包
solana-keygen new --outfile ~/.config/solana/devnet.json

# 设置为默认钱包
solana config set --keypair ~/.config/solana/devnet.json

# 获取测试 SOL（可能需要多次执行）
solana airdrop 2
```

---

## 2️⃣ 安装 Rust

Anchor 需要 Rust 编译器。

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

安装完成后：
```bash
source $HOME/.cargo/env
rustc --version
```

---

## 3️⃣ 安装 Anchor CLI

### 使用 cargo 安装
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked
```

### 验证安装
```bash
anchor --version
# 期望输出: anchor-cli 0.29.0
```

---

## 4️⃣ 前端开发工具

### 安装 Expo CLI
```bash
npm install -g expo-cli
```

### 验证
```bash
npx expo --version
```

---

## 5️⃣ 可选工具

### Solana Explorer
访问 https://explorer.solana.com/?cluster=devnet 查看链上数据

### Phantom 钱包
- iOS: App Store 搜索 "Phantom"
- Android: Google Play 搜索 "Phantom"

---

## 🌐 网络问题解决方案

### 如果无法访问 Solana 官方网站：

#### 方案 1：使用镜像
```bash
# 设置代理（如果有）
export http_proxy=http://your-proxy:port
export https_proxy=http://your-proxy:port
```

#### 方案 2：离线安装
从其他机器下载安装包后手动安装

#### 方案 3：使用 Docker
```bash
docker pull solanalabs/solana:stable
```

---

## 📦 依赖版本锁定

根据 `docs/TECH_STACK.md`，我们使用以下版本：

```
Solana CLI: 1.17+
Anchor: 0.29.0
Rust: 1.70+
Node.js: 18+ (当前 24.4.1)
```

---

## ✅ 安装完成检查

运行以下命令验证所有工具已正确安装：

```bash
echo "=== 环境检查 ==="
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Rust: $(rustc --version 2>/dev/null || echo '未安装')"
echo "Solana: $(solana --version 2>/dev/null || echo '未安装')"
echo "Anchor: $(anchor --version 2>/dev/null || echo '未安装')"
```

---

## 🆘 常见问题

### Q: Solana CLI 安装失败
A: 尝试使用 Homebrew 或检查网络连接

### Q: Anchor 编译很慢
A: 首次编译会下载依赖，需要耐心等待

### Q: 无法获取测试 SOL
A: devnet 水龙头有速率限制，等待几分钟后重试

---

**创建日期：** 2025-10-24
**维护者：** @Musketeer




