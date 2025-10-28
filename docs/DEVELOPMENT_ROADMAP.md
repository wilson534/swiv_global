# 🛣️ Swiv 开发路线图 / Development Roadmap

**目标：** 4周完成 MVP for Cypherpunk 2025
**开始日期：** 2025-10-24

---

## 📅 第一周 (Week 1): 基础设施 / Infrastructure Setup

### ✅ 已完成 / Completed
- [x] 项目初始化
- [x] 文档结构创建

### 🔄 进行中 / In Progress
- [ ] Solana 开发环境配置
- [ ] Anchor 项目初始化
- [ ] React Native + Expo 项目搭建
- [ ] Next.js API 项目搭建
- [ ] Supabase 数据库设置

### 📋 待办 / To Do
- [ ] 配置 Solana devnet 钱包
- [ ] 设置 OpenAI API 密钥
- [ ] 配置 CI/CD 基础

---

## 📅 第二周 (Week 2): 核心合约开发 / Smart Contracts

### Solana Programs (Anchor)

#### PersonaNFT Program
- [ ] 定义账户结构
- [ ] 实现 mint 指令
- [ ] 实现不可转让逻辑
- [ ] 编写测试用例
- [ ] 部署到 devnet

#### TrustScore Program
- [ ] 定义账户结构
- [ ] 实现初始化指令
- [ ] 实现更新分数逻辑
- [ ] 编写测试用例
- [ ] 部署到 devnet

#### SocialGraph Program
- [ ] 定义账户结构
- [ ] 实现匹配记录指令
- [ ] 实现查询逻辑
- [ ] 编写测试用例
- [ ] 部署到 devnet

---

## 📅 第三周 (Week 3): 前端与 API / Frontend & API

### React Native 前端
- [ ] 钱包连接集成 (@solana/wallet-adapter)
- [ ] AI 测评页面
- [ ] PersonaNFT 铸造流程
- [ ] Feed 页面（上下滑动）
- [ ] Match 页面（左右滑动）
- [ ] Chat 基础界面
- [ ] Growth 页面

### Next.js API
- [ ] `/api/persona` - 创建人格
- [ ] `/api/feed` - 获取学习内容
- [ ] `/api/match` - 匹配逻辑
- [ ] `/api/like` - 处理滑动
- [ ] `/api/ask` - AI 问答
- [ ] `/api/moderation` - 风控检测

### AI 集成
- [ ] OpenAI GPT-4 集成
- [ ] 人格生成 prompt 优化
- [ ] 内容生成 prompt 优化
- [ ] LangChain 主题聚合
- [ ] Moderation API 集成

---

## 📅 第四周 (Week 4): 测试与优化 / Testing & Polish

### 功能测试
- [ ] 钱包连接测试
- [ ] PersonaNFT 铸造测试
- [ ] TrustScore 更新测试
- [ ] 匹配算法测试
- [ ] AI 响应质量测试
- [ ] 风控系统测试

### 性能优化
- [ ] 前端性能优化
- [ ] API 响应时间优化
- [ ] 合约 gas 优化
- [ ] 数据库查询优化

### UI/UX 完善
- [ ] 动画效果优化
- [ ] 加载状态处理
- [ ] 错误提示优化
- [ ] 响应式适配

### 文档完善
- [ ] API 文档完善
- [ ] 部署文档
- [ ] 用户手册
- [ ] Demo 视频制作

---

## 🎯 里程碑 / Milestones

| 里程碑 | 日期 | 状态 | 描述 |
|--------|------|------|------|
| M1: 项目初始化 | 2025-10-24 | ✅ 完成 | 文档和结构创建 |
| M2: 开发环境就绪 | 2025-10-27 | ⏳ 待完成 | 所有开发工具配置完成 |
| M3: 合约部署 | 2025-11-03 | ⏳ 待完成 | 三个程序部署到 devnet |
| M4: 前端基础完成 | 2025-11-10 | ⏳ 待完成 | 所有页面基础功能实现 |
| M5: MVP 完成 | 2025-11-21 | ⏳ 待完成 | 完整功能测试通过 |

---

## 📊 当前进度 / Current Progress

**整体进度：** 5%
- ✅ 文档系统：100%
- ⏳ 基础设施：0%
- ⏳ 智能合约：0%
- ⏳ 前端开发：0%
- ⏳ API 开发：0%
- ⏳ AI 集成：0%
- ⏳ 测试优化：0%

---

**最后更新：** 2025-10-24
**负责人：** @Musketeer




