/**
 * PersonaNFT Program Tests
 * 测试 PersonaNFT 的铸造、更新和验证功能
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PersonaNft } from "../target/types/persona_nft";
import { expect } from "chai";

describe("persona-nft", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PersonaNft as Program<PersonaNft>;
  const owner = provider.wallet;

  // 测试数据
  const testRiskProfile = 1; // Balanced
  const testKeywordsHash = Buffer.from("a".repeat(64), "hex");
  const testAiHash = Buffer.from("b".repeat(64), "hex");

  it("应该成功铸造 PersonaNFT", async () => {
    const [personaNftPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("persona_nft"), owner.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .mintPersonaNft(testRiskProfile, Array.from(testKeywordsHash), Array.from(testAiHash))
      .accounts({
        personaNft: personaNftPda,
        owner: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // 验证账户数据
    const nftAccount = await program.account.personaNft.fetch(personaNftPda);
    expect(nftAccount.owner.toString()).to.equal(owner.publicKey.toString());
    expect(nftAccount.riskProfile).to.equal(testRiskProfile);
    expect(nftAccount.nonTransferable).to.be.true;
  });

  it("不应该允许同一用户重复铸造", async () => {
    const [personaNftPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("persona_nft"), owner.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .mintPersonaNft(testRiskProfile, Array.from(testKeywordsHash), Array.from(testAiHash))
        .accounts({
          personaNft: personaNftPda,
          owner: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      expect.fail("应该抛出错误");
    } catch (err) {
      expect(err).to.exist;
    }
  });

  it("应该允许所有者更新 PersonaNFT", async () => {
    const [personaNftPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("persona_nft"), owner.publicKey.toBuffer()],
      program.programId
    );

    const newRiskProfile = 2; // Aggressive
    
    await program.methods
      .updatePersonaNft(newRiskProfile, null, null)
      .accounts({
        personaNft: personaNftPda,
        owner: owner.publicKey,
      })
      .rpc();

    const nftAccount = await program.account.personaNft.fetch(personaNftPda);
    expect(nftAccount.riskProfile).to.equal(newRiskProfile);
  });

  it("应该正确验证 PersonaNFT 所有权", async () => {
    const [personaNftPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("persona_nft"), owner.publicKey.toBuffer()],
      program.programId
    );

    const result = await program.methods
      .verifyPersonaNft()
      .accounts({
        personaNft: personaNftPda,
        claimedOwner: owner.publicKey,
      })
      .view();

    expect(result).to.be.true;
  });
});




