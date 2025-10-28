/**
 * Mentorship Program
 * 链上师徒关系系统
 * 
 * 功能：
 * 1. 建立链上师徒关系
 * 2. 记录导师贡献和学徒成长
 * 3. 可验证的指导关系证明
 */

use anchor_lang::prelude::*;

declare_id!("2FBJhP2ecw24W6wpAYF5v42uiPWZB38ubRLyfKyaDVwt");

#[program]
pub mod mentorship {
    use super::*;

    /**
     * 初始化导师档案
     * 要求：等级 >= 20（在链下验证，或通过CPI检查TrustScore）
     */
    pub fn initialize_mentor_profile(
        ctx: Context<InitializeMentorProfile>,
        specialty: String,
        max_mentees: u8,
    ) -> Result<()> {
        require!(specialty.len() <= 100, ErrorCode::SpecialtyTooLong);
        require!(max_mentees > 0 && max_mentees <= 10, ErrorCode::InvalidMaxMentees);

        let mentor_profile = &mut ctx.accounts.mentor_profile;
        let clock = Clock::get()?;

        mentor_profile.mentor = ctx.accounts.mentor.key();
        mentor_profile.specialty = specialty;
        mentor_profile.max_mentees = max_mentees;
        mentor_profile.current_mentees = 0;
        mentor_profile.total_mentees_graduated = 0;
        mentor_profile.reputation_score = 100; // 初始导师声望
        mentor_profile.is_active = true;
        mentor_profile.created_at = clock.unix_timestamp;
        mentor_profile.bump = ctx.bumps.mentor_profile;

        msg!("Mentor profile created for: {}", ctx.accounts.mentor.key());
        msg!("Specialty: {}", specialty);

        emit!(MentorProfileCreated {
            mentor: ctx.accounts.mentor.key(),
            specialty,
            max_mentees,
        });

        Ok(())
    }

    /**
     * 建立师徒关系
     */
    pub fn create_mentorship(
        ctx: Context<CreateMentorship>,
        goals: String,
    ) -> Result<()> {
        require!(goals.len() <= 200, ErrorCode::GoalsTooLong);

        let mentorship = &mut ctx.accounts.mentorship;
        let mentor_profile = &mut ctx.accounts.mentor_profile;
        let clock = Clock::get()?;

        // 检查导师是否还能接收学徒
        require!(
            mentor_profile.current_mentees < mentor_profile.max_mentees,
            ErrorCode::MentorFull
        );

        require!(mentor_profile.is_active, ErrorCode::MentorInactive);

        // 初始化师徒关系
        mentorship.mentor = ctx.accounts.mentor.key();
        mentorship.mentee = ctx.accounts.mentee.key();
        mentorship.goals = goals.clone();
        mentorship.status = MentorshipStatus::Active;
        mentorship.sessions_completed = 0;
        mentorship.mentee_progress_score = 0;
        mentorship.started_at = clock.unix_timestamp;
        mentorship.bump = ctx.bumps.mentorship;

        // 更新导师统计
        mentor_profile.current_mentees += 1;

        msg!(
            "Mentorship created: Mentor {} -> Mentee {}",
            ctx.accounts.mentor.key(),
            ctx.accounts.mentee.key()
        );

        emit!(MentorshipCreated {
            mentor: ctx.accounts.mentor.key(),
            mentee: ctx.accounts.mentee.key(),
            goals,
        });

        Ok(())
    }

    /**
     * 记录指导会话
     */
    pub fn record_session(
        ctx: Context<RecordSession>,
        session_notes: String,
        quality_rating: u8,
    ) -> Result<()> {
        require!(session_notes.len() <= 200, ErrorCode::NotesTooLong);
        require!(quality_rating <= 5, ErrorCode::InvalidRating);

        let mentorship = &mut ctx.accounts.mentorship;
        let mentor_profile = &mut ctx.accounts.mentor_profile;

        require!(
            mentorship.status == MentorshipStatus::Active,
            ErrorCode::MentorshipNotActive
        );

        // 更新会话统计
        mentorship.sessions_completed += 1;
        mentorship.last_session_at = Some(Clock::get()?.unix_timestamp);

        // 更新导师声望（基于评分）
        if quality_rating >= 4 {
            mentor_profile.reputation_score = (mentor_profile.reputation_score + 5).min(1000);
        }

        msg!(
            "Session recorded: #{}, Rating: {}",
            mentorship.sessions_completed,
            quality_rating
        );

        emit!(SessionRecorded {
            mentor: mentorship.mentor,
            mentee: mentorship.mentee,
            session_number: mentorship.sessions_completed,
            quality_rating,
        });

        Ok(())
    }

