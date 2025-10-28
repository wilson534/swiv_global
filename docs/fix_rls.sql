-- 修复 Row Level Security 策略
-- 在 Supabase SQL Editor 中执行

-- 1. 删除现有的限制性策略
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;

-- 2. 为 matches 表添加宽松的策略（允许插入和查询）
CREATE POLICY "Allow insert matches" ON matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select matches" ON matches
  FOR SELECT USING (true);

-- 3. 为 messages 表添加宽松的策略
CREATE POLICY "Allow insert messages" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select messages" ON messages
  FOR SELECT USING (true);

-- 4. 验证策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('matches', 'messages')
ORDER BY tablename, policyname;



