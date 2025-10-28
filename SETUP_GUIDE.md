# 🚀 Swiv 项目完整安装指南

**从零开始设置 Swiv AI 社交投资应用**

---

## 📋 前置要求

### 必须安装的工具

1. **Node.js** (v20+)
   ```bash
   node --version  # 应显示 v20.x 或更高
   ```

2. **npm** (v10+) 
   ```bash
   npm --version  # 应显示 v10.x 或更高
   ```

3. **Homebrew** (macOS)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

4. **Solana CLI**
   ```bash
   brew install solana
   solana --version
   ```

5. **Anchor CLI** (v0.32.1)
   ```bash
   brew install anchor
   anchor --version  # 应显示 0.32.1
   ```

6. **Rust** (用于Solana程序)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustc --version
   ```

7. **Expo CLI** (移动端开发)
   ```bash
   npm install -g expo-cli
   ```

8. **Expo Go App** (手机上安装)
   - iOS: 从 App Store 下载 "Expo Go"
   - Android: 从 Google Play 下载 "Expo Go"

---

## 📦 克隆项目

```bash
git clone git@github.com:wilson534/swiv1024.git
cd swiv1024
```

---

## 🔧 安装依赖

### 1️⃣ 安装根目录依赖

```bash
npm install
```

这会安装：
- `@babel/core`
- `prettier`
- `typescript`

### 2️⃣ 安装 API 依赖

```bash
cd api
npm install
cd ..
```

API依赖包括：
- `next` (16.0.0) - Next.js框架
- `@coral-xyz/anchor` (0.32.1) - Solana Anchor客户端
- `@solana/web3.js` (1.98.4) - Solana Web3
- `@supabase/supabase-js` (2.76.1) - Supabase客户端
- `openai` (6.6.0) - OpenAI API
- `langchain` (1.0.1) - LangChain AI
- `zod` (4.1.12) - 类型验证

### 3️⃣ 安装 Mobile 依赖

```bash
cd mobile
npm install
cd ..
```

Mobile依赖包括：
- `expo` (~54.0.20)
- `react` (19.1.0)
- `react-native` (0.81.5)
- `@react-native-async-storage/async-storage` (2.2.0)
- `@solana/web3.js` (1.98.4)
- `expo-router` (6.0.13)
- `react-native-gesture-handler` (2.29.0)
- `react-native-screens` (4.18.0)

### 4️⃣ 创建必要的目录

```bash
mkdir -p mobile/node_modules
mkdir -p mobile/assets
```

---

## 🔐 配置环境变量

### 1️⃣ API 环境变量

创建 `api/.env.local`:

```bash
cd api
cp env.example .env.local
```

编辑 `api/.env.local`，填入你的密钥：

```env
# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PERSONA_NFT_PROGRAM_ID=你的PersonaNFT程序ID
TRUST_SCORE_PROGRAM_ID=你的TrustScore程序ID
SOCIAL_GRAPH_PROGRAM_ID=你的SocialGraph程序ID

# Supabase
SUPABASE_URL=https://你的项目ID.supabase.co
SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_KEY=你的service_role_key

# OpenAI
OPENAI_API_KEY=sk-proj-你的OpenAI_API_Key
```

### 2️⃣ Mobile 环境变量

创建 `mobile/.env`:

```bash
cd ../mobile
cp env.example .env
```

编辑 `mobile/.env`：

```env
# API Gateway
EXPO_PUBLIC_API_URL=http://你的本地IP:3000

# Solana
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
EXPO_PUBLIC_SOLANA_NETWORK=devnet
EXPO_PUBLIC_PERSONA_NFT_PROGRAM_ID=你的PersonaNFT程序ID
EXPO_PUBLIC_TRUST_SCORE_PROGRAM_ID=你的TrustScore程序ID
EXPO_PUBLIC_SOCIAL_GRAPH_PROGRAM_ID=你的SocialGraph程序ID

# Supabase (前端只需要anon key)
EXPO_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
```

**重要：** 获取本地IP地址：
```bash
# macOS
ipconfig getifaddr en0

# 或者
ifconfig | grep "inet " | grep -v 127.0.0.1
```

将 `EXPO_PUBLIC_API_URL` 设置为 `http://你的IP:3000`（例如：`http://192.168.5.56:3000`）

---

## 🗄️ 设置 Supabase 数据库

### 1️⃣ 注册 Supabase

