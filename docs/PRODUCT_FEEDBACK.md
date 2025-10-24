# 📋 产品反馈 - 用户需求

**时间：** 2025-10-24 凌晨
**来源：** 用户实际测试反馈

---

## 🎯 核心反馈

### 1️⃣ Feed 页面体验问题

**当前状态：**
- 传统的列表式滚动
- 一页显示多张卡片
- 内容是预制的（6张固定卡片）

**用户期望：**
- ✅ **像 TikTok 一样的上下滑动体验**
- ✅ 每次滑动切换到新的全屏卡片
- ✅ 内容应该是 **AI 实时生成**，而不是预制数据

**实现计划：**
- [ ] 重新设计 Feed 页面为全屏垂直滑动卡片
- [ ] 集成滑动手势（react-native-gesture-handler）
- [ ] 实现 AI 实时内容生成 API
- [ ] 无限滚动（向下滑动加载新内容）

---

### 2️⃣ AI 问答体验问题

**当前状态：**
- 使用 `Alert.prompt` 弹窗输入
- 回答显示在 Alert 中
- 无法保存对话历史

**用户期望：**
- ✅ **独立的对话界面**（像 ChatGPT 一样）
- ✅ 完整的聊天体验
- ✅ 可以看到对话历史

**实现计划：**
- [ ] 创建专门的 AI 对话页面（`app/ai-chat.tsx`）
- [ ] 实现聊天 UI（消息气泡、输入框）
- [ ] 保存对话历史
- [ ] 支持多轮对话

---

## 🎨 新设计方案

### Feed 页面（TikTok 式）

```
┌─────────────────────┐
│   [全屏卡片 1]       │
│                     │
│   什么是 DeFi？     │
│                     │
│   内容...           │
│                     │
│   [问 AI] [完成]    │
│                     │
│   ↓ 向上滑动        │
└─────────────────────┘
        ↓
┌─────────────────────┐
│   [全屏卡片 2]       │
│                     │
│   NFT 投资策略      │
│                     │
│   内容...           │
│                     │
│   [问 AI] [完成]    │
│                     │
│   ↓ 向上滑动        │
└─────────────────────┘
```

### AI 对话界面

```
┌─────────────────────┐
│  ← AI 助手           │
├─────────────────────┤
│                     │
│  你: DeFi是什么？   │
│                     │
│  AI: DeFi是去中心... │
│                     │
│  你: 有什么风险？   │
│                     │
│  AI: 主要风险包括... │
│                     │
├─────────────────────┤
│  [输入框] [发送]    │
└─────────────────────┘
```

---

## 🔄 AI 实时生成内容

### 新的 Feed API 逻辑

```typescript
// 不再返回预制卡片
// 而是根据用户人格实时生成

POST /api/feed/generate
{
  walletAddress: "xxx",
  personaType: "Balanced", 
  previousTopics: ["DeFi", "NFT"]
}

Response:
{
  id: "generated_123",
  title: "AI 生成的标题",
  content: "AI 生成的内容...",
  category: "根据用户兴趣推荐",
  // ...
}
```

---

## 📊 优先级

| 功能 | 优先级 | 预计时间 |
|------|--------|----------|
| TikTok 式滑动 | 🔴 高 | 1-2 小时 |
| AI 对话界面 | 🔴 高 | 1 小时 |
| AI 实时生成内容 | 🟡 中 | 2-3 小时 |

---

## 🎯 技术实现

### 1. TikTok 式滑动
**库：** `react-native-gesture-handler` + `react-native-reanimated`

**核心代码：**
```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const gesture = Gesture.Pan()
  .onUpdate((e) => {
    // 处理滑动
  })
  .onEnd(() => {
    // 切换卡片
  });
```

### 2. AI 对话界面
**组件：** Gifted Chat 或自定义聊天 UI

**路由：** `app/ai-chat/[contentId].tsx`

### 3. AI 实时生成
**API：** `POST /api/feed/generate`

**逻辑：**
- 调用 OpenAI 根据用户人格生成标题和内容
- 缓存生成的内容避免重复
- 个性化推荐

---

**状态：** 📝 已记录，准备实现
**下一步：** 立即重构 Feed 页面


