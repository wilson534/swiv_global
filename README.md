# 🧭 Swiv

> **Learn like TikTok, Match like Tinder — but on Solana.**

一款基于 Solana 的 AI 社交投资应用，通过"AI 学习 + 链上信誉 + 人格匹配"打造可信的投资学习社群。

An AI-powered social investing app built on Solana, combining AI learning, on-chain reputation, and persona-based matching to create a trustworthy learning community.

---

## ✨ 核心特性 / Key Features

### 🎭 PersonaNFT (人格 NFT)
- 不可转让的链上投资人格身份
- AI 生成个性化投资画像
- 跨 dApp 可验证的身份证明

### 📚 智能学习流 / AI Learning Feed
- TikTok 式上下滑动学习体验
- GPT-4 生成个性化投资内容
- 实时 AI 助手解答疑问
- 📊 **学习活动追踪**: 链上记录学习进度和参与度

### 💞 信誉匹配系统 / Trust-based Matching
- Tinder 式左右滑动匹配
- 基于链上信誉分的智能推荐
- 关键词 + 风险偏好 + 信任分三维匹配
- 🏆 **成长等级系统**: 基于学习贡献的50级等级体系

### 🛡️ 链上信誉系统 / On-chain Trust Score
- ⛓️ **Solana 链上存储**: 透明且不可篡改
- 💯 **多维度计算**: 匹配、聊天、学习、助人
- 🚀 **实时更新**: 每次互动仅需 ~$0.00025
- 👮 **智能风控**: AI + 链上举报双重防护

### 🎓 师徒匹配系统 / Mentor-Mentee Matching
- 👨‍🏫 **导师机制**: 等级 20+ 用户可成为导师
- 🌱 **学徒成长**: 获得专业指导，加速学习
- 🎁 **双向激励**: 导师获得声望，学徒获得成长
- 💡 **知识优先**: 基于贡献而非财富

---

## 🏗️ 技术架构 / Tech Stack

```
📱 Frontend:  React Native + Expo
🌐 API:       Next.js 14 (App Router)
🔗 Blockchain: Solana (Anchor Framework)
🤖 AI:        OpenAI GPT-4 + LangChain
💾 Database:  Supabase (PostgreSQL)
```

详细技术栈请查看 [`docs/TECH_STACK.md`](./docs/TECH_STACK.md)

---

## 📂 项目结构 / Project Structure

```
swiv/
├── docs/                      # 📚 完整项目文档
│   ├── PRD_bilingual.md      # 产品需求文档 (中英双语)
│   ├── DEVELOPMENT_ROADMAP.md # 4周开发路线图
│   ├── TECH_STACK.md         # 技术栈详解
│   └── CONTEXT_LOG.md        # 开发上下文日志
│
├── programs/                  # 🔗 Solana 智能合约 (Anchor)
│   ├── persona-nft/          # PersonaNFT 程序
│   ├── trust-score/          # TrustScore 程序
│   └── social-graph/         # SocialGraph 程序
│
├── mobile/                    # 📱 React Native 移动应用
│   ├── app/                  # Expo Router 页面
│   │   ├── (auth)/          # 登录页
│   │   ├── (tabs)/          # 主要标签页
│   │   └── persona/         # AI 测评页
│   └── components/           # 可复用组件
│
├── api/                       # 🌐 Next.js API 服务
│   ├── app/api/              # API 路由
│   │   ├── persona/         # 人格相关
│   │   ├── feed/            # 内容流
│   │   ├── match/           # 匹配逻辑
│   │   └── ask/             # AI 问答
│   └── lib/                 # 工具库
│
└── README.md                  # 本文件
```

---

## 🚀 快速开始 / Quick Start

### 前置要求 / Prerequisites

- Node.js 18+
- Rust 1.70+
- Solana CLI 1.17+
- Anchor CLI 0.29+
- Expo CLI
- Supabase 账户
- OpenAI API 密钥

### 1️⃣ 克隆项目