    /**
     * 更新学徒进度
     */
    pub fn update_mentee_progress(
        ctx: Context<UpdateProgress>,
        progress_score: u8,
    ) -> Result<()> {
        require!(progress_score <= 100, ErrorCode::InvalidProgressScore);

        let mentorship = &mut ctx.accounts.mentorship;

        require!(
            mentorship.status == MentorshipStatus::Active,
            ErrorCode::MentorshipNotActive
        );

        mentorship.mentee_progress_score = progress_score;

        msg!(
            "Mentee progress updated: {}%",
            progress_score
        );

        Ok(())
    }

    /**
     * 完成师徒关系（毕业）
     */
    pub fn complete_mentorship(
        ctx: Context<CompleteMentorship>,
        final_feedback: String,
    ) -> Result<()> {
        require!(final_feedback.len() <= 300, ErrorCode::FeedbackTooLong);

        let mentorship = &mut ctx.accounts.mentorship;
        let mentor_profile = &mut ctx.accounts.mentor_profile;
        let clock = Clock::get()?;

        require!(
            mentorship.status == MentorshipStatus::Active,
            ErrorCode::MentorshipNotActive
        );

        // 要求至少完成5次会话
        require!(
            mentorship.sessions_completed >= 5,
            ErrorCode::InsufficientSessions
        );

        // 更新状态
        mentorship.status = MentorshipStatus::Completed;
        mentorship.completed_at = Some(clock.unix_timestamp);

        // 更新导师统计
        mentor_profile.current_mentees = mentor_profile.current_mentees.saturating_sub(1);
        mentor_profile.total_mentees_graduated += 1;

        // 导师声望大幅提升
        mentor_profile.reputation_score = (mentor_profile.reputation_score + 50).min(1000);

        msg!(
            "Mentorship completed! Mentor {} has graduated {} mentees",
            mentor_profile.mentor,
            mentor_profile.total_mentees_graduated
        );

        emit!(MentorshipCompleted {
            mentor: mentorship.mentor,
            mentee: mentorship.mentee,
            sessions_completed: mentorship.sessions_completed,
            final_progress: mentorship.mentee_progress_score,
        });

        Ok(())
    }

    /**
     * 终止师徒关系
     */
    pub fn terminate_mentorship(
        ctx: Context<TerminateMentorship>,
        reason: String,
    ) -> Result<()> {
        require!(reason.len() <= 200, ErrorCode::ReasonTooLong);

        let mentorship = &mut ctx.accounts.mentorship;
        let mentor_profile = &mut ctx.accounts.mentor_profile;
        let clock = Clock::get()?;

        require!(
            mentorship.status == MentorshipStatus::Active,
            ErrorCode::MentorshipNotActive
        );

        // 更新状态
        mentorship.status = MentorshipStatus::Terminated;
        mentorship.completed_at = Some(clock.unix_timestamp);

        // 更新导师统计
        mentor_profile.current_mentees = mentor_profile.current_mentees.saturating_sub(1);

        msg!("Mentorship terminated: {}", reason);

        emit!(MentorshipTerminated {
            mentor: mentorship.mentor,
            mentee: mentorship.mentee,
            reason,
        });

        Ok(())
    }

    /**
     * 获取导师统计
     */
    pub fn get_mentor_stats(ctx: Context<GetMentorStats>) -> Result<()> {
        let mentor_profile = &ctx.accounts.mentor_profile;

        msg!("=== Mentor Statistics ===");
        msg!("Specialty: {}", mentor_profile.specialty);
        msg!("Current Mentees: {}/{}", mentor_profile.current_mentees, mentor_profile.max_mentees);
        msg!("Total Graduated: {}", mentor_profile.total_mentees_graduated);
        msg!("Reputation Score: {}", mentor_profile.reputation_score);

        Ok(())
    }
}

