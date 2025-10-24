-- Swiv Supabase 数据库架构
-- Database Schema for Swiv

-- ==========================================
-- 启用扩展 / Enable Extensions
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Profiles 表 / User Profiles Table
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  persona_nft_mint TEXT,  -- PersonaNFT 的 mint 地址
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);
CREATE INDEX idx_profiles_trust_score ON profiles(trust_score);

-- ==========================================
-- 2. Personas 表 / Investment Personas Table
-- ==========================================
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('Conservative', 'Balanced', 'Aggressive')),
  keywords TEXT[] NOT NULL,
  description TEXT NOT NULL,
  ai_summary TEXT NOT NULL,
  keywords_hash TEXT,  -- 用于链上验证
  ai_hash TEXT,        -- 用于链上验证
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_personas_profile ON personas(profile_id);
CREATE INDEX idx_personas_risk_type ON personas(risk_type);
CREATE INDEX idx_personas_keywords ON personas USING GIN(keywords);

-- ==========================================
-- 3. Swipes 表 / Swipe Actions Table
-- 记录所有滑动操作
-- ==========================================
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_profile UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 确保同一对用户只能操作一次
  UNIQUE(from_profile, to_profile)
);

-- 索引
CREATE INDEX idx_swipes_from ON swipes(from_profile);
CREATE INDEX idx_swipes_to ON swipes(to_profile);
CREATE INDEX idx_swipes_action ON swipes(action);

-- ==========================================
-- 4. Matches 表 / Matches Table
-- 双向匹配成功记录
-- ==========================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  on_chain_tx TEXT,  -- 链上交易哈希
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 确保用户对不重复
  CHECK (user_a < user_b)  -- 强制 user_a 的 UUID 小于 user_b
);

-- 索引
CREATE INDEX idx_matches_user_a ON matches(user_a);
CREATE INDEX idx_matches_user_b ON matches(user_b);
CREATE INDEX idx_matches_active ON matches(is_active);

-- ==========================================
-- 5. Messages 表 / Messages Table
-- 聊天消息
-- ==========================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_flagged ON messages(flagged) WHERE flagged = TRUE;

-- ==========================================
-- 6. Reports 表 / User Reports Table
-- 用户举报记录
-- ==========================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ==========================================
-- 7. Trust Score History 表 / Trust Score Changes
-- 信誉分变更历史
-- ==========================================
CREATE TABLE trust_score_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,  -- 变化量（正数或负数）
  reason TEXT NOT NULL,
  old_score INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_trust_history_profile ON trust_score_history(profile_id);
CREATE INDEX idx_trust_history_created ON trust_score_history(created_at DESC);

-- ==========================================
-- 8. Feed Interactions 表 / Learning Feed Interactions
-- 学习流互动记录
-- ==========================================
CREATE TABLE feed_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,  -- 内容的唯一标识
  action TEXT NOT NULL CHECK (action IN ('view', 'complete', 'ask')),
  duration_seconds INTEGER,  -- 浏览时长（秒）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_feed_profile ON feed_interactions(profile_id);
CREATE INDEX idx_feed_content ON feed_interactions(content_id);
CREATE INDEX idx_feed_action ON feed_interactions(action);

-- ==========================================
-- Row Level Security (RLS)
-- ==========================================

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_interactions ENABLE ROW LEVEL SECURITY;

-- Profiles: 用户可以读取所有，但只能更新自己的
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (wallet_address = current_setting('request.jwt.claim.wallet_address', true));

-- Personas: 可以读取所有，但只能创建/更新自己的
CREATE POLICY "Personas are viewable by everyone" ON personas
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own persona" ON personas
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE wallet_address = current_setting('request.jwt.claim.wallet_address', true)
    )
  );

-- Matches: 只能查看自己参与的匹配
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (
    user_a IN (
      SELECT id FROM profiles 
      WHERE wallet_address = current_setting('request.jwt.claim.wallet_address', true)
    )
    OR user_b IN (
      SELECT id FROM profiles 
      WHERE wallet_address = current_setting('request.jwt.claim.wallet_address', true)
    )
  );

-- Messages: 只能查看和发送自己匹配中的消息
CREATE POLICY "Users can view messages in their matches" ON messages
  FOR SELECT USING (
    match_id IN (
      SELECT id FROM matches 
      WHERE user_a IN (
        SELECT id FROM profiles 
        WHERE wallet_address = current_setting('request.jwt.claim.wallet_address', true)
      )
      OR user_b IN (
        SELECT id FROM profiles 
        WHERE wallet_address = current_setting('request.jwt.claim.wallet_address', true)
      )
    )
  );

CREATE POLICY "Users can send messages in their matches" ON messages
  FOR INSERT WITH CHECK (
    sender_id IN (
      SELECT id FROM profiles 
      WHERE wallet_address = current_setting('request.jwt.claim.wallet_address', true)
    )
  );

-- ==========================================
-- 触发器 / Triggers
-- ==========================================

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 自动记录 TrustScore 变更
CREATE OR REPLACE FUNCTION log_trust_score_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.trust_score != NEW.trust_score THEN
    INSERT INTO trust_score_history (profile_id, delta, reason, old_score, new_score)
    VALUES (
      NEW.id,
      NEW.trust_score - OLD.trust_score,
      'manual_update',  -- 可以通过应用层传入具体原因
      OLD.trust_score,
      NEW.trust_score
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_trust_score_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.trust_score IS DISTINCT FROM NEW.trust_score)
  EXECUTE FUNCTION log_trust_score_change();

-- ==========================================
-- 视图 / Views
-- ==========================================

-- 用户完整信息视图
CREATE VIEW user_full_profile AS
SELECT 
  p.id,
  p.wallet_address,
  p.persona_nft_mint,
  p.trust_score,
  p.created_at,
  per.risk_type,
  per.keywords,
  per.description,
  per.ai_summary
FROM profiles p
LEFT JOIN personas per ON p.id = per.profile_id;

-- 匹配详情视图
CREATE VIEW match_details AS
SELECT 
  m.id AS match_id,
  m.matched_at,
  m.on_chain_tx,
  m.is_active,
  pa.wallet_address AS user_a_wallet,
  pb.wallet_address AS user_b_wallet,
  pa.trust_score AS user_a_trust_score,
  pb.trust_score AS user_b_trust_score
FROM matches m
JOIN profiles pa ON m.user_a = pa.id
JOIN profiles pb ON m.user_b = pb.id;

-- ==========================================
-- 初始数据 / Seed Data (可选)
-- ==========================================

-- 可以在这里插入测试数据

-- ==========================================
-- 完成 / Complete
-- ==========================================

-- 授予必要的权限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;