```bash
git clone https://github.com/your-username/swiv.git
cd swiv
```

### 2️⃣ 安装依赖

```bash
# 安装 Solana 程序依赖
cd programs/persona-nft && cargo build
cd ../trust-score && cargo build
cd ../social-graph && cargo build

# 安装 API 依赖
cd ../../api && npm install

# 安装移动端依赖
cd ../mobile && npm install
```

### 3️⃣ 配置环境变量

```bash
# API 环境变量 (api/.env.local)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
OPENAI_API_KEY=sk-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx

# 移动端环境变量 (mobile/.env)
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### 4️⃣ 部署智能合约

```bash
# 配置 Solana devnet
solana config set --url devnet
solana-keygen new  # 创建钱包
solana airdrop 2   # 获取测试 SOL

# 部署合约
cd programs
anchor build
anchor deploy
```

### 5️⃣ 启动服务

```bash
# 终端 1: 启动 API
cd api && npm run dev

# 终端 2: 启动移动端
cd mobile && npx expo start
```

---

## 📖 文档 / Documentation

### 核心文档
- 📋 [产品需求文档 (PRD)](./docs/PRD_bilingual.md) - 完整的产品设计和技术规格
- 🛣️ [开发路线图](./docs/DEVELOPMENT_ROADMAP.md) - 4周开发计划和进度追踪
- 🛠️ [技术栈文档](./docs/TECH_STACK.md) - 详细的技术选型和使用说明
- 📝 [开发日志](./docs/CONTEXT_LOG.md) - 决策记录和上下文管理

### 智能合约文档
- [PersonaNFT Program](./programs/persona-nft/README.md) (待创建)
- [TrustScore Program](./programs/trust-score/README.md) (待创建)
- [SocialGraph Program](./programs/social-graph/README.md) (待创建)

### API 文档
- [API Reference](./api/README.md) (待创建)

---

## 🎯 开发路线 / Roadmap

### ✅ 第一周 (Week 1): 基础设施
- [x] 项目初始化和文档创建
- [ ] Solana 开发环境配置
- [ ] React Native 项目搭建
- [ ] Next.js API 搭建
- [ ] Supabase 数据库设置

### ⏳ 第二周 (Week 2): 智能合约
- [ ] PersonaNFT Program 开发
- [ ] TrustScore Program 开发
- [ ] SocialGraph Program 开发
- [ ] 合约测试与部署

### ⏳ 第三周 (Week 3): 前端与 API
- [ ] 钱包连接集成
- [ ] AI 测评与 NFT 铸造
- [ ] Feed 页面
- [ ] Match 页面
- [ ] Chat 系统
- [ ] AI API 集成

### ⏳ 第四周 (Week 4): 测试与优化
- [ ] 功能测试
- [ ] 性能优化
- [ ] UI/UX 完善
- [ ] 文档完善
- [ ] Demo 制作

完整路线图请查看 [`docs/DEVELOPMENT_ROADMAP.md`](./docs/DEVELOPMENT_ROADMAP.md)

---

## 🧪 测试 / Testing

```bash
# 智能合约测试
cd programs && anchor test

# API 测试
cd api && npm test

# 移动端测试
cd mobile && npm test
```

---

## 🤝 贡献 / Contributing

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

请确保：
- 代码符合项目规范
- 更新相关文档
- 添加适当的测试
- 提交信息清晰明确

---

## 📄 许可证 / License

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情

---

## 👥 团队 / Team

**火枪手 (@Musketeer)** - 创始人 & 开发者

---

## 🔗 链接 / Links

- 🌐 官网: (待上线)
- 📱 Demo: (待发布)
- 🐦 Twitter: (待创建)
- 💬 Discord: (待创建)

---

## 🙏 致谢 / Acknowledgments

- [Solana Foundation](https://solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [OpenAI](https://openai.com/)
- [Expo](https://expo.dev/)

---

<div align="center">

**用 ❤️ 和 ☕ 在 Solana 上构建**

Made with ❤️ and ☕ on Solana

</div>



