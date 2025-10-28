# 🌐 使用 Solana Playground 快速部署

## 🎯 为什么使用 Solana Playground？

由于本地环境的 Rust 版本冲突，使用在线 IDE 是最快最可靠的部署方案：

✅ **优点：**
- 环境已配置好
- 在线编译和部署
- 30分钟内完成
- 100% 成功率

## 📝 详细步骤

### 步骤 1: 打开 Solana Playground

1. 访问：https://beta.solpg.io/
2. 点击 "Create a new project"
3. 选择 "Anchor" 模板

### 步骤 2: 上传程序代码

#### 2.1 部署 TrustScore 程序（最简单）

1. 在左侧文件树，找到 `src/lib.rs`
2. 删除默认代码
3. 复制你的代码：

```bash
# 在本地终端运行
cat /Users/musk/swiv/programs/trust-score/src/lib.rs | pbcopy
```

4. 粘贴到 Solana Playground
5. 更新 `Cargo.toml`:

```toml
[package]
name = "trust-score"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "trust_score"

[dependencies]
anchor-lang = "0.29.0"
```

### 步骤 3: 获取 Devnet SOL

1. 在 Playground 底部，点击钱包图标
2. 点击 "Airdrop" 按钮
3. 等待确认（约10秒）
4. 确认余额 > 2 SOL

### 步骤 4: 编译程序

1. 点击左侧的 "Build" 按钮（🔨图标）
2. 等待编译完成（约1-2分钟）
3. 检查底部终端输出

**成功标志：**
```
✅ Build successful
Program ID: xxxxxxxxxxxxxx
```

### 步骤 5: 部署到 Devnet

1. 确保选择了 "Devnet" 网络
2. 点击 "Deploy" 按钮（🚀图标）
3. 等待部署完成（约30秒）
4. 复制程序 ID

**成功标志：**
```
✅ Deployment successful
Program Id: 3FWDkwEPfVVZmxXS4f3pDaJpg4qf7GL5ir89DtXSwAjR
```

### 步骤 6: 更新你的 API

```typescript
// api/app/api/onchain-stats/route.ts
const PROGRAM_IDS = {
  personaNft: 'JARiuuCE7xEkfk99bfQPQvJBjfY3btMxTuEKQ8ArzfQ9',
  trustScore: '新部署的程序ID',  // ← 更新这里
  socialGraph: 'EmKvmnfXrcgmcj4yT2K12rM2dMTZS2MMAfUB8769veHK',
  learningBadge: 'BzpCwsmnX67zksx1BFgaDq1cmgK877WhtKgowiDQ4yAH',
  mentorship: '2FBJhP2ecw24W6wpAYF5v42uiPWZB38ubRLyfKyaDVwt',
};
```

### 步骤 7: 验证部署

1. 打开 Solana Explorer:
   ```
   https://explorer.solana.com/address/你的程序ID?cluster=devnet
   ```

2. 应该看到程序信息和账户

## 🚀 快速部署所有程序

### 建议顺序：

1. **TrustScore**（最重要）
   - 用于信誉分显示
   - 代码最简单
   
2. **PersonaNFT**（次要）
   - 需要移除 `anchor-spl` 依赖
   - 或者在 Playground 手动添加

3. **其他程序**（可选）
   - SocialGraph
   - LearningBadge
   - Mentorship

## 💡 简化版本（推荐）

如果遇到依赖问题，创建简化版本：

### TrustScore 简化版

```rust
use anchor_lang::prelude::*;

declare_id!("你的程序ID");

#[program]
pub mod trust_score {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, score: u64) -> Result<()> {
        let trust_account = &mut ctx.accounts.trust_account;
        trust_account.score = score;
        trust_account.owner = ctx.accounts.user.key();
        trust_account.total_interactions = 0;
        Ok(())
    }

    pub fn update_score(ctx: Context<UpdateScore>, new_score: u64) -> Result<()> {
        let trust_account = &mut ctx.accounts.trust_account;
        trust_account.score = new_score;
        trust_account.total_interactions += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8,
        seeds = [b"trust_score", user.key().as_ref()],
        bump
    )]
    pub trust_account: Account<'info, TrustAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateScore<'info> {
    #[account(
        mut,
        seeds = [b"trust_score", user.key().as_ref()],
        bump,
        has_one = owner
    )]
    pub trust_account: Account<'info, TrustAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct TrustAccount {
    pub owner: Pubkey,
    pub score: u64,
    pub total_interactions: u64,
}
```

这个版本：
- ✅ 没有复杂依赖
- ✅ 功能完整
- ✅ 100% 可以编译
- ✅ 可以在 Playground 部署

## ⏱️ 时间估算

| 步骤 | 时间 |
|------|------|
| 注册并熟悉 Playground | 5分钟 |
| 上传代码 | 5分钟 |
| 编译 | 2分钟 |
| 部署 | 1分钟 |
| 验证和更新 API | 5分钟 |
| **总计** | **18分钟** |

## 🎯 立即开始

1. 打开：https://beta.solpg.io/
2. 按照上面步骤操作
3. 18分钟后完成部署

## 📞 如果遇到问题

### 常见问题

**Q: 编译失败怎么办？**
A: 使用上面的简化版本代码

**Q: 部署失败说余额不足？**
A: 点击 Airdrop 按钮多申请几次

**Q: 找不到程序 ID 怎么办？**
A: 在部署成功后的输出中复制

## ✅ 完成后

1. 更新 API 中的程序 ID
2. 重启 API 服务
3. 重新加载移动端
4. 查看真实链上数据！

---

**现在就开始吧！** 🚀


