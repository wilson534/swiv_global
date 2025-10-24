# 🗄️ Supabase 设置指南 / Supabase Setup Guide

**账号信息：** 3098848445@qq.com (wilson534)

---

## 📋 步骤 1：创建 Supabase 项目

### 1. 访问 Supabase
打开浏览器，访问：https://supabase.com/dashboard

### 2. 登录
- 使用邮箱：3098848445@qq.com
- 或用户名：wilson534

### 3. 创建新项目
1. 点击 "New Project" 按钮
2. 填写项目信息：

```
Organization: 选择或创建 "Personal"
Project Name: swiv-dev
Database Password: [自动生成，请保存！]
Region: Northeast Asia (Seoul) 或就近选择
```

3. 点击 "Create new project"
4. 等待 2-3 分钟，项目创建中...

---

## 📋 步骤 2：获取 API 密钥

### 1. 进入项目设置
项目创建完成后，点击左下角 ⚙️ **Settings**

### 2. 找到 API
在左侧菜单选择 **API**

### 3. 复制密钥
你会看到：

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请复制这三个值！**

---

## 📋 步骤 3：更新环境变量

### API 环境变量
编辑文件：`/Users/musk/swiv/api/.env.local`

找到 Supabase 部分，填入：
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Mobile 环境变量
编辑文件：`/Users/musk/swiv/mobile/.env`

找到 Supabase 部分，填入：
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 步骤 4：创建数据库表

### 1. 打开 SQL Editor
在 Supabase Dashboard 左侧菜单，点击 **SQL Editor**

### 2. 新建查询
点击 **New query**

### 3. 复制 SQL
打开文件：`/Users/musk/swiv/docs/supabase_schema.sql`

全选复制所有内容（322 行）

### 4. 粘贴并执行
将 SQL 粘贴到编辑器中，点击右下角 **Run** 按钮

### 5. 验证
执行成功后，点击左侧 **Table Editor**，应该看到 8 张表：
- ✅ profiles
- ✅ personas
- ✅ swipes
- ✅ matches
- ✅ messages
- ✅ reports
- ✅ trust_score_history
- ✅ feed_interactions

---

## 📋 步骤 5：启用 Realtime

### 1. 进入 Database 设置
左侧菜单 **Database** → **Replication**

### 2. 启用 messages 表
找到 `messages` 表，点击右侧的开关，启用 Realtime

这样聊天功能就可以实时更新了！

---

## ✅ 完成检查

运行以下命令验证：

```bash
# 在 SQL Editor 中执行
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

应该返回 8 张表。

---

## 🎉 完成！

现在你的 Supabase 已经配置完成！

**下一步：** 更新环境变量文件后，重启开发服务器：

```bash
# API
cd /Users/musk/swiv/api
npm run dev

# Mobile
cd /Users/musk/swiv/mobile
npx expo start
```

---

**创建时间：** 2025-10-24
**账号：** wilson534 (3098848445@qq.com)
**状态：** ⏳ 等待创建项目


