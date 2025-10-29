-- Add More English Test Users for Match Page
-- 为Match页面添加更多英文测试用户

-- 首先清理可能存在的测试用户
DELETE FROM personas WHERE profile_id IN (
  SELECT id FROM profiles WHERE wallet_address LIKE 'test_user_%'
);
DELETE FROM profiles WHERE wallet_address LIKE 'test_user_%';

-- 添加10个新的测试用户
-- User 1: Conservative DeFi Enthusiast
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_defi_001', 85, NOW() - INTERVAL '10 days')
RETURNING id;

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Conservative',
  ARRAY['DeFi Staking', 'Yield Farming', 'Low Risk', 'Passive Income', 'Long-term'],
  'Conservative DeFi enthusiast focused on stable yields and proven protocols. Prefers established platforms with strong track records.',
  'Risk-averse investor seeking consistent returns through DeFi staking and yield farming strategies.',
  NOW() - INTERVAL '10 days'
FROM profiles WHERE wallet_address = 'test_user_defi_001';

-- User 2: Balanced NFT Collector
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_nft_002', 72, NOW() - INTERVAL '8 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Balanced',
  ARRAY['NFT Art', 'Digital Collectibles', 'Community', 'Blue Chip', 'Utility'],
  'Balanced NFT collector with focus on art and utility. Invests in both established blue-chip projects and promising new collections.',
  'Diversified NFT portfolio strategy balancing established collections with emerging opportunities.',
  NOW() - INTERVAL '8 days'
FROM profiles WHERE wallet_address = 'test_user_nft_002';

-- User 3: Aggressive GameFi Player
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_gamefi_003', 68, NOW() - INTERVAL '5 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Aggressive',
  ARRAY['GameFi', 'P2E', 'Metaverse', 'High APY', 'Trending'],
  'Aggressive GameFi investor chasing high returns in play-to-earn and metaverse projects. Early adopter of trending games.',
  'High-risk tolerance investor focused on GameFi and metaverse opportunities with maximum growth potential.',
  NOW() - INTERVAL '5 days'
FROM profiles WHERE wallet_address = 'test_user_gamefi_003';

-- User 4: Conservative Bitcoin Maximalist
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_btc_004', 92, NOW() - INTERVAL '15 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Conservative',
  ARRAY['Bitcoin', 'HODLing', 'Store of Value', 'Security', 'Decentralization'],
  'Conservative Bitcoin maximalist focused on long-term wealth preservation. Believes in sound money principles and minimal altcoin exposure.',
  'Bitcoin-focused strategy emphasizing security, decentralization, and long-term value storage.',
  NOW() - INTERVAL '15 days'
FROM profiles WHERE wallet_address = 'test_user_btc_004';

-- User 5: Balanced Layer 2 Investor
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_l2_005', 78, NOW() - INTERVAL '6 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Balanced',
  ARRAY['Layer 2', 'Scalability', 'Arbitrum', 'Optimism', 'Infrastructure'],
  'Balanced investor focused on Layer 2 scaling solutions. Invests in infrastructure projects solving Ethereum scalability challenges.',
  'Strategic L2 investment approach balancing established rollups with emerging scaling solutions.',
  NOW() - INTERVAL '6 days'
FROM profiles WHERE wallet_address = 'test_user_l2_005';

-- User 6: Aggressive Meme Coin Trader
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_meme_006', 55, NOW() - INTERVAL '3 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Aggressive',
  ARRAY['Meme Coins', 'Short-term', 'Community Driven', 'High Risk', 'Viral Tokens'],
  'Aggressive meme coin trader with high risk tolerance. Focuses on community-driven tokens and viral trends for quick gains.',
  'High-risk meme coin trading strategy leveraging social trends and community momentum.',
  NOW() - INTERVAL '3 days'
FROM profiles WHERE wallet_address = 'test_user_meme_006';

-- User 7: Balanced DAO Participant
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_dao_007', 88, NOW() - INTERVAL '12 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Balanced',
  ARRAY['DAO Governance', 'Voting', 'Community', 'Decentralization', 'Long-term Vision'],
  'Balanced DAO enthusiast actively participating in governance. Values community-driven decision making and long-term project sustainability.',
  'Active DAO participant balancing governance participation with strategic token investments.',
  NOW() - INTERVAL '12 days'
FROM profiles WHERE wallet_address = 'test_user_dao_007';

-- User 8: Conservative Stablecoin Strategist
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_stable_008', 95, NOW() - INTERVAL '20 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Conservative',
  ARRAY['Stablecoins', 'USDC', 'Risk Management', 'Cash Flow', 'Safety First'],
  'Conservative investor maximizing stablecoin yields through safe protocols. Prioritizes capital preservation and consistent cash flow.',
  'Ultra-conservative strategy focusing on stablecoin yields and capital preservation.',
  NOW() - INTERVAL '20 days'
FROM profiles WHERE wallet_address = 'test_user_stable_008';

-- User 9: Aggressive AI & Web3 Early Bird
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_ai_009', 62, NOW() - INTERVAL '4 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Aggressive',
  ARRAY['AI Tokens', 'Web3 AI', 'Cutting Edge', 'Innovation', 'Future Tech'],
  'Aggressive investor betting on AI and Web3 convergence. Early adopter of AI-powered blockchain projects and neural networks on-chain.',
  'Forward-looking strategy targeting AI and Web3 intersection with high growth potential.',
  NOW() - INTERVAL '4 days'
FROM profiles WHERE wallet_address = 'test_user_ai_009';

-- User 10: Balanced Ethereum Builder
INSERT INTO profiles (wallet_address, trust_score, created_at)
VALUES ('test_user_eth_010', 82, NOW() - INTERVAL '9 days');

INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary, created_at)
SELECT 
  id,
  'Balanced',
  ARRAY['Ethereum', 'Smart Contracts', 'dApps', 'EVM', 'Building'],
  'Balanced Ethereum ecosystem builder and investor. Focuses on infrastructure, developer tools, and promising dApps on EVM chains.',
  'Ethereum-centric investment strategy supporting ecosystem growth and innovation.',
  NOW() - INTERVAL '9 days'
FROM profiles WHERE wallet_address = 'test_user_eth_010';

-- 显示所有新添加的用户
SELECT 
  p.wallet_address,
  p.trust_score,
  pe.risk_type,
  pe.keywords,
  LEFT(pe.description, 60) as description_preview
FROM profiles p
JOIN personas pe ON p.id = pe.profile_id
WHERE p.wallet_address LIKE 'test_user_%'
ORDER BY p.created_at DESC;

