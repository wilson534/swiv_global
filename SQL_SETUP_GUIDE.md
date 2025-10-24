# 🗄️ 执行 SQL 架构脚本指南

**Supabase 项目 ID:** qjvexoyuqsvowkqwlyci  
**状态:** ⏳ 需要执行 SQL 脚本

---

## 📋 步骤：在 Supabase 中执行 SQL

### 1️⃣ 打开 SQL Editor

点击以下链接直接访问 SQL Editor：

**https://supabase.com/dashboard/project/qjvexoyuqsvowkqwlyci/sql/new**

或者：
1. 访问项目主页：https://supabase.com/dashboard/project/qjvexoyuqsvowkqwlyci
2. 点击左侧菜单的 **SQL Editor**
3. 点击 **New query** 按钮

---

### 2️⃣ 复制 SQL 脚本

打开文件：`/Users/musk/swiv/docs/supabase_schema.sql`

或者运行以下命令查看脚本内容：

```bash
cat /Users/musk/swiv/docs/supabase_schema.sql
```

**全选复制所有内容**（322 行 SQL 代码）

---

### 3️⃣ 粘贴并执行

1. 在 SQL Editor 中粘贴脚本
2. 点击右下角的 **Run** 按钮（或按 `Cmd + Enter`）
3. 等待执行完成（约 5-10 秒）

---

### 4️⃣ 验证表已创建

执行成功后，验证表：

#### 方法 A：在 SQL Editor 中运行
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

应该看到 8 张表：
- ✅ feed_interactions
- ✅ matches
- ✅ messages
- ✅ personas
- ✅ profiles
- ✅ reports
- ✅ swipes
- ✅ trust_score_history

#### 方法 B：查看 Table Editor
1. 点击左侧菜单的 **Table Editor**
2. 应该看到上述 8 张表

---

### 5️⃣ 启用 Realtime（可选但推荐）

为了让聊天功能实时更新：

1. 点击左侧菜单 **Database** → **Replication**
2. 找到 `messages` 表
3. 点击右侧的开关，启用 Realtime
4. 点击 **Save**

---

## ✅ 完成后的确认

执行以下检查确保一切正常：

### 检查清单
- [ ] 8 张表都已创建
- [ ] RLS 策略已启用
- [ ] 触发器已创建
- [ ] 索引已创建
- [ ] `messages` 表的 Realtime 已启用

---

## 🚨 常见问题

### Q: 执行时报错 "already exists"
**A:** 表已经存在，可以忽略。或者先删除表再重新执行。

### Q: 执行时报权限错误
**A:** 确保您使用的是项目的 Owner 账号登录。

### Q: 看不到表
**A:** 刷新页面，或切换到 Table Editor 查看。

---

## 🎉 完成 SQL 配置后

执行完 SQL 脚本后，您的项目就 **100% 配置完成** 了！

### 下一步：启动项目测试

```bash
# Terminal 1: 启动 API
cd /Users/musk/swiv/api
npm run dev

# Terminal 2: 启动 Mobile
cd /Users/musk/swiv/mobile
npx expo start
```

---

## 📞 需要帮助？

如果遇到问题，请提供：
1. 错误截图
2. 执行的 SQL 语句
3. 浏览器控制台的错误信息

---

**创建时间:** 2025-10-24  
**状态:** ⏳ 等待执行 SQL


