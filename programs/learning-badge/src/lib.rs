/**
 * LearningBadge Program
 * 链上学习成就勋章系统
 * 
 * 功能：
 * 1. 铸造学习勋章 NFT
 * 2. 记录学习里程碑（连续天数、完成卡片数等）
 * 3. 可展示的链上成就系统
 */

use anchor_lang::prelude::*;

declare_id!("BzpCwsmnX67zksx1BFgaDq1cmgK877WhtKgowiDQ4yAH");

#[program]
pub mod learning_badge {
    use super::*;

    /**
     * 初始化用户的勋章收藏
     */
    pub fn initialize_badge_collection(ctx: Context<InitializeBadgeCollection>) -> Result<()> {
        let collection = &mut ctx.accounts.badge_collection;
        
        collection.owner = ctx.accounts.owner.key();
        collection.total_badges = 0;
        collection.total_cards_completed = 0;
        collection.total_learning_days = 0;
        collection.current_streak = 0;
        collection.longest_streak = 0;
        collection.last_learning_date = 0;
        collection.bump = ctx.bumps.badge_collection;

        msg!("Badge collection initialized for: {}", ctx.accounts.owner.key());
        Ok(())
    }

    /**
     * 记录学习活动并自动授予勋章
     */
    pub fn record_learning_session(
        ctx: Context<RecordLearning>,
        cards_completed: u16,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.badge_collection;
        let clock = Clock::get()?;
        let today = clock.unix_timestamp / 86400; // 转换为天数
        let last_day = collection.last_learning_date / 86400;

        // 更新学习统计
        collection.total_cards_completed += cards_completed as u32;
        collection.total_learning_days += 1;

        // 更新连胜
        if today == last_day {
            // 同一天，不更新连胜
        } else if today == last_day + 1 {
            // 连续第二天
            collection.current_streak += 1;
            if collection.current_streak > collection.longest_streak {
                collection.longest_streak = collection.current_streak;
            }
        } else {
            // 中断了，重新开始
            collection.current_streak = 1;
        }

        collection.last_learning_date = clock.unix_timestamp;

        msg!(
            "Learning session recorded: {} cards, streak: {}",
            cards_completed,
            collection.current_streak
        );

        // 发射事件，API可以监听来自动铸造勋章
        emit!(LearningSessionRecorded {
            user: ctx.accounts.owner.key(),
            cards_completed,
            current_streak: collection.current_streak,
            total_cards: collection.total_cards_completed,
        });

        Ok(())
    }

    /**
     * 铸造勋章 NFT
     */
    pub fn mint_badge(
        ctx: Context<MintBadge>,
        badge_type: BadgeType,
        milestone_value: u32,
    ) -> Result<()> {
        let badge = &mut ctx.accounts.badge;
        let collection = &mut ctx.accounts.badge_collection;
        let clock = Clock::get()?;

        // 验证是否达到里程碑
        let eligible = match badge_type {
            BadgeType::FirstCard => collection.total_cards_completed >= 1,
            BadgeType::Cards10 => collection.total_cards_completed >= 10,
            BadgeType::Cards50 => collection.total_cards_completed >= 50,
            BadgeType::Cards100 => collection.total_cards_completed >= 100,
            BadgeType::Cards500 => collection.total_cards_completed >= 500,
            BadgeType::Streak7 => collection.longest_streak >= 7,
            BadgeType::Streak30 => collection.longest_streak >= 30,
            BadgeType::Streak100 => collection.longest_streak >= 100,
            BadgeType::EarlyAdopter => true, // 特殊勋章
            BadgeType::Contributor => true,  // 需要额外验证
        };

        require!(eligible, ErrorCode::MilestoneNotReached);

        // 初始化勋章
        badge.owner = ctx.accounts.owner.key();
        badge.badge_type = badge_type;
        badge.milestone_value = milestone_value;
        badge.minted_at = clock.unix_timestamp;
        badge.non_transferable = true;
        badge.bump = ctx.bumps.badge;

        // 更新收藏统计
        collection.total_badges += 1;

        msg!(
            "Badge minted: {:?} for {}",
            badge_type,
            ctx.accounts.owner.key()
        );

        emit!(BadgeMinted {
            user: ctx.accounts.owner.key(),
            badge_type,
            milestone_value,
        });

        Ok(())
    }

    /**
     * 查看用户的所有成就
     */
    pub fn get_achievements(ctx: Context<GetAchievements>) -> Result<()> {
        let collection = &ctx.accounts.badge_collection;
        
        msg!("=== User Achievements ===");
        msg!("Total Badges: {}", collection.total_badges);
        msg!("Cards Completed: {}", collection.total_cards_completed);
        msg!("Learning Days: {}", collection.total_learning_days);
        msg!("Current Streak: {}", collection.current_streak);
        msg!("Longest Streak: {}", collection.longest_streak);

        Ok(())
    }
}