// ==========================================
// 账户结构 / Account Structures
// ==========================================

#[account]
pub struct MentorProfile {
    /// 导师地址
    pub mentor: Pubkey,                     // 32 bytes
    
    /// 专长领域
    pub specialty: String,                  // 4 + 100 = 104 bytes
    
    /// 最大学徒数
    pub max_mentees: u8,                    // 1 byte
    
    /// 当前学徒数
    pub current_mentees: u8,                // 1 byte
    
    /// 已毕业学徒总数
    pub total_mentees_graduated: u16,       // 2 bytes
    
    /// 导师声望分
    pub reputation_score: u16,              // 2 bytes
    
    /// 是否活跃
    pub is_active: bool,                    // 1 byte
    
    /// 创建时间
    pub created_at: i64,                    // 8 bytes
    
    /// PDA bump
    pub bump: u8,                           // 1 byte
}

impl MentorProfile {
    pub const LEN: usize = 8 + 32 + 104 + 1 + 1 + 2 + 2 + 1 + 8 + 1; // 160 bytes
}

#[account]
pub struct Mentorship {
    /// 导师
    pub mentor: Pubkey,                     // 32 bytes
    
    /// 学徒
    pub mentee: Pubkey,                     // 32 bytes
    
    /// 学习目标
    pub goals: String,                      // 4 + 200 = 204 bytes
    
    /// 关系状态
    pub status: MentorshipStatus,           // 1 byte
    
    /// 完成的会话次数
    pub sessions_completed: u16,            // 2 bytes
    
    /// 学徒进度分（0-100）
    pub mentee_progress_score: u8,          // 1 byte
    
    /// 开始时间
    pub started_at: i64,                    // 8 bytes
    
    /// 最后会话时间
    pub last_session_at: Option<i64>,       // 9 bytes
    
    /// 完成时间
    pub completed_at: Option<i64>,          // 9 bytes
    
    /// PDA bump
    pub bump: u8,                           // 1 byte
}

impl Mentorship {
    pub const LEN: usize = 8 + 32 + 32 + 204 + 1 + 2 + 1 + 8 + 9 + 9 + 1; // 307 bytes
}

// ==========================================
// 枚举 / Enums
// ==========================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum MentorshipStatus {
    Active,      // 进行中
    Completed,   // 已完成（毕业）
    Terminated,  // 已终止
}

// ==========================================
// 指令上下文 / Instruction Contexts
// ==========================================

#[derive(Accounts)]
pub struct InitializeMentorProfile<'info> {
    #[account(
        init,
        payer = mentor,
        space = MentorProfile::LEN,
        seeds = [b"mentor_profile", mentor.key().as_ref()],
        bump
    )]
    pub mentor_profile: Account<'info, MentorProfile>,
    
    #[account(mut)]
    pub mentor: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMentorship<'info> {
    #[account(
        init,
        payer = mentee,
        space = Mentorship::LEN,
        seeds = [
            b"mentorship",
            mentor.key().as_ref(),
            mentee.key().as_ref(),
        ],
        bump
    )]
    pub mentorship: Account<'info, Mentorship>,
    
    #[account(
        mut,
        seeds = [b"mentor_profile", mentor.key().as_ref()],
        bump = mentor_profile.bump,
    )]
    pub mentor_profile: Account<'info, MentorProfile>,
    
    /// CHECK: 导师账户
    pub mentor: AccountInfo<'info>,
    
    #[account(mut)]
    pub mentee: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordSession<'info> {
    #[account(
        mut,
        seeds = [
            b"mentorship",
            mentorship.mentor.as_ref(),
            mentorship.mentee.as_ref(),
        ],
        bump = mentorship.bump,
    )]
    pub mentorship: Account<'info, Mentorship>,
    
    #[account(
        mut,
        seeds = [b"mentor_profile", mentor.key().as_ref()],
        bump = mentor_profile.bump,
    )]
    pub mentor_profile: Account<'info, MentorProfile>,
    
    pub mentor: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateProgress<'info> {
    #[account(
        mut,
        seeds = [
            b"mentorship",
            mentorship.mentor.as_ref(),
            mentorship.mentee.as_ref(),
        ],
        bump = mentorship.bump,
    )]
    pub mentorship: Account<'info, Mentorship>,
    
    pub authority: Signer<'info>, // 可以是导师或学徒
}

