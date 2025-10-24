/**
 * SocialGraph Program
 * 链上社交关系图
 * 
 * 功能：
 * 1. 记录用户匹配关系
 * 2. 创建可验证的链上社交图谱
 * 3. 查询用户的匹配列表
 */

use anchor_lang::prelude::*;

declare_id!("EmKvmnfXrcgmcj4yT2K12rM2dMTZS2MMAfUB8769veHK"); // TODO: 部署后更新

#[program]
pub mod social_graph {
    use super::*;

    /**
     * 创建匹配边（Match Edge）
     * 记录两个用户之间的匹配关系
     * 
     * @param user_b: 匹配的另一方
     */
    pub fn create_match_edge(
        ctx: Context<CreateMatchEdge>,
        user_b: Pubkey,
    ) -> Result<()> {
        let match_edge = &mut ctx.accounts.match_edge;
        let user_a = &ctx.accounts.user_a;
        let clock = Clock::get()?;

        // 确保用户不能和自己匹配
        require!(user_a.key() != user_b, ErrorCode::SelfMatch);

        // 按字典序排列，确保匹配边的唯一性
        let (a, b) = if user_a.key() < user_b {
            (user_a.key(), user_b)
        } else {
            (user_b, user_a.key())
        };

        match_edge.user_a = a;
        match_edge.user_b = b;
        match_edge.created_at = clock.unix_timestamp;
        match_edge.is_active = true;
        match_edge.interaction_count = 0;
        match_edge.bump = ctx.bumps.match_edge;

        msg!("Match edge created between: {} and {}", a, b);

        Ok(())
    }

    /**
     * 更新匹配边状态
     * 记录互动次数或解除匹配
     */
    pub fn update_match_edge(
        ctx: Context<UpdateMatchEdge>,
        increment_interactions: bool,
        set_inactive: bool,
    ) -> Result<()> {
        let match_edge = &mut ctx.accounts.match_edge;
        let clock = Clock::get()?;

        if increment_interactions {
            match_edge.interaction_count += 1;
            msg!("Interaction count: {}", match_edge.interaction_count);
        }

        if set_inactive {
            match_edge.is_active = false;
            match_edge.deactivated_at = Some(clock.unix_timestamp);
            msg!("Match edge deactivated");
        }

        Ok(())
    }

    /**
     * 查询匹配边
     * 验证两个用户是否匹配
     */
    pub fn verify_match(ctx: Context<VerifyMatch>) -> Result<bool> {
        let match_edge = &ctx.accounts.match_edge;
        Ok(match_edge.is_active)
    }
}

// ==========================================
// 账户结构 / Account Structures
// ==========================================

#[account]
pub struct MatchEdge {
    /// 用户 A（字典序较小）
    pub user_a: Pubkey,              // 32 bytes
    
    /// 用户 B（字典序较大）
    pub user_b: Pubkey,              // 32 bytes
    
    /// 创建时间
    pub created_at: i64,             // 8 bytes
    
    /// 是否激活
    pub is_active: bool,             // 1 byte
    
    /// 互动次数（消息数量）
    pub interaction_count: u32,      // 4 bytes
    
    /// 取消激活时间（可选）
    pub deactivated_at: Option<i64>, // 9 bytes (1 + 8)
    
    /// PDA bump
    pub bump: u8,                    // 1 byte
}

impl MatchEdge {
    pub const LEN: usize = 8 + // discriminator
        32 + // user_a
        32 + // user_b
        8 +  // created_at
        1 +  // is_active
        4 +  // interaction_count
        9 +  // deactivated_at (Option)
        1;   // bump
}

// ==========================================
// 指令上下文 / Instruction Contexts
// ==========================================

#[derive(Accounts)]
#[instruction(user_b: Pubkey)]
pub struct CreateMatchEdge<'info> {
    #[account(
        init,
        payer = user_a,
        space = MatchEdge::LEN,
        seeds = [
            b"match_edge",
            user_a.key().min(user_b).as_ref(),
            user_a.key().max(user_b).as_ref(),
        ],
        bump
    )]
    pub match_edge: Account<'info, MatchEdge>,
    
    #[account(mut)]
    pub user_a: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMatchEdge<'info> {
    #[account(
        mut,
        seeds = [
            b"match_edge",
            match_edge.user_a.as_ref(),
            match_edge.user_b.as_ref(),
        ],
        bump = match_edge.bump,
    )]
    pub match_edge: Account<'info, MatchEdge>,
    
    /// 授权更新者（API 服务或匹配双方之一）
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct VerifyMatch<'info> {
    #[account(
        seeds = [
            b"match_edge",
            match_edge.user_a.as_ref(),
            match_edge.user_b.as_ref(),
        ],
        bump = match_edge.bump,
    )]
    pub match_edge: Account<'info, MatchEdge>,
}

// ==========================================
// 错误码 / Error Codes
// ==========================================

#[error_code]
pub enum ErrorCode {
    #[msg("Cannot match with yourself.")]
    SelfMatch,
    
    #[msg("Match edge already exists.")]
    MatchAlreadyExists,
    
    #[msg("Match edge is not active.")]
    MatchNotActive,
    
    #[msg("Unauthorized. Only participants can perform this action.")]
    Unauthorized,
}


