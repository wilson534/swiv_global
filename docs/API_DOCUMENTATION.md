# 📡 Swiv API 文档 / API Documentation

**Base URL (Development):** `http://localhost:3000`
**Base URL (Production):** TBD

---

## 🔐 认证 / Authentication

目前 API 不需要认证，但每个请求需要提供钱包地址进行身份识别。

---

## 📋 端点列表 / Endpoints

### 1. 创建 PersonaNFT / Create PersonaNFT

**POST** `/api/persona`

创建用户的投资人格并准备铸造 NFT。

**请求体：**
```json
{
  "walletAddress": "7xKXtg2CW87d97X7C5cLZCePTF6nxNFWbPL6qpVGKqYg",
  "answers": {
    "goal": "grow",
    "risk": "medium",
    "knowledge": "intermediate",
    "interest": "defi"
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "persona": {
      "riskType": "Balanced",
      "keywords": ["DeFi", "Staking", "Yield"],
      "description": "平衡型投资者，关注 DeFi 生态",
      "aiSummary": "您是一位理性的投资者...",
      "keywordsHash": "abc123...",
      "aiHash": "def456..."
    },
    "mint": {
      "transaction": "...",
      "signature": "..."
    }
  }
}
```

---

### 2. 获取 PersonaNFT / Get PersonaNFT

**GET** `/api/persona?walletAddress={address}`

查询用户的 PersonaNFT 信息。

**参数：**
- `walletAddress` (required): Solana 钱包地址

**响应：**
```json
{
  "success": true,
  "data": {
    "wallet": "7xKXtg2...",
    "persona": {
      "riskType": "Balanced",
      "keywords": ["DeFi", "Staking"],
      "description": "...",
      "createdAt": "2025-10-24T10:00:00Z"
    },
    "nftMint": "...",
    "trustScore": 75
  }
}
```

---

### 3. 获取学习内容 / Get Feed

**GET** `/api/feed?walletAddress={address}&offset={n}&limit={n}`

获取个性化学习内容流。

**参数：**
- `walletAddress` (required): 钱包地址
- `offset` (optional): 偏移量，默认 0
- `limit` (optional): 数量，默认 10，最大 50

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "card_001",
      "title": "什么是 DeFi？",
      "content": "去中心化金融（DeFi）是...",
      "category": "基础知识",
      "difficulty": "beginner",
      "estimatedTime": 3
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "hasMore": true
  }
}
```

---

### 4. 获取匹配候选 / Get Match Candidates

**GET** `/api/match?walletAddress={address}&limit={n}`

获取推荐的匹配候选用户。

**参数：**
- `walletAddress` (required): 钱包地址
- `limit` (optional): 数量，默认 20，最大 100

**响应：**
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "id": "user_001",
        "walletAddress": "8yZXt...",
        "persona": {
          "riskType": "Balanced",
          "keywords": ["DeFi", "NFT"],
          "description": "..."
        },
        "trustScore": 80,
        "matchScore": 88
      }
    ]
  }
}
```

---

### 5. 发送滑动操作 / Send Like Action

**POST** `/api/like`

记录用户的滑动操作（喜欢或跳过）。

**请求体：**
```json
{
  "fromWallet": "7xKXtg2...",
  "toWallet": "8yZXt...",
  "action": "like"
}
```

**响应（未匹配）：**
```json
{
  "success": true,
  "match": false,
  "message": "已喜欢 / Liked"
}
```

**响应（匹配成功）：**
```json
{
  "success": true,
  "match": true,
  "message": "匹配成功！/ It's a match!",
  "data": {
    "matchId": "match_001",
    "matchedAt": "2025-10-24T10:30:00Z",
    "onChainTx": "..."
  }
}
```

---

### 6. AI 问答 / Ask AI

**POST** `/api/ask`

向 AI 助手提问。

**请求体：**
```json
{
  "walletAddress": "7xKXtg2...",
  "question": "什么是流动性挖矿？",
  "context": "当前正在学习 DeFi 基础知识"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "answer": "流动性挖矿（Liquidity Mining）是一种...",
    "sources": ["DeFi Tutorial", "Uniswap Docs"],
    "relatedTopics": ["AMM", "Yield Farming"]
  }
}
```

---

## 🚨 错误处理 / Error Handling

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "error": "错误描述 / Error description"
}
```

### HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 速率限制 |
| 500 | 服务器错误 |

---

## 🔒 速率限制 / Rate Limiting

**限制：** 60 请求/分钟/IP

超出限制时返回 HTTP 429：

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

---

## 📊 匹配算法说明 / Matching Algorithm

匹配分数计算公式：

```
matchScore = 0.5 × keywordSimilarity 
           + 0.3 × riskTypeMatch 
           + 0.2 × trustScoreNorm
```

**关键词相似度（50% 权重）：**
- 使用 Jaccard 相似度
- `intersection / union`

**风险类型匹配（30% 权重）：**
- 相同：1.0
- 相邻：0.5
- 相差两级：0.2

**信誉分归一化（20% 权重）：**
- 分数越接近且越高，匹配度越高
- `(1 - |scoreA - scoreB| / 100) × 0.6 + (scoreA + scoreB) / 200 × 0.4`

---

## 🔄 实时更新 / Real-time Updates

聊天消息使用 Supabase Realtime：

```typescript
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `match_id=eq.${matchId}`
  }, payload => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

---

## 📝 Changelog

### v1.0.0 (2025-10-24)
- ✅ 初始 API 设计
- ✅ 所有核心端点实现
- ✅ 匹配算法实现
- ✅ AI 集成

---

**维护者：** @Musketeer
**最后更新：** 2025-10-24




