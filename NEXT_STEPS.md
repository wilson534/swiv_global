# ✅ 下一步行动清单 / Next Steps Checklist

**当前进度：** 75% ✅  
**待完成：** 25% ⏳  
**预计时间：** 1-2 天

---

## 🚀 立即行动（今天/明天）

### 1️⃣ 安装 Solana 开发环境

#### 方法 A：Homebrew（推荐，最简单）
```bash
# 1. 安装 Solana CLI
brew install solana

# 2. 验证安装
solana --version

# 3. 配置 devnet
solana config set --url devnet

# 4. 创建钱包
solana-keygen new --outfile ~/.config/solana/devnet.json

# 5. 获取测试 SOL
solana airdrop 2
```

#### 方法 B：官方脚本
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

#### 安装 Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

#### 安装 Anchor CLI
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked
```

---

### 2️⃣ 申请 API 密钥

#### OpenAI API Key
1. 访问：https://platform.openai.com/api-keys
2. 创建新密钥
3. 复制保存（格式：`sk-...`）
4. **预计成本：** $10-50/月

#### Supabase 项目
1. 访问：https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写项目信息：
   - Name: swiv-dev
   - Database Password: (自动生成)
   - Region: 选择最近的
4. 等待项目创建（~2 分钟）
5. 进入 Settings → API
6. 复制：
   - Project URL
   - anon/public key
   - service_role key

---

### 3️⃣ 配置环境变量

#### API 环境变量
```bash
cd /Users/musk/swiv/api
cp env.example .env.local
```

编辑 `.env.local`：
```env
# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Solana（部署后填入）
PERSONA_NFT_PROGRAM_ID=
TRUST_SCORE_PROGRAM_ID=
SOCIAL_GRAPH_PROGRAM_ID=
```

#### 移动端环境变量
```bash
cd /Users/musk/swiv/mobile
cp env.example .env
```

编辑 `.env`：
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Supabase（同上）
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

### 4️⃣ 设置 Supabase 数据库

#### 执行 SQL 架构
1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 打开文件：`/Users/musk/swiv/docs/supabase_schema.sql`
4. 复制全部内容
5. 粘贴到 SQL Editor
6. 点击 "Run"
7. 确认 8 张表都已创建

#### 验证
```sql
-- 在 SQL Editor 中运行
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

应该看到：
- profiles
- personas
- swipes
- matches
- messages
- reports
- trust_score_history
- feed_interactions

---

## 🔨 编译和部署（第二天）

### 5️⃣ 编译 Anchor 程序

```bash
cd /Users/musk/swiv

# 1. 构建程序
anchor build

# 2. 查看程序 ID
anchor keys list

# 3. 更新 Anchor.toml 中的程序 ID

# 4. 重新构建
anchor build
```

### 6️⃣ 部署到 Devnet

```bash
# 确保有足够的 SOL
solana balance

# 如果不足，获取更多
solana airdrop 2

# 部署
anchor deploy --provider.cluster devnet
```

### 7️⃣ 更新程序 ID 到环境变量

复制部署输出的程序 ID，更新到：
- `api/.env.local`
- `mobile/.env`
- `Anchor.toml`

---

## 🧪 测试（第三天）

### 8️⃣ 运行测试

```bash
# Anchor 程序测试
anchor test

# API 测试
cd api && npm test

# 类型检查
cd api && npx tsc --noEmit
cd mobile && npx tsc --noEmit
```

### 9️⃣ 本地运行

```bash
# Terminal 1: 启动 API
cd /Users/musk/swiv/api
npm run dev

# Terminal 2: 启动移动端
cd /Users/musk/swiv/mobile
npx expo start
```

### 🔟 功能测试

在手机上测试：
- [ ] 钱包连接
- [ ] AI 测评
- [ ] PersonaNFT 铸造
- [ ] 学习流浏览
- [ ] 匹配系统
- [ ] 聊天功能（基础）

---

## 📝 完成检查清单 / Completion Checklist

### ✅ 已完成
- [x] 所有代码已编写
- [x] 所有测试已编写
- [x] 所有文档已完成
- [x] CI/CD 已配置

### ⏳ 待完成
- [ ] Solana CLI 已安装
- [ ] OpenAI API Key 已获取
- [ ] Supabase 项目已创建
- [ ] 环境变量已配置
- [ ] 数据库表已创建
- [ ] Anchor 程序已编译
- [ ] 程序已部署到 devnet
- [ ] 本地测试已通过
- [ ] 移动端可以连接钱包
- [ ] 功能测试已完成

---

## 🚨 常见问题 / Troubleshooting

### Q1: Solana CLI 安装失败
**A:** 尝试使用 Homebrew：`brew install solana`

### Q2: Anchor 编译错误
**A:** 确保 Rust 和 Anchor CLI 版本正确：
```bash
rustc --version  # 应该 >= 1.70
anchor --version # 应该 = 0.29.0
```

### Q3: 环境变量不生效
**A:** 重启开发服务器：
```bash
# API
cd api && npm run dev

# Mobile
cd mobile && npx expo start -c  # -c 清除缓存
```

### Q4: Supabase 连接失败
**A:** 检查：
1. URL 和 Key 是否正确
2. 是否有网络连接
3. 项目是否已激活

### Q5: 测试 SOL 不足
**A:** 
```bash
solana airdrop 2
# 如果失败，等几分钟后重试
```

---

## 📞 需要帮助？

### 文档位置
- **完整文档：** `/Users/musk/swiv/docs/`
- **安装指南：** `/Users/musk/swiv/INSTALL_GUIDE.md`
- **部署指南：** `/Users/musk/swiv/docs/DEPLOYMENT.md`
- **API 文档：** `/Users/musk/swiv/docs/API_DOCUMENTATION.md`

### 重要命令速查

```bash
# Solana
solana --version
solana config get
solana balance
solana airdrop 2

# Anchor
anchor build
anchor test
anchor deploy

# API
cd api && npm run dev

# Mobile
cd mobile && npx expo start

# Git
git status
git add .
git commit -m "feat: complete MVP"
```

---

## 🎯 完成后

一旦所有检查清单项都完成：

1. **创建 Git Tag**
```bash
git tag -a v1.0.0-mvp -m "MVP Release"
git push origin v1.0.0-mvp
```

2. **准备 Demo**
- 录制 Demo 视频
- 准备演示文稿
- 准备黑客松提交材料

3. **提交黑客松**
- 填写项目信息
- 上传 Demo 视频
- 提交代码链接

---

<div align="center">

# 🚀 Ready to Launch!

**你已经完成了 75%，剩下的 25% 只是配置！**

**加油！Swiv 即将上线！🎉**

</div>

---

**创建时间：** 2025-10-24 晚  
**预计完成：** 2025-10-25 或 2025-10-26  
**状态：** ⏳ 等待外部资源