// ==========================================
// 账户结构 / Account Structures
// ==========================================

#[account]
pub struct BadgeCollection {
    /// 所有者
    pub owner: Pubkey,                      // 32 bytes
    
    /// 总勋章数
    pub total_badges: u16,                  // 2 bytes
    
    /// 总完成卡片数
    pub total_cards_completed: u32,         // 4 bytes
    
    /// 总学习天数
    pub total_learning_days: u32,           // 4 bytes
    
    /// 当前连胜天数
    pub current_streak: u16,                // 2 bytes
    
    /// 最长连胜天数
    pub longest_streak: u16,                // 2 bytes
    
    /// 最后学习日期
    pub last_learning_date: i64,            // 8 bytes
    
    /// PDA bump
    pub bump: u8,                           // 1 byte
}

impl BadgeCollection {
    pub const LEN: usize = 8 + 32 + 2 + 4 + 4 + 2 + 2 + 8 + 1; // 63 bytes
}

#[account]
pub struct LearningBadge {
    /// 所有者
    pub owner: Pubkey,                      // 32 bytes
    
    /// 勋章类型
    pub badge_type: BadgeType,              // 1 byte
    
    /// 里程碑数值
    pub milestone_value: u32,               // 4 bytes
    
    /// 铸造时间
    pub minted_at: i64,                     // 8 bytes
    
    /// 不可转让
    pub non_transferable: bool,             // 1 byte
    
    /// PDA bump
    pub bump: u8,                           // 1 byte
}

impl LearningBadge {
    pub const LEN: usize = 8 + 32 + 1 + 4 + 8 + 1 + 1; // 55 bytes
}

// ==========================================
// 勋章类型 / Badge Types
// ==========================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum BadgeType {
    FirstCard,      // 完成第1张卡片
    Cards10,        // 完成10张卡片
    Cards50,        // 完成50张卡片
    Cards100,       // 完成100张卡片
    Cards500,       // 完成500张卡片
    Streak7,        // 连续学习7天
    Streak30,       // 连续学习30天
    Streak100,      // 连续学习100天
    EarlyAdopter,   // 早期用户
    Contributor,    // 贡献者
}

// ==========================================
// 指令上下文 / Instruction Contexts
// ==========================================

#[derive(Accounts)]
pub struct InitializeBadgeCollection<'info> {
    #[account(
        init,
        payer = owner,
        space = BadgeCollection::LEN,
        seeds = [b"badge_collection", owner.key().as_ref()],
        bump
    )]
    pub badge_collection: Account<'info, BadgeCollection>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordLearning<'info> {
    #[account(
        mut,
        seeds = [b"badge_collection", owner.key().as_ref()],
        bump = badge_collection.bump,
    )]
    pub badge_collection: Account<'info, BadgeCollection>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(badge_type: BadgeType)]
pub struct MintBadge<'info> {
    #[account(
        init,
        payer = owner,
        space = LearningBadge::LEN,
        seeds = [
            b"learning_badge",
            owner.key().as_ref(),
            &[badge_type as u8],
        ],
        bump
    )]
    pub badge: Account<'info, LearningBadge>,
    
    #[account(
        mut,
        seeds = [b"badge_collection", owner.key().as_ref()],
        bump = badge_collection.bump,
    )]
    pub badge_collection: Account<'info, BadgeCollection>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetAchievements<'info> {
    #[account(
        seeds = [b"badge_collection", user.key().as_ref()],
        bump = badge_collection.bump,
    )]
    pub badge_collection: Account<'info, BadgeCollection>,
    
    /// CHECK: 查询的用户
    pub user: AccountInfo<'info>,
}

// ==========================================
// 事件 / Events
// ==========================================

#[event]
pub struct LearningSessionRecorded {
    pub user: Pubkey,
    pub cards_completed: u16,
    pub current_streak: u16,
    pub total_cards: u32,
}

#[event]
pub struct BadgeMinted {
    pub user: Pubkey,
    pub badge_type: BadgeType,
    pub milestone_value: u32,
}

// ==========================================
// 错误码 / Error Codes
// ==========================================

#[error_code]
pub enum ErrorCode {
    #[msg("Milestone not reached yet.")]
    MilestoneNotReached,
    
    #[msg("Badge already minted.")]
    BadgeAlreadyExists,
    
    #[msg("Invalid badge type.")]
    InvalidBadgeType,
}

