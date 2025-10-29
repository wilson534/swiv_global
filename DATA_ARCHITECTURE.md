# 📊 Swiv 数据存储架构文档

> **链上链下数据存储的完整设计说明**  
> 最后更新：2025-10-25

---

## 🎯 设计原则

### 上链判断标准
数据应该存储在 Solana 链上，如果它满足以下任一条件：
1. ✅ 需要**全局可验证**（如信誉分）
2. ✅ 具有**资产属性**（如 NFT）
3. ✅ 需要**防篡改**（如匹配关系）
4. ✅ 要求**去中心化**（如社交图谱）
5. ✅ **低频更新**且关键（如人格哈希）

### 链下判断标准
数据应该存储在 Supabase 链下，如果它满足以下任一条件：
1. ✅ **高频操作**（如消息、滑动）
2. ✅ **大量文本**（如聊天内容、AI 生成文本）
3. ✅ **隐私敏感**（如举报记录）
4. ✅ **需要灵活查询**（如全文搜索）
5. ✅ **可删除/可修改**（如用户设置）

---

## ⛓️ 链上数据结构

### 1. PersonaNFT Program

**Program ID:** `JARiuuCE7xEkfk99bfQPQvJBjfY3btMxTuEKQ8ArzfQ9`

#### 账户结构：PersonaNft
```rust
pub struct PersonaNft {
    pub owner: Pubkey,                  // 32 bytes - 所有者钱包地址
    pub risk_profile: u8,               // 1 byte - 风险类型 (0/1/2)
    pub keywords_hash: [u8; 32],        // 32 bytes - 关键词哈希
    pub ai_hash: [u8; 32],              // 32 bytes - AI总结哈希
    pub non_transferable: bool,         // 1 byte - Soulbound标志
    pub created_at: i64,                // 8 bytes - 创建时间
    pub updated_at: Option<i64>,        // 9 bytes - 更新时间
    pub show_assets: bool,              // 1 byte - 显示资产设置
    pub show_sol_balance: bool,         // 1 byte
    pub show_token_holdings: bool,      // 1 byte
    pub show_nft_count: bool,           // 1 byte
    pub verified_whale: bool,           // 1 byte - 鲸鱼认证
    pub bump: u8,                       // 1 byte - PDA bump
}
// 总大小: 128 bytes
```

#### PDA Seeds
```
["persona_nft", user_wallet.as_ref()]
```

#### 指令
- `mint_persona_nft()` - 铸造人格 NFT
- `update_persona_nft()` - 更新人格数据
- `verify_persona_nft()` - 验证 NFT 所有权
- `update_asset_display_settings()` - 更新资产展示设置
- `verify_whale_status()` - 验证鲸鱼状态

#### 事件
- `PersonaNftMinted` - NFT 铸造
- `PersonaNftUpdated` - NFT 更新
- `AssetDisplaySettingsUpdated` - 设置更新
- `WhaleStatusVerified` - 鲸鱼认证

#### 成本
- 初始化：~$0.01
- 更新：~$0.0003

---

### 2. TrustScore Program

**Program ID:** `3FWDkwEPfVVZmxXS4f3pDaJpg4qf7GL5ir89DtXSwAjR`

#### 账户结构：TrustScore
```rust
pub struct TrustScore {
    pub owner: Pubkey,                  // 32 bytes
    pub base_score: u16,                // 2 bytes - 基础分 (0-1000)
    pub total_interactions: u32,        // 4 bytes - 总互动次数
    pub positive_interactions: u32,     // 4 bytes - 正面互动
    pub reports_received: u16,          // 2 bytes - 被举报次数
    pub reports_validated: u16,         // 2 bytes - 有效举报
    pub learning_streak: u16,           // 2 bytes - 学习连胜
    pub last_active: i64,               // 8 bytes - 最后活跃
    pub bump: u8,                       // 1 byte
}
// 总大小: 65 bytes
```

#### PDA Seeds
```
["trust_score", user_wallet.as_ref()]
```

#### 指令
- `initialize_trust_score()` - 初始化信誉账户
- `record_interaction()` - 记录互动
- `record_learning_activity()` - 记录学习
- `report_user()` - 举报用户
- `get_weighted_score()` - 获取加权分数

