/**
 * PersonaNFT Program
 * Soulbound 投资人格 NFT 程序
 * 
 * 功能：
 * 1. 铸造不可转让的人格 NFT
 * 2. 记录用户投资风险偏好
 * 3. 存储人格数据哈希（关键词、AI 总结）
 */

use anchor_lang::prelude::*;

declare_id!("JARiuuCE7xEkfk99bfQPQvJBjfY3btMxTuEKQ8ArzfQ9"); // TODO: 部署后更新

#[program]
pub mod persona_nft {
    use super::*;

    /**
     * 铸造 PersonaNFT
     * 
     * @param risk_profile: 风险类型 (0=Conservative, 1=Balanced, 2=Aggressive)
     * @param keywords_hash: 关键词的哈希值（SHA256）
     * @param ai_hash: AI 总结的哈希值（SHA256）
     */
    pub fn mint_persona_nft(
        ctx: Context<MintPersonaNft>,
        risk_profile: u8,
        keywords_hash: [u8; 32],
        ai_hash: [u8; 32],
    ) -> Result<()> {
        // 验证风险类型
        require!(risk_profile <= 2, ErrorCode::InvalidRiskProfile);

        let persona_nft = &mut ctx.accounts.persona_nft;
        let owner = &ctx.accounts.owner;
        let clock = Clock::get()?;

        // 初始化 PersonaNFT
        persona_nft.owner = owner.key();
        persona_nft.risk_profile = risk_profile;
        persona_nft.keywords_hash = keywords_hash;
        persona_nft.ai_hash = ai_hash;
        persona_nft.non_transferable = true;
        persona_nft.created_at = clock.unix_timestamp;
        persona_nft.bump = ctx.bumps.persona_nft;

        msg!("PersonaNFT minted for: {}", owner.key());
        msg!("Risk profile: {}", risk_profile);

        Ok(())
    }

    /**
     * 更新 PersonaNFT（仅允许所有者更新）
     * 用于修正或更新人格数据
     */
    pub fn update_persona_nft(
        ctx: Context<UpdatePersonaNft>,
        new_risk_profile: Option<u8>,
        new_keywords_hash: Option<[u8; 32]>,
        new_ai_hash: Option<[u8; 32]>,
    ) -> Result<()> {
        let persona_nft = &mut ctx.accounts.persona_nft;
        let clock = Clock::get()?;

        // 验证所有者
        require!(
            persona_nft.owner == ctx.accounts.owner.key(),
            ErrorCode::Unauthorized
        );

        // 更新字段
        if let Some(risk_profile) = new_risk_profile {
            require!(risk_profile <= 2, ErrorCode::InvalidRiskProfile);
            persona_nft.risk_profile = risk_profile;
        }

        if let Some(keywords_hash) = new_keywords_hash {
            persona_nft.keywords_hash = keywords_hash;
        }

        if let Some(ai_hash) = new_ai_hash {
            persona_nft.ai_hash = ai_hash;
        }

        persona_nft.updated_at = Some(clock.unix_timestamp);

        msg!("PersonaNFT updated for: {}", ctx.accounts.owner.key());

        Ok(())
    }

    /**
     * 验证 PersonaNFT
     * 其他程序可以调用此函数验证用户的 PersonaNFT
     */
    pub fn verify_persona_nft(ctx: Context<VerifyPersonaNft>) -> Result<bool> {
        let persona_nft = &ctx.accounts.persona_nft;
        
        // 验证 NFT 存在且属于声明的所有者
        Ok(persona_nft.owner == ctx.accounts.claimed_owner.key())
    }
}

// ==========================================
// 账户结构 / Account Structures
// ==========================================

#[account]
pub struct PersonaNft {
    /// NFT 所有者
    pub owner: Pubkey,                  // 32 bytes
    
    /// 风险类型 (0=Conservative, 1=Balanced, 2=Aggressive)
    pub risk_profile: u8,               // 1 byte
    
    /// 关键词哈希（SHA256）
    pub keywords_hash: [u8; 32],        // 32 bytes
    
    /// AI 总结哈希（SHA256）
    pub ai_hash: [u8; 32],              // 32 bytes
    
    /// 是否可转让（始终为 false，实现 Soulbound）
    pub non_transferable: bool,         // 1 byte
    
    /// 创建时间
    pub created_at: i64,                // 8 bytes
    
    /// 更新时间（可选）
    pub updated_at: Option<i64>,        // 9 bytes (1 + 8)
    
    /// PDA bump
    pub bump: u8,                       // 1 byte
}

impl PersonaNft {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        1 +  // risk_profile
        32 + // keywords_hash
        32 + // ai_hash
        1 +  // non_transferable
        8 +  // created_at
        9 +  // updated_at (Option)
        1;   // bump
}

// ==========================================
// 指令上下文 / Instruction Contexts
// ==========================================

#[derive(Accounts)]
pub struct MintPersonaNft<'info> {
    #[account(
        init,
        payer = owner,
        space = PersonaNft::LEN,
        seeds = [b"persona_nft", owner.key().as_ref()],
        bump
    )]
    pub persona_nft: Account<'info, PersonaNft>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePersonaNft<'info> {
    #[account(
        mut,
        seeds = [b"persona_nft", owner.key().as_ref()],
        bump = persona_nft.bump,
    )]
    pub persona_nft: Account<'info, PersonaNft>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct VerifyPersonaNft<'info> {
    #[account(
        seeds = [b"persona_nft", claimed_owner.key().as_ref()],
        bump = persona_nft.bump,
    )]
    pub persona_nft: Account<'info, PersonaNft>,
    
    /// CHECK: 用于验证的声明所有者
    pub claimed_owner: AccountInfo<'info>,
}

// ==========================================
// 错误码 / Error Codes
// ==========================================

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid risk profile. Must be 0 (Conservative), 1 (Balanced), or 2 (Aggressive).")]
    InvalidRiskProfile,
    
    #[msg("Unauthorized. Only the owner can perform this action.")]
    Unauthorized,
    
    #[msg("PersonaNFT is non-transferable (Soulbound).")]
    NonTransferable,
}


