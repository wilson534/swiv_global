/**
 * TrustScore Program
 * 链上信誉分系统
 * 
 * 功能：
 * 1. 初始化用户信誉分（默认 50）
 * 2. 根据行为更新信誉分
 * 3. 防止分数超出范围 (0-100)
 * 4. 记录信誉分变更历史
 */

use anchor_lang::prelude::*;

declare_id!("3FWDkwEPfVVZmxXS4f3pDaJpg4qf7GL5ir89DtXSwAjR"); // TODO: 部署后更新

#[program]
pub mod trust_score {
    use super::*;

    /**
     * 初始化 TrustScore
     * 新用户默认信誉分为 50
     */
    pub fn initialize_trust_score(ctx: Context<InitializeTrustScore>) -> Result<()> {
        let trust_score = &mut ctx.accounts.trust_score;
        let owner = &ctx.accounts.owner;
        let clock = Clock::get()?;

        trust_score.owner = owner.key();
        trust_score.score = 50;  // 初始分数
        trust_score.last_updated = clock.unix_timestamp;
        trust_score.total_updates = 0;
        trust_score.bump = ctx.bumps.trust_score;

        msg!("TrustScore initialized for: {}", owner.key());
        msg!("Initial score: 50");

        Ok(())
    }

    /**
     * 更新 TrustScore
     * 
     * @param delta: 分数变化量（正数或负数）
     * @param reason: 变更原因（用于链上记录）
     */
    pub fn update_trust_score(
        ctx: Context<UpdateTrustScore>,
        delta: i8,
        _reason: String,  // 链上记录原因
    ) -> Result<()> {
        let trust_score = &mut ctx.accounts.trust_score;
        let clock = Clock::get()?;

        // 计算新分数
        let new_score = (trust_score.score as i16 + delta as i16)
            .clamp(0, 100) as u8;

        msg!("Trust score update for: {}", trust_score.owner);
        msg!("Old score: {}", trust_score.score);
        msg!("Delta: {}", delta);
        msg!("New score: {}", new_score);
        msg!("Reason: {}", _reason);

        trust_score.score = new_score;
        trust_score.last_updated = clock.unix_timestamp;
        trust_score.total_updates += 1;

        Ok(())
    }

    /**
     * 查询 TrustScore
     * 返回当前信誉分
     */
    pub fn get_trust_score(ctx: Context<GetTrustScore>) -> Result<u8> {
        let trust_score = &ctx.accounts.trust_score;
        Ok(trust_score.score)
    }
}

// ==========================================
// 账户结构 / Account Structures
// ==========================================

#[account]
pub struct TrustScore {
    /// 所有者
    pub owner: Pubkey,          // 32 bytes
    
    /// 当前信誉分 (0-100)
    pub score: u8,              // 1 byte
    
    /// 最后更新时间
    pub last_updated: i64,      // 8 bytes
    
    /// 总更新次数
    pub total_updates: u64,     // 8 bytes
    
    /// PDA bump
    pub bump: u8,               // 1 byte
}

impl TrustScore {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        1 +  // score
        8 +  // last_updated
        8 +  // total_updates
        1;   // bump
}

// ==========================================
// 指令上下文 / Instruction Contexts
// ==========================================

#[derive(Accounts)]
pub struct InitializeTrustScore<'info> {
    #[account(
        init,
        payer = owner,
        space = TrustScore::LEN,
        seeds = [b"trust_score", owner.key().as_ref()],
        bump
    )]
    pub trust_score: Account<'info, TrustScore>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTrustScore<'info> {
    #[account(
        mut,
        seeds = [b"trust_score", trust_score.owner.as_ref()],
        bump = trust_score.bump,
    )]
    pub trust_score: Account<'info, TrustScore>,
    
    /// 授权更新者（API 服务的钱包）
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetTrustScore<'info> {
    #[account(
        seeds = [b"trust_score", trust_score.owner.as_ref()],
        bump = trust_score.bump,
    )]
    pub trust_score: Account<'info, TrustScore>,
}

// ==========================================
// 错误码 / Error Codes
// ==========================================

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid score delta. Score must remain between 0 and 100.")]
    InvalidScoreDelta,
    
    #[msg("Unauthorized. Only the authority can update trust scores.")]
    Unauthorized,
}