#### 事件
- `TrustScoreInitialized` - 信誉分初始化
- `TrustScoreUpdated` - 信誉分更新
- `LearningActivityRecorded` - 学习活动记录
- `UserReported` - 用户举报

#### 计算逻辑
```rust
加权分数 = base_score * 活跃度权重 * 质量权重
- 7天内活跃: 权重 1.1
- 30天以上未活跃: 权重 0.8
- 正面互动率 > 80%: +20 分
- 学习连胜 > 7天: 每7天 +10 分
- 每次举报: -25 分
```

#### 成本
- 初始化：~$0.01
- 记录互动：~$0.00025

---

### 3. SocialGraph Program

**Program ID:** `EmKvmnfXrcgmcj4yT2K12rM2dMTZS2MMAfUB8769veHK`

#### 账户结构：MatchEdge
```rust
pub struct MatchEdge {
    pub user_a: Pubkey,                 // 32 bytes - 用户A (字典序小)
    pub user_b: Pubkey,                 // 32 bytes - 用户B (字典序大)
    pub created_at: i64,                // 8 bytes
    pub is_active: bool,                // 1 byte
    pub interaction_count: u32,         // 4 bytes - 互动次数
    pub deactivated_at: Option<i64>,    // 9 bytes
    pub bump: u8,                       // 1 byte
}
// 总大小: 95 bytes
```

#### PDA Seeds
```
["match_edge", min(user_a, user_b).as_ref(), max(user_a, user_b).as_ref()]
```

#### 指令
- `create_match_edge()` - 创建匹配边
- `update_match_edge()` - 更新匹配状态
- `verify_match()` - 验证匹配关系

#### 事件
- `MatchEdgeCreated` - 匹配创建
- `InteractionRecorded` - 互动记录
- `MatchEdgeDeactivated` - 匹配停用

#### 成本
- 创建匹配：~$0.0005
- 更新互动：~$0.0002

---

### 4. LearningBadge Program 🆕

**Program ID:** `LearningBadgeProgramID11111111111111111111`

#### 账户结构：BadgeCollection
```rust
pub struct BadgeCollection {
    pub owner: Pubkey,                  // 32 bytes
    pub total_badges: u16,              // 2 bytes
    pub total_cards_completed: u32,     // 4 bytes
    pub total_learning_days: u32,       // 4 bytes
    pub current_streak: u16,            // 2 bytes
    pub longest_streak: u16,            // 2 bytes
    pub last_learning_date: i64,        // 8 bytes
    pub bump: u8,                       // 1 byte
}
// 总大小: 63 bytes
```

#### 账户结构：LearningBadge
```rust
pub struct LearningBadge {
    pub owner: Pubkey,                  // 32 bytes
    pub badge_type: BadgeType,          // 1 byte
    pub milestone_value: u32,           // 4 bytes
    pub minted_at: i64,                 // 8 bytes
    pub non_transferable: bool,         // 1 byte
    pub bump: u8,                       // 1 byte
}
// 总大小: 55 bytes
```

#### 勋章类型
```rust
pub enum BadgeType {
    FirstCard,      // 完成第1张卡片
    Cards10,        // 完成10张
    Cards50,        // 完成50张
    Cards100,       // 完成100张
    Cards500,       // 完成500张
    Streak7,        // 连续学习7天
    Streak30,       // 连续学习30天
    Streak100,      // 连续学习100天
    EarlyAdopter,   // 早期用户
    Contributor,    // 贡献者
}
```

#### PDA Seeds
```
// Collection
["badge_collection", user_wallet.as_ref()]

// Badge
["learning_badge", user_wallet.as_ref(), badge_type]
```

#### 指令
- `initialize_badge_collection()` - 初始化勋章收藏
- `record_learning_session()` - 记录学习会话
- `mint_badge()` - 铸造勋章
- `get_achievements()` - 获取成就

#### 事件
- `LearningSessionRecorded` - 学习会话记录
- `BadgeMinted` - 勋章铸造

#### 成本
- 初始化收藏：~$0.01
- 记录会话：~$0.0003
- 铸造勋章：~$0.01

---

