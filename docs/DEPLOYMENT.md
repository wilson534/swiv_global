# 🚀 Swiv 部署指南 / Deployment Guide

完整的生产环境部署指南。

---

## 📋 部署前检查清单 / Pre-deployment Checklist

### ✅ 必须完成
- [ ] 所有测试通过
- [ ] 环境变量已配置
- [ ] Solana 程序已部署到 devnet/mainnet
- [ ] Supabase 数据库已设置
- [ ] OpenAI API 密钥已获取
- [ ] 域名已准备（如需要）

### ⚠️ 安全检查
- [ ] 私钥和敏感信息不在代码库中
- [ ] RLS 策略已启用
- [ ] API 速率限制已配置
- [ ] CORS 策略已正确设置

---

## 1️⃣ 部署 Solana 程序 / Deploy Solana Programs

### 配置网络

```bash
# Devnet（测试）
solana config set --url devnet

# Mainnet-beta（生产）
solana config set --url mainnet-beta
```

### 构建程序

```bash
cd /Users/musk/swiv
anchor build
```

### 部署

```bash
# Devnet
anchor deploy --provider.cluster devnet

# Mainnet（需要充足的 SOL）
anchor deploy --provider.cluster mainnet-beta
```

### 记录程序 ID

部署后会获得三个程序 ID，需要更新到环境变量：

```bash
# 示例输出
Program Id: personaNft: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
Program Id: trustScore: 8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR2
Program Id: socialGraph: 9yQMPvNNpkGhkCGrZaXTvCwcaWFaBw5xXKRaKQfkQU7h
```

### 更新配置

更新 `Anchor.toml`：

```toml
[programs.mainnet]
persona_nft = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
trust_score = "8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR2"
social_graph = "9yQMPvNNpkGhkCGrZaXTvCwcaWFaBw5xXKRaKQfkQU7h"
```

更新环境变量文件。

---

## 2️⃣ 部署 API / Deploy API Service

### 使用 Vercel（推荐）

#### 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 部署

```bash
cd api
vercel --prod
```

#### 配置环境变量

在 Vercel Dashboard 中设置：

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PERSONA_NFT_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
TRUST_SCORE_PROGRAM_ID=8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR2
SOCIAL_GRAPH_PROGRAM_ID=9yQMPvNNpkGhkCGrZaXTvCwcaWFaBw5xXKRaKQfkQU7h
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 使用 Railway（备选）

#### 连接仓库

1. 访问 https://railway.app
2. 连接 GitHub 仓库
3. 选择 `api` 目录
4. 配置环境变量
5. 部署

#### 自定义域名

在 Railway 中配置自定义域名：
- api.swiv.app

---

## 3️⃣ 部署移动端 / Deploy Mobile App

### iOS (App Store)

#### 准备

```bash
cd mobile
eas build --platform ios --profile production
```

#### 提交

```bash
eas submit --platform ios
```

#### 需要
- Apple Developer 账号 ($99/年)
- App Store Connect 配置
- 图标和截图

### Android (Google Play)

#### 准备

```bash
eas build --platform android --profile production
```

#### 提交

```bash
eas submit --platform android
```

#### 需要
- Google Play Developer 账号 ($25 一次性)
- 签名密钥
- 应用截图

### 内部测试（TestFlight / Internal Testing）

#### iOS

```bash
eas build --platform ios --profile preview
eas submit --platform ios --latest
```

#### Android

```bash
eas build --platform android --profile preview
eas submit --platform android --latest
```

---

## 4️⃣ 配置 Supabase / Configure Supabase

### 生产数据库

1. 访问 https://supabase.com/dashboard
2. 创建新项目（生产环境）
3. 执行 `docs/supabase_schema.sql`
4. 配置 RLS 策略
5. 启用 Realtime
6. 配置备份计划

### 迁移数据（如需要）

