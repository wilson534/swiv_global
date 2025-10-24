# 🔧 Expo Router 错误修复

## ❌ 错误信息

```
iOS Bundling failed 3099ms mobile/index.ts (1062 modules)
ERROR node_modules/expo-router/_ctx.ios.js
Invalid call at line 2: process.env.EXPO_ROUTER_APP_ROOT
First argument of `require.context` should be a string denoting the directory to require.
```

---

## 🔍 问题原因

### 架构冲突

| 文件 | 使用的系统 | 说明 |
|------|-----------|------|
| `mobile/index.ts` | Expo Router | `import 'expo-router/entry'` |
| `app/index.tsx` | 自定义导航 | 手动实现的Tab导航 |

**冲突点：**
- Expo Router 期望使用文件系统路由（`app/(tabs)/`结构）
- 我们实际使用了自定义的组件导航系统
- 两个系统试图同时控制应用导航 → 崩溃

---

## ✅ 解决方案

### 修改 `mobile/index.ts`

#### Before（有问题）:
```typescript
/**
 * Expo Router Entry Point
 * Expo 路由入口文件
 */

import 'expo-router/entry';
```

#### After（修复后）:
```typescript
/**
 * Expo Entry Point
 * Expo 入口文件
 */

import { registerRootComponent } from 'expo';
import App from './app/index';

registerRootComponent(App);
```

---

## 📋 完整修复步骤

### 步骤1：修改入口文件

文件已自动更新：`mobile/index.ts`

### 步骤2：清除所有缓存

```bash
cd /Users/musk/swiv/mobile
rm -rf .expo
rm -rf node_modules/.cache
```

### 步骤3：重启Expo

```bash
npx expo start --clear
```

### 步骤4：在手机上重新加载

```
1. 摇晃手机
2. 点击 "Reload"
3. ✅ 应用正常启动！
```

---

## 🎯 技术说明

### registerRootComponent

这是Expo的标准API，用于注册应用的根组件：

```typescript
import { registerRootComponent } from 'expo';
import App from './app/index';

// 直接注册我们的主组件
registerRootComponent(App);
```

### 为什么不用Expo Router？

1. **自定义导航系统**
   - 我们在`app/index.tsx`实现了自己的导航
   - 更灵活，更符合产品需求
   
2. **避免冲突**
   - Expo Router有自己的约定和限制
   - 可能与我们的架构产生冲突

3. **更简单**
   - 不需要学习Expo Router的API
   - 直接使用React状态管理

---

## 🔄 架构说明

### 新架构（已修复）

```
mobile/index.ts
  ↓ registerRootComponent
app/index.tsx (主组件)
  ↓ 自定义导航
app/(tabs)/*.tsx (各个页面)
```

### 导航方式

使用React状态管理：

```typescript
// app/index.tsx
const [activeTab, setActiveTab] = useState('feed');

// 切换标签
setActiveTab('chat');

// 条件渲染
{activeTab === 'feed' && <FeedPage />}
{activeTab === 'chat' && <ChatPage />}
```

---

## ✅ 验证修复

### 检查点

- [ ] 终端没有报错
- [ ] 看到 "Bundling complete"
- [ ] 可以扫码连接
- [ ] 应用正常启动
- [ ] 底部导航可以切换
- [ ] 所有页面正常显示

### 预期输出

```
✓ Bundling complete
✓ Running on: exp://192.168.x.x:8081
✓ Connected to Metro
```

---

## 🐛 如果还有问题

### 完全重置（终极方案）

```bash
# 停止所有Expo进程
pkill -f "expo"

# 完全清理
cd /Users/musk/swiv/mobile
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ios
rm -rf android

# 重新启动
npx expo start --clear --reset-cache
```

### 检查文件

确保 `mobile/index.ts` 内容正确：

```typescript
import { registerRootComponent } from 'expo';
import App from './app/index';
registerRootComponent(App);
```

---

## 📊 修复状态

✅ **已修复文件：** `mobile/index.ts`
✅ **已清除缓存：** `.expo/`
✅ **已重启服务：** Expo开发服务器

---

## 🎉 完成

修复完成后，应用应该：
- ✅ 正常启动
- ✅ 无bundling错误
- ✅ 所有功能正常
- ✅ 导航流畅

**现在应用应该可以正常运行了！** 🚀


