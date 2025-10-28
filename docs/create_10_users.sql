-- 创建10个不同的虚拟测试用户
-- 在 Supabase SQL Editor 中执行

-- 1. 插入10个测试用户
INSERT INTO profiles (wallet_address, trust_score) VALUES
  ('demo_wallet_123', 75),
  ('Alice8x9K2mN4pQ', 92),
  ('Bob5v7W3nT8zR', 88),
  ('Carol2h4J6kL9m', 78),
  ('David9q3S5tY7u', 85),
  ('Emma4r6V8xZ2b', 94),
  ('Frank7w9A3cD5e', 72),
  ('Grace3t5F7hJ9k', 89),
  ('Henry6y8L2nP4q', 81),
  ('Iris9z3M5rT7v', 96),
  ('Jack2b4N6wX8y', 76)
ON CONFLICT (wallet_address) DO NOTHING;

-- 2. 插入多样化的 personas
WITH profile_ids AS (
  SELECT id, wallet_address FROM profiles 
  WHERE wallet_address IN (
    'demo_wallet_123', 'Alice8x9K2mN4pQ', 'Bob5v7W3nT8zR', 'Carol2h4J6kL9m',
    'David9q3S5tY7u', 'Emma4r6V8xZ2b', 'Frank7w9A3cD5e', 'Grace3t5F7hJ9k',
    'Henry6y8L2nP4q', 'Iris9z3M5rT7v', 'Jack2b4N6wX8y'
  )
)
INSERT INTO personas (profile_id, risk_type, keywords, description, ai_summary)
SELECT 
  id,
  CASE wallet_address
    WHEN 'demo_wallet_123' THEN 'Balanced'
    WHEN 'Alice8x9K2mN4pQ' THEN 'Aggressive'
    WHEN 'Bob5v7W3nT8zR' THEN 'Balanced'
    WHEN 'Carol2h4J6kL9m' THEN 'Conservative'
    WHEN 'David9q3S5tY7u' THEN 'Aggressive'
    WHEN 'Emma4r6V8xZ2b' THEN 'Balanced'
    WHEN 'Frank7w9A3cD5e' THEN 'Conservative'
    WHEN 'Grace3t5F7hJ9k' THEN 'Aggressive'
    WHEN 'Henry6y8L2nP4q' THEN 'Balanced'
    WHEN 'Iris9z3M5rT7v' THEN 'Conservative'
    WHEN 'Jack2b4N6wX8y' THEN 'Aggressive'
  END,
  CASE wallet_address
    WHEN 'demo_wallet_123' THEN ARRAY['DeFi', 'NFT', '长期投资']
    WHEN 'Alice8x9K2mN4pQ' THEN ARRAY['Meme币', '短线交易', 'GameFi']
    WHEN 'Bob5v7W3nT8zR' THEN ARRAY['Layer2', 'DeFi', '流动性挖矿']
    WHEN 'Carol2h4J6kL9m' THEN ARRAY['稳定币', 'ETF', '定投']
    WHEN 'David9q3S5tY7u' THEN ARRAY['链游', '元宇宙', 'Web3']
    WHEN 'Emma4r6V8xZ2b' THEN ARRAY['NFT艺术', '收藏品', 'DAO']
    WHEN 'Frank7w9A3cD5e' THEN ARRAY['质押', '储蓄', '长期持有']
    WHEN 'Grace3t5F7hJ9k' THEN ARRAY['合约交易', '杠杆', '期权']
    WHEN 'Henry6y8L2nP4q' THEN ARRAY['价值投资', '基本面', '蓝筹币']
    WHEN 'Iris9z3M5rT7v' THEN ARRAY['国债', '低风险', '保本']
    WHEN 'Jack2b4N6wX8y' THEN ARRAY['新币', 'IDO', '早期投资']
  END,
  CASE wallet_address
    WHEN 'demo_wallet_123' THEN '对加密货币和 DeFi 感兴趣'
    WHEN 'Alice8x9K2mN4pQ' THEN '热衷于 Meme 币和 GameFi，追求高收益，喜欢尝试新项目'
    WHEN 'Bob5v7W3nT8zR' THEN '专注于 Layer2 和 DeFi 协议，注重技术分析和市场趋势'
    WHEN 'Carol2h4J6kL9m' THEN '保守型投资者，偏好稳定币和定期定额投资策略'
    WHEN 'David9q3S5tY7u' THEN '链游玩家和元宇宙爱好者，看好 Web3 未来发展'
    WHEN 'Emma4r6V8xZ2b' THEN 'NFT 艺术收藏家，参与多个 DAO 组织治理'
    WHEN 'Frank7w9A3cD5e' THEN '长期持有者，主要通过质押获得稳定收益'
    WHEN 'Grace3t5F7hJ9k' THEN '专业交易员，擅长合约交易和杠杆操作'
    WHEN 'Henry6y8L2nP4q' THEN '价值投资者，关注项目基本面和长期价值'
    WHEN 'Iris9z3M5rT7v' THEN '极度保守，只投资低风险产品，注重本金安全'
    WHEN 'Jack2b4N6wX8y' THEN '早期投资者，喜欢参与 IDO 和新项目孵化'
  END,
  CASE wallet_address
    WHEN 'demo_wallet_123' THEN 'AI 生成的投资人格摘要'
    WHEN 'Alice8x9K2mN4pQ' THEN '高风险偏好，追求短期高收益，适合激进型投资策略'
    WHEN 'Bob5v7W3nT8zR' THEN '技术导向，注重项目技术创新，平衡风险与收益'
    WHEN 'Carol2h4J6kL9m' THEN '风险厌恶，追求稳定增长，适合保守型投资组合'
    WHEN 'David9q3S5tY7u' THEN 'Web3 信仰者，看好未来趋势，愿意承担创新风险'
    WHEN 'Emma4r6V8xZ2b' THEN '艺术品味，社区参与度高，注重长期文化价值'
    WHEN 'Frank7w9A3cD5e' THEN '稳健收益，低波动偏好，适合退休规划型投资'
    WHEN 'Grace3t5F7hJ9k' THEN '专业交易者，风险管理能力强，追求稳定盈利'
    WHEN 'Henry6y8L2nP4q' THEN '价值投资理念，深度研究，适合长期布局'
    WHEN 'Iris9z3M5rT7v' THEN '极度保守，几乎零风险容忍，适合保本型产品'
    WHEN 'Jack2b4N6wX8y' THEN '风险投资者，喜欢早期项目，追求百倍回报'
  END
FROM profile_ids
ON CONFLICT DO NOTHING;

-- 3. 验证创建的用户
SELECT 
  p.wallet_address as "钱包地址",
  per.risk_type as "投资风格",
  p.trust_score as "信誉分",
  per.keywords as "关键词",
  per.description as "描述"
FROM profiles p
JOIN personas per ON p.id = per.profile_id
WHERE p.wallet_address != 'demo_wallet_123'
ORDER BY p.trust_score DESC;

-- 4. 统计
SELECT 
  '总用户数' as info,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
  '总人格数' as info,
  COUNT(*) as count
FROM personas
UNION ALL
SELECT 
  risk_type || ' 投资者' as info,
  COUNT(*) as count
FROM personas
GROUP BY risk_type;



