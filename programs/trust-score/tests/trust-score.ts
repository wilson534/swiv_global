/**
 * TrustScore Program Tests
 * 测试信誉分的初始化、更新和查询功能
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TrustScore } from "../target/types/trust_score";
import { expect } from "chai";

describe("trust-score", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TrustScore as Program<TrustScore>;
  const owner = provider.wallet;

  it("应该初始化 TrustScore 为 50", async () => {
    const [trustScorePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("trust_score"), owner.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeTrustScore()
      .accounts({
        trustScore: trustScorePda,
        owner: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const trustScoreAccount = await program.account.trustScore.fetch(trustScorePda);
    expect(trustScoreAccount.score).to.equal(50);
    expect(trustScoreAccount.totalUpdates.toNumber()).to.equal(0);
  });

  it("应该正确增加信誉分", async () => {
    const [trustScorePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("trust_score"), owner.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .updateTrustScore(10, "完成学习任务")
      .accounts({
        trustScore: trustScorePda,
        authority: owner.publicKey,
      })
      .rpc();

    const trustScoreAccount = await program.account.trustScore.fetch(trustScorePda);
    expect(trustScoreAccount.score).to.equal(60);
    expect(trustScoreAccount.totalUpdates.toNumber()).to.equal(1);
  });

  it("应该正确减少信誉分", async () => {
    const [trustScorePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("trust_score"), owner.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .updateTrustScore(-15, "违规行为")
      .accounts({
        trustScore: trustScorePda,
        authority: owner.publicKey,
      })
      .rpc();

    const trustScoreAccount = await program.account.trustScore.fetch(trustScorePda);
    expect(trustScoreAccount.score).to.equal(45);
  });

  it("信誉分不应该低于 0", async () => {
    const [trustScorePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("trust_score"), owner.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .updateTrustScore(-100, "严重违规")
      .accounts({
        trustScore: trustScorePda,
        authority: owner.publicKey,
      })
      .rpc();

    const trustScoreAccount = await program.account.trustScore.fetch(trustScorePda);
    expect(trustScoreAccount.score).to.equal(0);
  });

  it("信誉分不应该高于 100", async () => {
    const [trustScorePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("trust_score"), owner.publicKey.toBuffer()],
      program.programId
    );

    // 先加到 100
    await program.methods
      .updateTrustScore(100, "优秀表现")
      .accounts({
        trustScore: trustScorePda,
        authority: owner.publicKey,
      })
      .rpc();

    // 再尝试超过
    await program.methods
      .updateTrustScore(50, "继续优秀")
      .accounts({
        trustScore: trustScorePda,
        authority: owner.publicKey,
      })
      .rpc();

    const trustScoreAccount = await program.account.trustScore.fetch(trustScorePda);
    expect(trustScoreAccount.score).to.equal(100);
  });
});


