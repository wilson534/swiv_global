use anchor_lang::prelude::*;

declare_id!("3FWDkwEPfVVZmxXS4f3pDaJpg4qf7GL5ir89DtXSwAjR");

#[program]
pub mod trust_score_mini {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, score: u64) -> Result<()> {
        let trust_account = &mut ctx.accounts.trust_account;
        trust_account.owner = ctx.accounts.user.key();
        trust_account.score = score;
        trust_account.total_interactions = 0;
        Ok(())
    }

    pub fn update_score(ctx: Context<UpdateScore>, delta: i64) -> Result<()> {
        let trust_account = &mut ctx.accounts.trust_account;
        trust_account.score = (trust_account.score as i64 + delta) as u64;
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
        bump
    )]
    pub trust_account: Account<'info, TrustAccount>,
    pub user: Signer<'info>,
}

#[account]
pub struct TrustAccount {
    pub owner: Pubkey,
    pub score: u64,
    pub total_interactions: u64,
}


