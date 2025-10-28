# 🔧 网络连接问题修复

**问题：** Network request failed
**原因：** 移动应用无法访问 `localhost:3000`

---

## 📱 为什么会出现这个问题？

在移动开发中：
- `localhost` = 手机本身
- 需要使用**电脑的局域网 IP 地址**

从终端看到：
- API 服务器：`http://192.168.5.56:3000` ✅
- Expo 服务器：`exp://192.168.5.56:8085` ✅

**正确的 API URL 应该是：`http://192.168.5.56:3000`**

---

## ✅ 已修复

### 代码修改
`mobile/app/(tabs)/feed.tsx` 中：
```typescript
// 之前
const API_URL = 'http://localhost:3000';

// 现在
const API_URL = 'http://192.168.5.56:3000';
```

---

## 🔧 还需要做（重要！）

### 手动编辑 `.env` 文件

由于 `.env` 文件被 globalIgnore 保护，需要您手动编辑：

**文件位置：** `/Users/musk/swiv/mobile/.env`

**请将第一行改为：**
```bash
EXPO_PUBLIC_API_URL=http://192.168.5.56:3000
```

**完整内容应该是：**
```bash
# API Gateway
EXPO_PUBLIC_API_URL=http://192.168.5.56:3000

# Solana Configuration
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
EXPO_PUBLIC_SOLANA_NETWORK=devnet

# Program IDs
EXPO_PUBLIC_PERSONA_NFT_PROGRAM_ID=JARiuuCE7xEkfk99bfQPQvJBjfY3btMxTuEKQ8ArzfQ9
EXPO_PUBLIC_TRUST_SCORE_PROGRAM_ID=3FWDkwEPfVVZmxXS4f3pDaJpg4qf7GL5ir89DtXSwAjR
EXPO_PUBLIC_SOCIAL_GRAPH_PROGRAM_ID=EmKvmnfXrcgmcj4yT2K12rM2dMTZS2MMAfUB8769veHK

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://qjvexoyuqsvowkqwlyci.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdmV4b3l1cXN2b3drcXdseWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyODcwMjIsImV4cCI6MjA3Njg2MzAyMn0.4q7yzSEWu6C7o61gUS9d4n0QZkGN5TZLp5wDZZHdcKE
```

---

## 🔄 修复后的操作

1. **在手机上重新加载应用**
   - 摇晃手机
   - 点击 "Reload"

2. **应该能看到**
   - ✅ Loading 动画
   - ✅ 3-5 秒后出现 3 张学习卡片
   - ✅ AI 问答功能正常工作

---

## 🛠️ 如果还是不行

### 检查 API 服务器
在终端运行：
```bash
curl http://192.168.5.56:3000/api/feed?walletAddress=test&offset=0&limit=3
```

**应该返回 JSON 数据。**

### 检查防火墙
确保防火墙没有阻止端口 3000。

---

**最后更新：** 2025-10-24 凌晨
**状态：** 代码已修复，等待 .env 文件更新




