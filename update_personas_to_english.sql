-- 将所有测试用户的Persona数据更新为英文
-- Update Test Users' Persona Data to English

-- 更新用户 personas 为英文示例数据
UPDATE personas
SET 
  keywords = CASE risk_type
    WHEN 'Conservative' THEN ARRAY['Capital Preservation', 'Low Risk', 'Stable', 'Security', 'Long-term']
    WHEN 'Balanced' THEN ARRAY['Diversified', 'Moderate Risk', 'Growth', 'Balanced', 'Strategic']
    WHEN 'Aggressive' THEN ARRAY['High Returns', 'DeFi', 'Early Stage', 'NFTs', 'Innovation']
    ELSE keywords
  END,
  description = CASE risk_type
    WHEN 'Conservative' THEN 'Conservative investor seeking capital preservation with minimal risk. Focus on stable, long-term investments.'
    WHEN 'Balanced' THEN 'Balanced investor with moderate risk tolerance. Aims for steady growth through diversified portfolio.'
    WHEN 'Aggressive' THEN 'Aggressive investor pursuing high returns. Interested in DeFi, NFTs, and early-stage projects.'
    ELSE description
  END,
  ai_summary = 'AI-generated investment profile based on user preferences.'
WHERE keywords IS NOT NULL;

-- 显示更新结果
SELECT 
  profile_id,
  risk_type,
  keywords,
  LEFT(description, 50) as description_preview
FROM personas
ORDER BY created_at DESC
LIMIT 10;

