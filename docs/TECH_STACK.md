# 🛠️ Swiv 技术栈详解 / Tech Stack Documentation

---

## 📱 前端 / Frontend

### React Native + Expo
**版本：** Expo SDK 49+
**用途：** 跨平台移动应用开发

**核心依赖：**
```json
{
  "expo": "^49.0.0",
  "react": "18.2.0",
  "react-native": "0.72.6",
  "expo-router": "^2.0.0"
}
```

**关键特性：**
- 文件路由系统 (app/ 目录)
- 原生手势支持 (react-native-gesture-handler)
- 快速刷新开发体验
- iOS & Android 同步开发

---

### Solana Wallet Adapter
**库：** `@solana/wallet-adapter-react-native`

**支持钱包：**
- Phantom
- Solflare
- Backpack

**集成示例：**
```typescript
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react-native';
import { clusterApiUrl } from '@solana/web3.js';
```

---

### UI 库
- **NativeWind：** Tailwind CSS for React Native
- **React Native Reanimated：** 高性能动画
- **React Native Gesture Handler：** 滑动手势

---

## 🔗 区块链层 / Blockchain Layer

### Solana
**网络：** Devnet → Mainnet-beta
**RPC：** Helius / QuickNode

**核心库：**
```json
{
  "@solana/web3.js": "^1.87.0",
  "@coral-xyz/anchor": "^0.29.0"
}
```

---

### Anchor Framework
**版本：** 0.29.0
**语言：** Rust

**项目结构：**
```
programs/
├── persona-nft/
│   ├── src/lib.rs
│   └── Cargo.toml
├── trust-score/
└── social-graph/
```

**账户示例：**
```rust
#[account]
pub struct PersonaNft {
    pub owner: Pubkey,          // 32 bytes
    pub risk_profile: u8,       // 1 byte
    pub keywords_hash: [u8; 32], // 32 bytes
    pub ai_hash: [u8; 32],      // 32 bytes
    pub non_transferable: bool,  // 1 byte
    pub created_at: i64,        // 8 bytes
    pub bump: u8,               // 1 byte
}
```

---

## 🌐 后端 API / Backend API

### Next.js
**版本：** 14+ (App Router)
**运行时：** Node.js 18+

**项目结构：**
```
api/
├── app/
│   └── api/
│       ├── persona/route.ts
│       ├── feed/route.ts
│       ├── match/route.ts
│       ├── like/route.ts
│       └── ask/route.ts
├── lib/
│   ├── solana.ts
│   ├── openai.ts
│   └── supabase.ts
└── package.json
```

**核心依赖：**
```json
{
  "next": "^14.0.0",
  "@supabase/supabase-js": "^2.38.0",
  "openai": "^4.20.0",
  "langchain": "^0.0.180"
}
```

---

## 🤖 AI 层 / AI Layer

### OpenAI GPT-4
**模型：** `gpt-4-turbo-preview`

**用途：**
1. 生成投资人格
2. 生成学习内容
3. AI 助手对话

**Prompt 示例：**
```typescript
const personaPrompt = `
You are an investment personality analyzer.
Based on these answers: ${answers}
Generate a persona with:
- Risk type (Conservative/Balanced/Aggressive)
- 5 keywords
- 2-sentence summary
Return JSON only.
`;
```

---

### LangChain
**用途：** 主题聚合与内容组织

**工作流：**
```typescript
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";

const chain = new LLMChain({
  llm: new OpenAI(),
  prompt: feedPrompt,
});
```

---

### OpenAI Moderation API
**用途：** 检测诈骗与不当内容

**集成：**
```typescript
const moderation = await openai.moderations.create({
  input: userMessage,
});

if (moderation.results[0].flagged) {
  // 拦截消息
}
```

---

## 💾 数据库 / Database

### Supabase
**类型：** PostgreSQL + Realtime

**表结构：**

#### `profiles` 表
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  persona_nft_mint TEXT,
  trust_score INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `personas` 表
```sql
CREATE TABLE personas (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  risk_type TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  description TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `matches` 表
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user_a UUID REFERENCES profiles(id),
  user_b UUID REFERENCES profiles(id),
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  on_chain_tx TEXT
);
```

#### `messages` 表
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 安全与风控 / Security & Moderation

### 风控策略

#### 1. 消息检测
```typescript
const scamPatterns = [
  /微信|WeChat/gi,
  /TG|Telegram/gi,
  /转账|transfer/gi,
  /私聊|DM me/gi,
];

function detectScam(message: string): boolean {
  return scamPatterns.some(pattern => pattern.test(message));
}
```

#### 2. 速率限制
```typescript
// Redis + Upstash
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

#### 3. TrustScore 更新
```typescript
// 正向行为
const POINTS = {
  READ_CARD: 2,
  MATCH: 5,
  CHAT: 1,
  VALID_REPORT: 3,
};

// 负向行为
const PENALTIES = {
  FLAGGED_MESSAGE: -5,
  REPORTED: -10,
  SPAM: -3,
};
```

---

## 📦 部署 / Deployment

### 前端
**平台：** Expo EAS
**构建：** `eas build --platform all`

### API
**平台：** Vercel / Railway
**环境变量：**
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

### 智能合约
**部署命令：**
```bash
anchor build
anchor deploy --provider.cluster devnet
```

---

## 🧪 测试 / Testing

### 单元测试
- **Anchor：** `#[cfg(test)]` + `anchor test`
- **Next.js：** Jest + React Testing Library
- **React Native：** Jest + Detox

### 集成测试
```typescript
// 测试完整流程
describe('User Flow', () => {
  it('should complete persona creation', async () => {
    // 1. 连接钱包
    // 2. 完成测评
    // 3. 铸造 NFT
    // 4. 验证链上数据
  });
});
```

---

## 📊 监控 / Monitoring

### 工具
- **Sentry：** 错误追踪
- **PostHog：** 用户分析
- **Grafana：** 性能监控

---

**最后更新：** 2025-10-24
**维护者：** @Musketeer