#[derive(Accounts)]
pub struct CompleteMentorship<'info> {
    #[account(
        mut,
        seeds = [
            b"mentorship",
            mentorship.mentor.as_ref(),
            mentorship.mentee.as_ref(),
        ],
        bump = mentorship.bump,
    )]
    pub mentorship: Account<'info, Mentorship>,
    
    #[account(
        mut,
        seeds = [b"mentor_profile", mentor.key().as_ref()],
        bump = mentor_profile.bump,
    )]
    pub mentor_profile: Account<'info, MentorProfile>,
    
    pub mentor: Signer<'info>,
}

#[derive(Accounts)]
pub struct TerminateMentorship<'info> {
    #[account(
        mut,
        seeds = [
            b"mentorship",
            mentorship.mentor.as_ref(),
            mentorship.mentee.as_ref(),
        ],
        bump = mentorship.bump,
    )]
    pub mentorship: Account<'info, Mentorship>,
    
    #[account(
        mut,
        seeds = [b"mentor_profile", mentor.key().as_ref()],
        bump = mentor_profile.bump,
    )]
    pub mentor_profile: Account<'info, MentorProfile>,
    
    pub authority: Signer<'info>, // 导师或学徒都可以终止
}

#[derive(Accounts)]
pub struct GetMentorStats<'info> {
    #[account(
        seeds = [b"mentor_profile", mentor.key().as_ref()],
        bump = mentor_profile.bump,
    )]
    pub mentor_profile: Account<'info, MentorProfile>,
    
    /// CHECK: 查询的导师
    pub mentor: AccountInfo<'info>,
}

// ==========================================
// 事件 / Events
// ==========================================

#[event]
pub struct MentorProfileCreated {
    pub mentor: Pubkey,
    pub specialty: String,
    pub max_mentees: u8,
}

#[event]
pub struct MentorshipCreated {
    pub mentor: Pubkey,
    pub mentee: Pubkey,
    pub goals: String,
}

#[event]
pub struct SessionRecorded {
    pub mentor: Pubkey,
    pub mentee: Pubkey,
    pub session_number: u16,
    pub quality_rating: u8,
}

#[event]
pub struct MentorshipCompleted {
    pub mentor: Pubkey,
    pub mentee: Pubkey,
    pub sessions_completed: u16,
    pub final_progress: u8,
}

#[event]
pub struct MentorshipTerminated {
    pub mentor: Pubkey,
    pub mentee: Pubkey,
    pub reason: String,
}

// ==========================================
// 错误码 / Error Codes
// ==========================================

#[error_code]
pub enum ErrorCode {
    #[msg("Specialty description too long. Max 100 characters.")]
    SpecialtyTooLong,
    
    #[msg("Invalid max mentees. Must be between 1-10.")]
    InvalidMaxMentees,
    
    #[msg("Goals too long. Max 200 characters.")]
    GoalsTooLong,
    
    #[msg("Mentor has reached maximum number of mentees.")]
    MentorFull,
    
    #[msg("Mentor profile is not active.")]
    MentorInactive,
    
    #[msg("Session notes too long. Max 200 characters.")]
    NotesTooLong,
    
    #[msg("Invalid rating. Must be between 0-5.")]
    InvalidRating,
    
    #[msg("Mentorship is not active.")]
    MentorshipNotActive,
    
    #[msg("Invalid progress score. Must be between 0-100.")]
    InvalidProgressScore,
    
    #[msg("Feedback too long. Max 300 characters.")]
    FeedbackTooLong,
    
    #[msg("Insufficient sessions. Need at least 5 sessions to complete.")]
    InsufficientSessions,
    
    #[msg("Reason too long. Max 200 characters.")]
    ReasonTooLong,
}