### 5. Mentorship Program 🆕

**Program ID:** `MentorshipProgramID1111111111111111111111`

#### 账户结构：MentorProfile
```rust
pub struct MentorProfile {
    pub mentor: Pubkey,                 // 32 bytes
    pub specialty: String,              // 4+100 bytes
    pub max_mentees: u8,                // 1 byte
    pub current_mentees: u8,            // 1 byte
    pub total_mentees_graduated: u16,   // 2 bytes
    pub reputation_score: u16,          // 2 bytes
    pub is_active: bool,                // 1 byte
    pub created_at: i64,                // 8 bytes
    pub bump: u8,                       // 1 byte
}
// 总大小: 160 bytes
```

#### 账户结构：Mentorship
```rust
pub struct Mentorship {
    pub mentor: Pubkey,                 // 32 bytes
    pub mentee: Pubkey,                 // 32 bytes
    pub goals: String,                  // 4+200 bytes
    pub status: MentorshipStatus,       // 1 byte
    pub sessions_completed: u16,        // 2 bytes
    pub mentee_progress_score: u8,      // 1 byte
    pub started_at: i64,                // 8 bytes
    pub last_session_at: Option<i64>,   // 9 bytes
    pub completed_at: Option<i64>,      // 9 bytes
    pub bump: u8,                       // 1 byte
}
// 总大小: 307 bytes
```

#### 关系状态
```rust
pub enum MentorshipStatus {
    Active,      // 进行中
    Completed,   // 已完成（毕业）
    Terminated,  // 已终止
}
```

#### PDA Seeds
```
// Mentor Profile
["mentor_profile", mentor_wallet.as_ref()]

// Mentorship
["mentorship", mentor_wallet.as_ref(), mentee_wallet.as_ref()]
```

#### 指令
- `initialize_mentor_profile()` - 初始化导师档案
- `create_mentorship()` - 创建师徒关系
- `record_session()` - 记录指导会话
- `update_mentee_progress()` - 更新学徒进度
- `complete_mentorship()` - 完成师徒关系
- `terminate_mentorship()` - 终止关系
- `get_mentor_stats()` - 获取导师统计

#### 事件
- `MentorProfileCreated` - 导师档案创建
- `MentorshipCreated` - 师徒关系创建
- `SessionRecorded` - 会话记录
- `MentorshipCompleted` - 关系完成
- `MentorshipTerminated` - 关系终止

#### 声望计算
```rust
- 每次高质量会话(评分>=4): +5
- 完成一个师徒关系: +50
- 每毕业一个学徒: 总声望上限+100
```

#### 成本
- 初始化导师档案：~$0.015
- 创建师徒关系：~$0.02
- 记录会话：~$0.0003

---

## 💾 链下数据结构（Supabase）

### 1. profiles 表
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  persona_nft_mint TEXT,              -- 链上 NFT mint 地址
  trust_score INTEGER DEFAULT 50,     -- 缓存的信誉分
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**用途：**
- 快速查询用户基本信息
- 缓存链上数据，减少 RPC 调用
- 关联其他链下表

---

### 2. personas 表
```sql
CREATE TABLE personas (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  risk_type TEXT NOT NULL,            -- Conservative/Balanced/Aggressive
  keywords TEXT[] NOT NULL,           -- 关键词数组（原文）
  description TEXT NOT NULL,          -- 描述（原文）
  ai_summary TEXT NOT NULL,           -- AI总结（原文）
  keywords_hash TEXT,                 -- 对应链上哈希
  ai_hash TEXT,                       -- 对应链上哈希
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**用途：**
- 存储人格详细文本（链上只存哈希）
- 支持全文搜索和关键词匹配
- 生成个性化推荐

---

### 3. swipes 表
```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  from_profile UUID REFERENCES profiles(id),
  to_profile UUID REFERENCES profiles(id),
  action TEXT CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_profile, to_profile)
);
```

**用途：**
- 记录滑动操作（高频操作，不上链）
- 匹配算法的数据源
- 防止重复滑动

---

### 4. matches 表
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user_a UUID REFERENCES profiles(id),
  user_b UUID REFERENCES profiles(id),
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  on_chain_tx TEXT,                   -- 链上交易哈希
  is_active BOOLEAN DEFAULT TRUE,
  CHECK (user_a < user_b)
);
```

