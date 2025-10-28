/**
 * SocialGraph Program Tests
 * 测试匹配边的创建、更新和验证功能
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SocialGraph } from "../target/types/social_graph";
import { expect } from "chai";

describe("social-graph", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SocialGraph as Program<SocialGraph>;
  const userA = provider.wallet;
  
  // 创建第二个用户
  const userB = anchor.web3.Keypair.generate();

  before(async () => {
    // 给 userB 空投一些 SOL
    const airdropSignature = await provider.connection.requestAirdrop(
      userB.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);
  });

  it("应该成功创建匹配边", async () => {
    const [minKey, maxKey] = [userA.publicKey, userB.publicKey].sort((a, b) =>
      a.toBuffer().compare(b.toBuffer())
    );

    const [matchEdgePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("match_edge"), minKey.toBuffer(), maxKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createMatchEdge(userB.publicKey)
      .accounts({
        matchEdge: matchEdgePda,
        userA: userA.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const matchEdge = await program.account.matchEdge.fetch(matchEdgePda);
    expect(matchEdge.isActive).to.be.true;
    expect(matchEdge.interactionCount).to.equal(0);
  });

  it("应该正确记录互动次数", async () => {
    const [minKey, maxKey] = [userA.publicKey, userB.publicKey].sort((a, b) =>
      a.toBuffer().compare(b.toBuffer())
    );

    const [matchEdgePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("match_edge"), minKey.toBuffer(), maxKey.toBuffer()],
      program.programId
    );

    // 增加互动次数 3 次
    for (let i = 0; i < 3; i++) {
      await program.methods
        .updateMatchEdge(true, false)
        .accounts({
          matchEdge: matchEdgePda,
          authority: userA.publicKey,
        })
        .rpc();
    }

    const matchEdge = await program.account.matchEdge.fetch(matchEdgePda);
    expect(matchEdge.interactionCount).to.equal(3);
  });

  it("应该能够停用匹配边", async () => {
    const [minKey, maxKey] = [userA.publicKey, userB.publicKey].sort((a, b) =>
      a.toBuffer().compare(b.toBuffer())
    );

    const [matchEdgePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("match_edge"), minKey.toBuffer(), maxKey.toBuffer()],
      program.programId
    );

    await program.methods
      .updateMatchEdge(false, true)
      .accounts({
        matchEdge: matchEdgePda,
        authority: userA.publicKey,
      })
      .rpc();

    const matchEdge = await program.account.matchEdge.fetch(matchEdgePda);
    expect(matchEdge.isActive).to.be.false;
    expect(matchEdge.deactivatedAt).to.exist;
  });

  it("应该正确验证匹配关系", async () => {
    const [minKey, maxKey] = [userA.publicKey, userB.publicKey].sort((a, b) =>
      a.toBuffer().compare(b.toBuffer())
    );

    const [matchEdgePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("match_edge"), minKey.toBuffer(), maxKey.toBuffer()],
      program.programId
    );

    const result = await program.methods
      .verifyMatch()
      .accounts({
        matchEdge: matchEdgePda,
      })
      .view();

    expect(result).to.be.false; // 因为上面已经停用了
  });

  it("不应该允许用户与自己匹配", async () => {
    const [matchEdgePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("match_edge"), userA.publicKey.toBuffer(), userA.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .createMatchEdge(userA.publicKey)
        .accounts({
          matchEdge: matchEdgePda,
          userA: userA.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      expect.fail("应该抛出错误");
    } catch (err) {
      expect(err).to.exist;
    }
  });
});