访问 [supabase.com](https://supabase.com)，创建账号并新建项目。

### 2️⃣ 执行数据库脚本

1. 在 Supabase Dashboard，进入 **SQL Editor**
2. 打开项目中的 `docs/supabase_schema.sql`
3. 复制全部内容，粘贴到 SQL Editor
4. 点击 **Run** 执行

这会创建：
- 8个数据表
- RLS策略
- 触发器
- 索引

### 3️⃣ 获取 API 密钥

在 Supabase Dashboard:
1. **Settings** → **API**
2. 复制 **Project URL** 和 **anon/public** key
3. 复制 **service_role** key（仅用于API后端）

---

## 🔗 部署 Solana 程序

### 1️⃣ 配置 Solana CLI

```bash
# 设置为 devnet
solana config set --url devnet

# 生成新钱包（如果还没有）
solana-keygen new --outfile ~/.config/solana/id.json

# 请求空投 SOL（用于部署）
solana airdrop 2
```

### 2️⃣ 构建程序

```bash
anchor build
```

### 3️⃣ 部署程序

```bash
anchor deploy --provider.cluster devnet
```

### 4️⃣ 记录程序 ID

部署成功后，会显示3个程序ID：
```
Program Id: PersonaNftProgram: xxxxx
Program Id: TrustScoreProgram: xxxxx
Program Id: SocialGraphProgram: xxxxx
```

**将这些ID填入环境变量！**

---

## 🏃 运行项目

### 方式1：分别启动（推荐用于开发）

#### 终端1 - 启动 API 服务

```bash
cd api
npm run dev
```

访问: `http://localhost:3000`

#### 终端2 - 启动 Mobile 应用

```bash
cd mobile
npx expo start --clear
```

然后：
1. 用手机扫描二维码
2. 或按 `i` 打开 iOS 模拟器
3. 或按 `a` 打开 Android 模拟器

### 方式2：使用根目录脚本

```bash
# 启动 API
npm run dev:api

# 启动 Mobile
npm run dev:mobile
```

---

## 📱 首次运行

1. **打开 Expo Go**，扫描终端的二维码
2. 等待应用加载（首次可能需要1-2分钟）
3. 看到 **AI 人格测评页面**
4. 完成测评后进入主页
5. 测试功能：
   - **学习流**：上下滑动查看AI生成的投资知识
   - **问AI**：点击"问AI"按钮打开对话
   - **匹配**：左右滑动匹配投资伙伴
   - **聊天**：查看匹配的聊天列表
   - **成长**：查看信誉分和成就

---

## 🐛 常见问题

### 1. Expo 提示找不到 node_modules

**解决：**
```bash
mkdir -p mobile/node_modules
cd mobile && npm install
```

### 2. Metro Bundler 缓存问题

**解决：**
```bash
cd mobile
rm -rf .expo
npx expo start --clear
```

### 3. API 无法连接

**检查：**
- API 服务是否在运行（`http://localhost:3000`）
- `mobile/.env` 中的 `EXPO_PUBLIC_API_URL` 是否设置为本地IP（不是localhost）
- 手机和电脑在同一WiFi网络

**修复：**
```bash
# 获取本地IP
ipconfig getifaddr en0

# 编辑 mobile/.env
EXPO_PUBLIC_API_URL=http://你的IP:3000
```

### 4. Solana 程序部署失败

**解决：**
```bash
# 确保有足够的 SOL
solana balance
solana airdrop 2

# 重新构建
anchor clean
anchor build
anchor deploy
```

### 5. TypeScript 类型错误

**忽略：** 
- 大部分是React Native类型定义问题，不影响运行
- 如果需要修复，运行：
  ```bash
  cd mobile
  npm install --save-dev @types/react@19.1.0
  ```

### 6. 依赖版本警告

**处理：**
```
The following packages should be updated...
```

**暂时忽略**，这些警告不影响核心功能。如需修复：
```bash
cd mobile
npx expo install react-native-gesture-handler@~2.28.0
npx expo install react-native-screens@~4.16.0
```

---

## 🧪 测试应用

### API 测试

```bash
# 测试 Feed 接口
curl http://localhost:3000/api/feed?walletAddress=test&offset=0&limit=3

# 测试 AI 生成
curl -X POST http://localhost:3000/api/generate-topic \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"test","lastTopics":["区块链"]}'
```

### Anchor 程序测试

```bash
anchor test
```

---

## 📊 项目结构

```
swiv/
├── api/                    # Next.js API Gateway
│   ├── app/api/           # API路由
│   ├── lib/               # 工具库
│   └── package.json
├── mobile/                 # React Native移动端
│   ├── app/               # 页面和路由
│   ├── components/        # 组件
│   ├── lib/               # 工具库
│   └── package.json
├── programs/               # Solana Anchor程序
│   ├── persona-nft/       # PersonaNFT程序
│   ├── trust-score/       # TrustScore程序
│   └── social-graph/      # SocialGraph程序
├── docs/                   # 文档
├── Anchor.toml            # Anchor配置
└── package.json           # 根配置
```

---

## 🎯 下一步

1. ✅ **完成环境配置**
2. ✅ **部署Solana程序**
3. ✅ **设置Supabase数据库**
4. ✅ **启动API和Mobile**
5. ✅ **测试所有功能**
6. 🚀 **开始开发或部署到生产环境**

---

## 📞 获取帮助

- 查看 `docs/` 目录中的详细文档
- 阅读 `CONTEXT_LOG.md` 了解开发历史
- 检查 `API_DOCUMENTATION.md` 了解API接口

---

## 🎉 祝你开发愉快！

如有问题，请检查：
1. 所有依赖是否正确安装
2. 环境变量是否正确配置
3. Solana程序是否成功部署
4. API服务是否正常运行
5. 手机和电脑是否在同一网络

**Swiv 团队**