**用途：**
- 快速查询匹配列表
- 关联链上和链下数据
- 支持实时通知

---

### 5. messages 表
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

**用途：**
- 存储聊天消息（大量数据，不上链）
- 支持 Supabase Realtime
- AI 内容审核

---

### 6. reports 表
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id),
  reported_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
```

**用途：**
- 用户举报系统
- 人工审核流程
- 触发链上惩罚

---

### 7. trust_score_history 表
```sql
CREATE TABLE trust_score_history (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  old_score INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**用途：**
- 信誉分变化历史
- 生成趋势图表
- 审计和分析

---

### 8. feed_interactions 表
```sql
CREATE TABLE feed_interactions (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  content_id TEXT NOT NULL,
  action TEXT CHECK (action IN ('view', 'complete', 'ask')),
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**用途：**
- 学习行为追踪
- 个性化推荐
- 数据分析

---

## 🔄 数据同步策略

### 链上 → 链下同步

#### 1. 事件监听（推荐）
```typescript
// 监听链上事件，实时同步到 Supabase
const connection = new Connection(RPC_URL);

connection.onLogs(
  programId,
  (logs) => {
    // 解析事件
    const event = parseEvent(logs);
    
    // 同步到 Supabase
    if (event.name === 'TrustScoreUpdated') {
      await supabase
        .from('profiles')
        .update({ trust_score: event.data.newScore })
        .eq('wallet_address', event.data.owner);
    }
  },
  'confirmed'
);
```

#### 2. 定时轮询（备用）
```typescript
// 每5分钟同步一次链上数据
setInterval(async () => {
  const users = await supabase
    .from('profiles')
    .select('wallet_address');
    
  for (const user of users) {
    const onChainScore = await getTrustScoreFromChain(user.wallet_address);
    
    await supabase
      .from('profiles')
      .update({ trust_score: onChainScore })
      .eq('wallet_address', user.wallet_address);
  }
}, 5 * 60 * 1000);
```

---

### 链下 → 链上同步

#### 1. 里程碑触发
```typescript
// 当用户达到里程碑，自动调用链上程序
async function recordLearningSession(userId: string, cardsCompleted: number) {
  // 1. 链下记录
  await supabase
    .from('feed_interactions')
    .insert({ profile_id: userId, action: 'complete', ... });
  
  // 2. 检查是否达到里程碑
  const stats = await getUserStats(userId);
  
  if (stats.totalCards === 10 || stats.totalCards === 50) {
    // 3. 调用链上程序记录
    await recordLearningOnChain(userWallet, cardsCompleted);
  }
}
```

#### 2. 批量上链
```typescript
// 每天凌晨批量更新链上数据
cron.schedule('0 0 * * *', async () => {
  const activeUsers = await getActiveUsersToday();
  
  for (const user of activeUsers) {
    const dailyStats = await getDailyStats(user.id);
    
    // 调用 record_learning_activity
    await updateLearningOnChain(
      user.wallet_address,
      dailyStats.cardsCompleted,
      dailyStats.engagementScore
    );
  }
});
```

---

## 📊 数据流示例

### 用户注册流程
```
1. 用户连接钱包
   ↓
2. [链上] 铸造 PersonaNFT
   └─ 成本: ~$0.01
   ↓
3. [链上] 初始化 TrustScore
   └─ 成本: ~$0.01
   ↓
4. [链下] 创建 Profile 记录
   └─ 存储: wallet_address, persona_nft_mint
   ↓
5. [链下] 创建 Persona 详细数据
   └─ 存储: keywords, description, ai_summary
```

---

### 学习卡片流程
```
1. 用户滑动卡片
   ↓
2. [链下] 记录 feed_interaction
   └─ 高频操作，不上链
   ↓
3. 累计到一定数量（如每10张）
   ↓
4. [链上] 调用 record_learning_session
   └─ 更新 badge_collection
   └─ 成本: ~$0.0003
   ↓
5. 达到里程碑（如完成50张）
   ↓
6. [链上] 铸造勋章 NFT
   └─ 成本: ~$0.01
   ↓
7. [链上] 更新 TrustScore
   └─ 成本: ~$0.00025
```

---

### 匹配流程
```
1. 用户滑动右（like）
   ↓
2. [链下] 记录 swipe
   └─ 高频操作，不上链
   ↓
3. 检测双向 like
   ↓
4. [链上] 创建 match_edge
   └─ 成本: ~$0.0005
   ↓
5. [链下] 创建 match 记录
   └─ 存储: on_chain_tx 哈希
   ↓
6. 发送匹配通知
```

---

### 聊天流程
```
1. 用户发送消息
   ↓
2. [链下] AI 内容审核
   └─ 检测诈骗、不当内容
   ↓
3. [链下] 存储 message
   └─ 大量数据，不上链
   ↓
4. 累计到一定数量（如每100条）
   ↓
5. [链上] 更新 match_edge.interaction_count
   └─ 成本: ~$0.0002
   ↓
6. [链上] 更新双方 TrustScore
   └─ 成本: ~$0.00025 × 2
```

---

## 🔐 安全考虑

### 链上安全
1. **PDA 设计** - 使用确定性地址，防止冲突
2. **权限检查** - 所有指令验证签名者
3. **账户验证** - 验证账户所有者是正确的程序
4. **溢出保护** - 使用 `saturating_add/sub`
5. **事件日志** - 所有重要操作发射事件

### 链下安全
1. **RLS（Row Level Security）** - Supabase 表级别权限
2. **API 认证** - JWT token 验证
3. **速率限制** - 防止滥用
4. **数据加密** - 敏感数据加密存储
5. **审计日志** - 记录所有重要操作

---

## 💰 成本优化

### 账户租金优化
```rust
// 优化账户大小
// 原始: 200 bytes → 优化: 128 bytes
// 节省租金: ~30%

// 使用 String 时指定最大长度
pub specialty: String,  // 预留 100 bytes

// 而不是
pub specialty: Vec<u8>,  // 不确定大小
```

### 批量操作
```typescript
// 不好: 每次操作都上链
for (const card of cards) {
  await recordLearningOnChain(card);
}

// 好: 批量更新
const totalCards = cards.length;
await recordLearningOnChain(totalCards);
```

### 缓存策略
```typescript
// 缓存链上数据，减少 RPC 调用
const cache = new Map<string, TrustScore>();

async function getTrustScore(wallet: string) {
  if (cache.has(wallet)) {
    return cache.get(wallet);
  }
  
  const score = await fetchFromChain(wallet);
  cache.set(wallet, score);
  return score;
}
```

---

## 📈 监控与分析

### 链上指标
- 总账户数（PersonaNFT, TrustScore等）
- 日活跃交易数
- 平均 gas 费用
- 事件发射频率

### 链下指标
- 数据库查询性能
- API 响应时间
- 同步延迟
- 存储使用量

### 同步健康度
- 链上链下数据一致性
- 同步失败率
- 重试次数
- 延迟时间

---

## 🚀 扩展性考虑

### 分片策略
```
当用户量增长，可以考虑：
- 按地区分片（不同的 Supabase 实例）
- 按用户 ID 哈希分片
- 热数据 vs 冷数据分离
```

### 索引服务
```
考虑使用专业的链上数据索引服务：
- The Graph（子图）
- Helius（Webhook）
- QuickNode（索引 API）
```

### 缓存层
```
Redis/Memcached:
- 热点数据缓存
- 查询结果缓存
- 速率限制计数
```

---

## 📝 总结

### 数据分布
- **链上（Solana）：** 5-10% 数据量，100% 核心价值
- **链下（Supabase）：** 90-95% 数据量，支撑高频操作

### 成本效益
- **每用户每月：** ~$0.05 链上成本
- **相比全链上：** 节省 70% 成本
- **相比全链下：** 增加 100% 可信度

### 关键优势
1. ✅ 核心价值数据上链，确保去中心化
2. ✅ 高频操作链下，确保用户体验
3. ✅ 成本可控，可持续运营
4. ✅ 灵活扩展，支持未来增长

---

**最后更新：** 2025-10-25  
**维护者：** Swiv Team




