# 🚀 Solana Playground 部署步骤（15分钟）

## 📋 准备工作（已完成）

✅ 代码已准备好：`SOLANA_PLAYGROUND_CODE.rs`  
✅ 步骤说明已准备好：本文档

---

## 🎯 开始部署（跟着做）

### 步骤 1：打开 Solana Playground（2分钟）

1. **打开浏览器**，访问：
   ```
   https://beta.solpg.io/
   ```

2. **连接钱包**：
   - 右上角点击 "Connect"
   - 会自动创建一个 Playground 钱包
   - 看到钱包地址（类似：7xKXtg...）

3. **获取测试 SOL**：
   - 点击钱包地址旁边的 "⬇️" 图标（Airdrop）
   - 或者点击底部的 "Airdrop" 按钮
   - 等待几秒，余额变成 ~5 SOL

---

### 步骤 2：创建项目（3分钟）

1. **创建新项目**：
   - 左上角点击 "+" 或 "Create a new project"
   - 选择 "Anchor" 框架
   - 项目名输入：`trust-score`
   - 点击 "Create"

2. **删除默认代码**：
   - 在左侧文件树找到 `src/lib.rs`
   - 点击打开
   - 全选删除所有代码（Cmd+A, Delete）

3. **粘贴新代码**：
   - 在本地打开：`SOLANA_PLAYGROUND_CODE.rs`
   - 复制所有内容（Cmd+A, Cmd+C）
   - 回到 Playground，粘贴（Cmd+V）
   - 代码会自动保存（看到左上角 "Saved"）

---

### 步骤 3：编译程序（2分钟）

1. **点击 Build**：
   - 左侧工具栏找到 "🔨" 图标（Build）
   - 点击它
   - 等待编译...（约1-2分钟）

2. **检查结果**：
   - 底部终端会显示编译进度
   - 看到绿色的 "✅ Build successful" 
   - 如果有错误，告诉我具体错误信息

**预期输出：**
```
Building...
Build successful. Completed in 45s.
```

---

### 步骤 4：部署程序（2分钟）

1. **确认网络**：
   - 右上角确认显示 "Devnet"
   - 如果不是，点击切换到 "Devnet"

2. **部署**：
   - 点击 "🚀" 图标（Deploy）
   - 等待部署...（约30秒-1分钟）
   - 会自动从你的钱包扣除部署费用（约0.002 SOL）

3. **获取程序 ID**：
   - 底部终端会显示：
   ```
   ✅ Deployment successful
   Program Id: 5XyZ8Abc123def456ghi789...
   ```
   - **重要：复制这个 Program Id！**

---

### 步骤 5：验证部署（1分钟）

**在 Solana Explorer 查看：**

1. 打开浏览器新标签
2. 访问：
   ```
   https://explorer.solana.com/address/你的程序ID?cluster=devnet
   ```
3. 应该看到：
   - ✅ Program Account
   - ✅ Executable: Yes
   - ✅ Balance: ~0.00114 SOL

---

### 步骤 6：更新你的项目（5分钟）

#### 6.1 更新 API 配置

**打开文件：** `/Users/musk/swiv/api/app/api/onchain-stats/route.ts`

**找到第 11-17 行：**
```typescript
const PROGRAM_IDS = {
  personaNft: 'JARiuuCE7xEkfk99bfQPQvJBjfY3btMxTuEKQ8ArzfQ9',
  trustScore: '3FWDkwEPfVVZmxXS4f3pDaJpg4qf7GL5ir89DtXSwAjR',  // ← 改这里
  socialGraph: 'EmKvmnfXrcgmcj4yT2K12rM2dMTZS2MMAfUB8769veHK',
  learningBadge: 'BzpCwsmnX67zksx1BFgaDq1cmgK877WhtKgowiDQ4yAH',
  mentorship: '2FBJhP2ecw24W6wpAYF5v42uiPWZB38ubRLyfKyaDVwt',
};
```

