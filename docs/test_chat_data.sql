-- 测试聊天数据
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 插入测试用户 profiles
INSERT INTO profiles (wallet_address, trust_score) VALUES
  ('demo_wallet_123', 75),
  ('7xKXtg2CW87dAbcDEfGH', 80),
  ('9pQRst3DX92fXyZaBcDe', 85),
  ('4mNOuv5EY83gPqRsTuVw', 70)
ON CONFLICT (wallet_address) DO NOTHING;

-- 2. 插入测试 personas
WITH profile_ids AS (
  SELECT id, wallet_address FROM profiles 
  WHERE wallet_address IN ('demo_wallet_123', '7xKXtg2CW87dAbcDEfGH', '9pQRst3DX92fXyZaBcDe', '4mNOuv5EY83gPqRsTuVw')
)
INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary)
SELECT 
  id,
  CASE wallet_address
    WHEN 'demo_wallet_123' THEN 'Balanced'
    WHEN '7xKXtg2CW87dAbcDEfGH' THEN 'Balanced'
    WHEN '9pQRst3DX92fXyZaBcDe' THEN 'Aggressive'
    WHEN '4mNOuv5EY83gPqRsTuVw' THEN 'Conservative'
  END,
  ARRAY['DeFi', 'NFT', '长期投资'],
  '对加密货币和 DeFi 感兴趣',
  'AI 生成的投资人格摘要'
FROM profile_ids
ON CONFLICT DO NOTHING;

-- 3. 不需要预设 swipes
-- matches 会在用户右滑喜欢时自动创建（单向匹配）

-- 4. 插入测试消息（在有 matches 之后才能插入）
-- 这部分需要在用户右滑匹配成功后才会有数据
-- 或者手动执行下面的脚本创建一个测试匹配和消息

/*
-- 手动创建一个测试匹配（用于测试聊天功能）
WITH demo_profile AS (
  SELECT id FROM profiles WHERE wallet_address = 'demo_wallet_123'
),
other_profile AS (
  SELECT id FROM profiles WHERE wallet_address = '7xKXtg2CW87dAbcDEfGH'
),
new_match AS (
  INSERT INTO matches (user_a, user_b, matched_at, is_active)
  SELECT 
    LEAST(demo_profile.id, other_profile.id),
    GREATEST(demo_profile.id, other_profile.id),
    NOW() - INTERVAL '2 hours',
    true
  FROM demo_profile, other_profile
  ON CONFLICT DO NOTHING
  RETURNING id, user_a, user_b
)
INSERT INTO messages (match_id, sender_id, content, created_at)
SELECT 
  new_match.id,
  other_profile.id,
  '你好！很高兴认识你',
  NOW() - INTERVAL '2 hours'
FROM new_match, other_profile
UNION ALL
SELECT 
  new_match.id,
  demo_profile.id,
  '你好！我也很高兴认识你',
  NOW() - INTERVAL '1 hour 50 minutes'
FROM new_match, demo_profile
UNION ALL
SELECT 
  new_match.id,
  other_profile.id,
  '最近有什么好的投资机会吗？',
  NOW() - INTERVAL '1 hour'
FROM new_match, other_profile;
*/

-- 5. 验证数据
SELECT 
  'Profiles 已创建' as info,
  COUNT(*) as count
FROM profiles
WHERE wallet_address IN ('demo_wallet_123', '7xKXtg2CW87dAbcDEfGH', '9pQRst3DX92fXyZaBcDe', '4mNOuv5EY83gPqRsTuVw')
UNION ALL
SELECT 
  'Personas 已创建' as info,
  COUNT(*) as count
FROM personas
WHERE profile_id IN (
  SELECT id FROM profiles 
  WHERE wallet_address IN ('demo_wallet_123', '7xKXtg2CW87dAbcDEfGH', '9pQRst3DX92fXyZaBcDe', '4mNOuv5EY83gPqRsTuVw')
);

-- 显示可匹配的用户
SELECT 
  '可匹配的用户' as info,
  p.wallet_address,
  per.risk_type as "投资风格"
FROM profiles p
JOIN personas per ON p.id = per.profile_id
WHERE p.wallet_address != 'demo_wallet_123'
  AND p.wallet_address IN ('7xKXtg2CW87dAbcDEfGH', '9pQRst3DX92fXyZaBcDe', '4mNOuv5EY83gPqRsTuVw');

