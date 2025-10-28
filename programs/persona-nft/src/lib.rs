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

        emit!(PersonaNftMinted {
            owner: owner.key(),
            risk_profile,
            mint_address: persona_nft.key(),
            timestamp: clock.unix_timestamp,
        });

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

        emit!(PersonaNftUpdated {
            owner: ctx.accounts.owner.key(),
            risk_profile: persona_nft.risk_profile,
            timestamp: clock.unix_timestamp,
        });

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

    /**
     * 🆕 更新资产展示设置
     */
    pub fn update_asset_display_settings(
        ctx: Context<UpdatePersonaNft>,
        show_assets: bool,
        show_sol_balance: bool,
        show_token_holdings: bool,
        show_nft_count: bool,
    ) -> Result<()> {
        let persona_nft = &mut ctx.accounts.persona_nft;
        let clock = Clock::get()?;

        require!(
            persona_nft.owner == ctx.accounts.owner.key(),
            ErrorCode::Unauthorized
        );

        persona_nft.show_assets = show_assets;
        persona_nft.show_sol_balance = show_sol_balance;
        persona_nft.show_token_holdings = show_token_holdings;
        persona_nft.show_nft_count = show_nft_count;
        persona_nft.updated_at = Some(clock.unix_timestamp);

        msg!("Asset display settings updated");

        emit!(AssetDisplaySettingsUpdated {
            owner: ctx.accounts.owner.key(),
            show_assets,
            show_sol_balance,
            show_token_holdings,
            show_nft_count,
        });

        Ok(())
    }

    /**
     * 🆕 鲸鱼认证（验证资产 > 100 SOL）
     */
    pub fn verify_whale_status(
        ctx: Context<VerifyWhale>,
    ) -> Result<()> {
        let persona_nft = &mut ctx.accounts.persona_nft;
        let owner_account = &ctx.accounts.owner;
        
        // 检查账户余额
        let balance = owner_account.lamports();
        let sol_balance = balance as f64 / 1_000_000_000.0;
        
        // 如果余额 > 100 SOL，授予鲸鱼认证
        if sol_balance >= 100.0 {
            persona_nft.verified_whale = true;
            msg!("Whale status verified! Balance: {} SOL", sol_balance);
            
            emit!(WhaleStatusVerified {
                owner: owner_account.key(),
                sol_balance: (sol_balance * 1_000_000_000.0) as u64,
                verified: true,
            });
        } else {
            persona_nft.verified_whale = false;
        }
        
        Ok(())
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
    
    // 🆕 资产展示设置
    pub show_assets: bool,              // 1 byte
    pub show_sol_balance: bool,         // 1 byte
    pub show_token_holdings: bool,      // 1 byte
    pub show_nft_count: bool,           // 1 byte
    pub verified_whale: bool,           // 1 byte（资产 > 100 SOL）
    
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
        1 +  // show_assets
        1 +  // show_sol_balance
        1 +  // show_token_holdings
        1 +  // show_nft_count
        1 +  // verified_whale
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

#[derive(Accounts)]
pub struct VerifyWhale<'info> {
    #[account(
        mut,
        seeds = [b"persona_nft", owner.key().as_ref()],
        bump = persona_nft.bump,
    )]
    pub persona_nft: Account<'info, PersonaNft>,
    
    pub owner: Signer<'info>,
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

// ==========================================
// 事件 / Events
// ==========================================

#[event]
pub struct PersonaNftMinted {
    pub owner: Pubkey,
    pub risk_profile: u8,
    pub mint_address: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct PersonaNftUpdated {
    pub owner: Pubkey,
    pub risk_profile: u8,
    pub timestamp: i64,
}

#[event]
pub struct AssetDisplaySettingsUpdated {
    pub owner: Pubkey,
    pub show_assets: bool,
    pub show_sol_balance: bool,
    pub show_token_holdings: bool,
    pub show_nft_count: bool,
}

#[event]
pub struct WhaleStatusVerified {
    pub owner: Pubkey,
    pub sol_balance: u64,
    pub verified: bool,
}