**替换为：**
```typescript
const PROGRAM_IDS = {
  personaNft: 'JARiuuCE7xEkfk99bfQPQvJBjfY3btMxTuEKQ8ArzfQ9',
  trustScore: '你复制的程序ID',  // ← 粘贴你的程序 ID
  socialGraph: 'EmKvmnfXrcgmcj4yT2K12rM2dMTZS2MMAfUB8769veHK',
  learningBadge: 'BzpCwsmnX67zksx1BFgaDq1cmgK877WhtKgowiDQ4yAH',
  mentorship: '2FBJhP2ecw24W6wpAYF5v42uiPWZB38ubRLyfKyaDVwt',
};
```

#### 6.2 重启 API 服务

**在终端运行：**
```bash
# 如果 API 正在运行，按 Ctrl+C 停止
cd /Users/musk/swiv/api
npm run dev
```

#### 6.3 重新加载移动端

**在 Expo 终端：**
```bash
# 按 'r' 键重新加载
```

---

## 🎉 完成！验证结果

### 在移动端查看

1. 打开 "成长" 页面
2. 查看 "🛡️ 链上信誉分" 卡片
3. 底部应该显示链上账户地址

### 在终端查看日志

**API 终端应该显示：**
```
✅ 链上数据加载成功，数据来源: blockchain
```

**而不是：**
```
⚠️ 链上数据获取失败，返回演示数据
```

---

## ❓ 遇到问题？

### 问题1：编译失败

**常见错误：**
```
error: could not compile `trust-score`
```

**解决方案：**
- 检查代码是否完整复制
- 确保没有多余的字符
- 重新复制粘贴

### 问题2：部署失败 - 余额不足

**错误信息：**
```
Error: Insufficient funds
```

**解决方案：**
- 点击 "Airdrop" 按钮多几次
- 等待余额更新到 5+ SOL

### 问题3：部署失败 - 网络问题

**解决方案：**
- 检查右上角是否选择 "Devnet"
- 刷新页面重试
- 等待几分钟后重试

### 问题4：API 还是显示演示数据

**检查清单：**
- ✅ 程序 ID 是否正确更新
- ✅ API 服务是否重启
- ✅ 移动端是否重新加载
- ✅ 等待3-5秒让数据加载

---

## 📊 成功标志

### ✅ 完全成功：

1. Solana Explorer 能看到程序
2. API 日志显示 "blockchain" 数据源
3. 移动端显示真实链上数据
4. 没有 "演示数据" 标签

### ⚠️ 部分成功：

1. 程序部署成功
2. 但 API 还是显示演示数据
3. 可能需要调试 API 配置

### ❌ 失败：

1. 编译或部署失败
2. 告诉我具体错误信息
3. 我会帮你解决

---

## 🎯 下一步（可选）

### 如果想部署更多程序

使用同样的步骤，依次部署：
1. PersonaNFT
2. LearningBadge  
3. Mentorship

但是！只有 TrustScore 就已经很好了！

### 测试链上交互

在 Solana Playground 中：
1. 点击 "Test" 标签
2. 可以调用 `initialize` 和 `update_score`
3. 在 Explorer 中看到交易

---

## 🎉 恭喜！

**你现在有了：**
- ✅ 真实的链上智能合约
- ✅ 可验证的程序 ID
- ✅ Solana Devnet 上的记录
- ✅ 完整的演示系统

**准备好参加黑客松了！** 🏆

---

## 📝 记录你的程序 ID

**TrustScore 程序 ID：**
```
____________________________________

（把你的程序 ID 写在这里）
```

**部署时间：**
```
2024年10月25日 晚上 10:__
```

**Solana Explorer 链接：**
```
https://explorer.solana.com/address/你的程序ID?cluster=devnet
```

---

**现在就开始吧！打开 https://beta.solpg.io/ 🚀**




