/**
 * Trust Score Program
 * Solana 链上信誉系统
 */

use anchor_lang::prelude::*;

declare_id!("TrustScoreProgramID111111111111111111111111");

#[program]
pub mod trust_score {
    use super::*;

    /**
     * 初始化用户信誉账户
     */
    pub fn initialize_trust_score(ctx: Context<InitializeTrustScore>) -> Result<()> {
        let trust_score = &mut ctx.accounts.trust_score;
        let clock = Clock::get()?;

        trust_score.owner = ctx.accounts.owner.key();
        trust_score.base_score = 100; // 初始分数
        trust_score.total_interactions = 0;
        trust_score.positive_interactions = 0;
        trust_score.reports_received = 0;
        trust_score.reports_validated = 0;
        trust_score.learning_streak = 0;
        trust_score.last_active = clock.unix_timestamp;
        trust_score.bump = ctx.bumps.trust_score;

        msg!("Trust Score initialized for: {}", ctx.accounts.owner.key());
        
        emit!(TrustScoreInitialized {
            owner: ctx.accounts.owner.key(),
            initial_score: 100,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /**
     * 记录互动行为（匹配、聊天、学习）
     */
    pub fn record_interaction(
        ctx: Context<RecordInteraction>,
        interaction_type: InteractionType,
        quality_score: u8,
    ) -> Result<()> {
        require!(quality_score <= 100, ErrorCode::InvalidQualityScore);

        let trust_score = &mut ctx.accounts.trust_score;
        let clock = Clock::get()?;

        // 更新互动次数
        trust_score.total_interactions += 1;

        // 根据质量评分更新正面互动
        if quality_score >= 60 {
            trust_score.positive_interactions += 1;
        }

        // 实时计算信誉分
        let new_score = calculate_trust_score(trust_score, interaction_type, quality_score)?;
        trust_score.base_score = new_score;
        trust_score.last_active = clock.unix_timestamp;

        msg!("Interaction recorded. New score: {}", new_score);
        
        emit!(TrustScoreUpdated {
            owner: ctx.accounts.owner.key(),
            old_score: trust_score.base_score,
            new_score,
            interaction_type,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /**
     * 记录学习进度
     */
    pub fn record_learning_activity(
        ctx: Context<RecordLearning>,
        cards_viewed: u16,
        engagement_score: u8,
    ) -> Result<()> {
        let trust_score = &mut ctx.accounts.trust_score;
        let clock = Clock::get()?;

        // 更新学习连胜
        let time_since_last = clock.unix_timestamp - trust_score.last_active;
        if time_since_last < 86400 {
            trust_score.learning_streak += 1;
        } else {
            trust_score.learning_streak = 1;
        }

        // 学习活跃度提升信誉分
        if engagement_score > 70 && trust_score.learning_streak > 7 {
            trust_score.base_score = (trust_score.base_score + 5).min(1000);
        }

        trust_score.last_active = clock.unix_timestamp;

        msg!("Learning activity recorded. Streak: {}", trust_score.learning_streak);
        
        emit!(LearningActivityRecorded {
            owner: ctx.accounts.owner.key(),
            cards_viewed,
            engagement_score,
            current_streak: trust_score.learning_streak,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /**
     * 举报用户
     */
    pub fn report_user(
        ctx: Context<ReportUser>,
        reason: String,
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        require!(reason.len() <= 200, ErrorCode::ReasonTooLong);

        let reported_score = &mut ctx.accounts.reported_trust_score;
        reported_score.reports_received += 1;

        // 如果举报次数过多，降低信誉分
        if reported_score.reports_received > 3 {
            reported_score.base_score = reported_score.base_score.saturating_sub(50);
        }

        msg!("User reported. Total reports: {}", reported_score.reports_received);
        
        emit!(UserReported {
            reporter: ctx.accounts.reporter.key(),
            reported_user: ctx.accounts.reported_user.key(),
            total_reports: reported_score.reports_received,
            new_score: reported_score.base_score,
        });
        
        Ok(())
    }

    /**
     * 获取加权信誉分
     */
    pub fn get_weighted_score(ctx: Context<GetScore>) -> Result<u16> {
        let trust_score = &ctx.accounts.trust_score;
        let weighted_score = calculate_weighted_score(trust_score)?;
        
        msg!("Weighted score: {}", weighted_score);
        Ok(weighted_score)
    }
}

// ==========================================
// 辅助函数
// ==========================================

fn calculate_trust_score(
    trust_score: &TrustScore,
    interaction_type: InteractionType,
    quality_score: u8,
) -> Result<u16> {
    let mut score = trust_score.base_score as i32;

    // 根据互动类型调整权重
    let weight = match interaction_type {
        InteractionType::Match => 2,
        InteractionType::Chat => 3,
        InteractionType::HelpfulResponse => 5,
        InteractionType::SharedContent => 4,
    };

    // 根据质量评分调整
    let adjustment = ((quality_score as i32 - 50) * weight) / 10;
    score += adjustment;

    // 正面互动率加成
    if trust_score.total_interactions > 0 {
        let positive_rate = (trust_score.positive_interactions * 100) / trust_score.total_interactions;
        if positive_rate > 80 {
            score += 20;
        }
    }

    // 学习连胜加成
    if trust_score.learning_streak > 7 {
        score += (trust_score.learning_streak as i32 / 7) * 10;
    }

    // 举报惩罚
    score -= (trust_score.reports_received as i32) * 25;

    // 限制范围 0-1000
    Ok(score.clamp(0, 1000) as u16)
}

fn calculate_weighted_score(trust_score: &TrustScore) -> Result<u16> {
    let mut weighted = trust_score.base_score as f32;

    // 活跃度权重
    let clock = Clock::get()?;
    let days_inactive = (clock.unix_timestamp - trust_score.last_active) / 86400;
    if days_inactive < 7 {
        weighted *= 1.1;
    } else if days_inactive > 30 {
        weighted *= 0.8;
    }

    // 互动质量权重
    if trust_score.total_interactions > 10 {
        let quality_ratio = trust_score.positive_interactions as f32 / trust_score.total_interactions as f32;
        weighted *= (0.8 + quality_ratio * 0.4);
    }

    Ok(weighted.clamp(0.0, 1000.0) as u16)
}

// ==========================================
// 数据结构
// ==========================================

#[account]
pub struct TrustScore {
    pub owner: Pubkey,
    pub base_score: u16,
    pub total_interactions: u32,
    pub positive_interactions: u32,
    pub reports_received: u16,
    pub reports_validated: u16,
    pub learning_streak: u16,
    pub last_active: i64,
    pub bump: u8,
}

impl TrustScore {
    pub const LEN: usize = 8 + 32 + 2 + 4 + 4 + 2 + 2 + 2 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum InteractionType {
    Match,
    Chat,
    HelpfulResponse,
    SharedContent,
}

// ==========================================
// 上下文
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
pub struct RecordInteraction<'info> {
    #[account(
        mut,
        seeds = [b"trust_score", owner.key().as_ref()],
        bump = trust_score.bump,
    )]
    pub trust_score: Account<'info, TrustScore>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RecordLearning<'info> {
    #[account(
        mut,
        seeds = [b"trust_score", owner.key().as_ref()],
        bump = trust_score.bump,
    )]
    pub trust_score: Account<'info, TrustScore>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReportUser<'info> {
    #[account(
        mut,
        seeds = [b"trust_score", reported_user.key().as_ref()],
        bump = reported_trust_score.bump,
    )]
    pub reported_trust_score: Account<'info, TrustScore>,
    
    /// CHECK: 被举报的用户
    pub reported_user: AccountInfo<'info>,
    
    #[account(mut)]
    pub reporter: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetScore<'info> {
    #[account(
        seeds = [b"trust_score", user.key().as_ref()],
        bump = trust_score.bump,
    )]
    pub trust_score: Account<'info, TrustScore>,
    
    /// CHECK: 查询的用户
    pub user: AccountInfo<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid quality score. Must be between 0-100.")]
    InvalidQualityScore,
    
    #[msg("Reason too long. Max 200 characters.")]
    ReasonTooLong,
}

// ==========================================
// 事件 / Events
// ==========================================

#[event]
pub struct TrustScoreInitialized {
    pub owner: Pubkey,
    pub initial_score: u16,
    pub timestamp: i64,
}

#[event]
pub struct TrustScoreUpdated {
    pub owner: Pubkey,
    pub old_score: u16,
    pub new_score: u16,
    pub interaction_type: InteractionType,
    pub timestamp: i64,
}

#[event]
pub struct LearningActivityRecorded {
    pub owner: Pubkey,
    pub cards_viewed: u16,
    pub engagement_score: u8,
    pub current_streak: u16,
    pub timestamp: i64,
}

#[event]
pub struct UserReported {
    pub reporter: Pubkey,
    pub reported_user: Pubkey,
    pub total_reports: u16,
    pub new_score: u16,
}
