// 📋 复制这个文件的所有内容到 Solana Playground
// 网址：https://beta.solpg.io/

use anchor_lang::prelude::*;

// ⚠️ 注意：这个 ID 是临时的，部署后会自动更新
declare_id!("11111111111111111111111111111111");

#[program]
pub mod trust_score {
    use super::*;

    /// 初始化用户的信誉账户
    pub fn initialize(ctx: Context<Initialize>, initial_score: u64) -> Result<()> {
        let trust_account = &mut ctx.accounts.trust_account;
        trust_account.owner = ctx.accounts.user.key();
        trust_account.score = initial_score;
        trust_account.total_interactions = 0;
        trust_account.total_reports = 0;
        trust_account.created_at = Clock::get()?.unix_timestamp;
        trust_account.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("✅ Trust account initialized with score: {}", initial_score);
        Ok(())
    }

    /// 更新用户的信誉分
    pub fn update_score(
        ctx: Context<UpdateScore>,
        score_delta: i64,
    ) -> Result<()> {
        let trust_account = &mut ctx.accounts.trust_account;
        
        // 计算新分数（不能低于0）
        let new_score = if score_delta < 0 {
            trust_account.score.saturating_sub(score_delta.abs() as u64)
        } else {
            trust_account.score.saturating_add(score_delta as u64)
        };
        
        trust_account.score = new_score;
        trust_account.total_interactions += 1;
        trust_account.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("📊 Score updated to: {}", new_score);
        Ok(())
    }

    /// 记录举报
    pub fn record_report(ctx: Context<UpdateScore>) -> Result<()> {
        let trust_account = &mut ctx.accounts.trust_account;
        trust_account.total_reports += 1;
        trust_account.updated_at = Clock::get()?.unix_timestamp;
        
        msg!("🚨 Report recorded. Total: {}", trust_account.total_reports);
        Ok(())
    }
}

// === 账户结构 ===

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + TrustAccount::SPACE,
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
        bump
    )]
    pub trust_account: Account<'info, TrustAccount>,
    
    pub user: Signer<'info>,
}

// === 数据结构 ===

#[account]
pub struct TrustAccount {
    pub owner: Pubkey,              // 32 bytes
    pub score: u64,                 // 8 bytes
    pub total_interactions: u64,    // 8 bytes
    pub total_reports: u64,         // 8 bytes
    pub created_at: i64,            // 8 bytes
    pub updated_at: i64,            // 8 bytes
}

impl TrustAccount {
    pub const SPACE: usize = 32 + 8 + 8 + 8 + 8 + 8;
}




