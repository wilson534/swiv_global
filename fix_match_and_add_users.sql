-- 完整解决方案：清除匹配记录 + 添加新用户
-- Complete Solution: Clear matches + Add new users

-- ======================================
-- 第1步：清除当前用户的所有匹配记录
-- Step 1: Clear all matches for current user
-- ======================================
DELETE FROM matches 
WHERE user_a IN (SELECT id FROM profiles WHERE wallet_address = 'demo_wallet_123')
   OR user_b IN (SELECT id FROM profiles WHERE wallet_address = 'demo_wallet_123');

-- ======================================
-- 第2步：添加新的测试用户（如果不存在）
-- Step 2: Add new test users (if not exist)
-- ======================================

-- 删除旧的test_user数据（如果存在）
DELETE FROM personas WHERE profile_id IN (
  SELECT id FROM profiles WHERE wallet_address LIKE 'test_user_%'
);
DELETE FROM profiles WHERE wallet_address LIKE 'test_user_%';

-- User 1: DeFi Enthusiast
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_defi_001', 85, NOW() - INTERVAL '10 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Conservative',
  ARRAY['DeFi Staking', 'Yield Farming', 'Low Risk', 'Passive Income', 'Long-term'],
  'Conservative DeFi enthusiast focused on stable yields and proven protocols. Prefers established platforms.',
  'Risk-averse investor seeking consistent returns through DeFi staking.',
  NOW() - INTERVAL '10 days'
FROM profiles WHERE wallet_address = 'test_user_defi_001';

-- User 2: NFT Collector
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_nft_002', 72, NOW() - INTERVAL '8 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Balanced',
  ARRAY['NFT Art', 'Digital Collectibles', 'Community', 'Blue Chip', 'Utility'],
  'Balanced NFT collector focusing on art and utility. Invests in blue-chip and emerging collections.',
  'Diversified NFT portfolio strategy.',
  NOW() - INTERVAL '8 days'
FROM profiles WHERE wallet_address = 'test_user_nft_002';

-- User 3: GameFi Player
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_gamefi_003', 68, NOW() - INTERVAL '5 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Aggressive',
  ARRAY['GameFi', 'P2E', 'Metaverse', 'High APY', 'Trending'],
  'Aggressive GameFi investor chasing high returns in play-to-earn. Early adopter of trending games.',
  'High-risk GameFi and metaverse strategy.',
  NOW() - INTERVAL '5 days'
FROM profiles WHERE wallet_address = 'test_user_gamefi_003';

-- User 4: Bitcoin Maximalist
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_btc_004', 92, NOW() - INTERVAL '15 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Conservative',
  ARRAY['Bitcoin', 'HODLing', 'Store of Value', 'Security', 'Decentralization'],
  'Conservative Bitcoin maximalist focused on long-term wealth preservation and sound money principles.',
  'Bitcoin-focused long-term strategy.',
  NOW() - INTERVAL '15 days'
FROM profiles WHERE wallet_address = 'test_user_btc_004';

-- User 5: Layer 2 Investor
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_l2_005', 78, NOW() - INTERVAL '6 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Balanced',
  ARRAY['Layer 2', 'Scalability', 'Arbitrum', 'Optimism', 'Infrastructure'],
  'Balanced investor focused on Layer 2 scaling solutions solving Ethereum challenges.',
  'Strategic L2 infrastructure investment.',
  NOW() - INTERVAL '6 days'
FROM profiles WHERE wallet_address = 'test_user_l2_005';

-- ======================================
-- 第3步：验证结果
-- Step 3: Verify results
-- ======================================

-- 显示当前用户的匹配记录（应该为空）
SELECT COUNT(*) as match_count, 'Current user matches' as info
FROM matches 
WHERE user_a IN (SELECT id FROM profiles WHERE wallet_address = 'demo_wallet_123')
   OR user_b IN (SELECT id FROM profiles WHERE wallet_address = 'demo_wallet_123');

-- 显示所有可用的候选用户
SELECT 
  p.wallet_address,
  p.trust_score,
  pe.risk_type,
  pe.keywords
FROM profiles p
JOIN personas pe ON p.id = pe.profile_id
WHERE p.wallet_address != 'demo_wallet_123'
ORDER BY p.created_at DESC
LIMIT 20;