```bash
# 导出 devnet 数据
pg_dump -h ... -U ... -d ... > backup.sql

# 导入到生产
psql -h ... -U ... -d ... < backup.sql
```

---

## 5️⃣ 监控和日志 / Monitoring & Logging

### Sentry（错误追踪）

#### 安装

```bash
# API
cd api && npm install @sentry/nextjs

# Mobile
cd mobile && npx expo install @sentry/react-native
```

#### 配置

```typescript
// api/sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### PostHog（用户分析）

```bash
npm install posthog-js
```

```typescript
import posthog from 'posthog-js';

posthog.init('YOUR_API_KEY', {
  api_host: 'https://app.posthog.com'
});
```

### Grafana（性能监控）

配置 API 指标收集：

```typescript
// 记录 API 响应时间
const start = Date.now();
// ... API 逻辑
const duration = Date.now() - start;
console.log(`API ${endpoint} took ${duration}ms`);
```

---

## 6️⃣ CI/CD 配置 / CI/CD Setup

### GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  deploy-mobile:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: cd mobile && eas build --platform all --non-interactive
```

---

## 7️⃣ 域名和 SSL / Domain & SSL

### 配置域名

#### API
- api.swiv.app → Vercel
- 自动 SSL（Let's Encrypt）

#### 移动端
- 应用内使用 HTTPS API URL

### DNS 配置

```
A     api.swiv.app     76.76.21.21 (Vercel IP)
CNAME www.swiv.app    cname.vercel-dns.com
```

---

## 8️⃣ 备份策略 / Backup Strategy

### 数据库备份

#### 每日自动备份（Supabase）
- 保留 7 天
- 自动化恢复点

#### 手动备份

```bash
# 导出数据库
pg_dump -h ... > backup-$(date +%Y%m%d).sql

# 上传到 S3
aws s3 cp backup-$(date +%Y%m%d).sql s3://swiv-backups/
```

### 程序代码

- GitHub 仓库作为主备份
- 标记版本 tag
- 发布前创建 release

---

## 9️⃣ 回滚计划 / Rollback Plan

### API 回滚

```bash
# Vercel 回滚到上一版本
vercel rollback
```

### Solana 程序回滚

⚠️ **警告：** Solana 程序无法回滚，只能部署新版本。

**建议：**
1. 在 devnet 充分测试
2. 使用可升级程序架构
3. 保留旧程序 ID 作为备份

### 移动端回滚

- iOS: 在 App Store Connect 中回滚
- Android: 在 Google Play 中回滚

---

## 🔟 生产环境检查 / Production Checklist

### 部署后验证

- [ ] API 健康检查通过
- [ ] 移动端可以正常登录
- [ ] PersonaNFT 铸造功能正常
- [ ] 匹配功能正常
- [ ] 聊天功能正常
- [ ] 信誉分更新正常

### 性能测试

```bash
# API 压力测试
ab -n 1000 -c 10 https://api.swiv.app/api/feed
```

### 安全测试

- [ ] SQL 注入测试
- [ ] XSS 测试
- [ ] CSRF 测试
- [ ] 速率限制测试

---

## 📞 问题排查 / Troubleshooting

### API 无响应

1. 检查 Vercel 日志
2. 检查环境变量
3. 检查 Solana RPC 连接
4. 检查数据库连接

### 移动端无法连接

1. 检查 API URL 配置
2. 检查网络权限
3. 检查 SSL 证书

### 交易失败

1. 检查钱包余额
2. 检查程序 ID
3. 检查 Solana 网络状态
4. 查看 Solana Explorer

---

## 📈 扩展计划 / Scaling Plan

### 水平扩展

- Vercel 自动扩展 API
- Supabase 自动扩展数据库
- Solana 自动处理并发

### 垂直扩展

- 升级 Supabase 计划
- 优化数据库查询
- 使用 CDN 缓存静态资源

---

**维护者：** @Musketeer
**最后更新：** 2025-10-24


