-- 将所有历史聊天消息中的中文更新为英文
-- Update all Chinese messages in chat history to English

-- 更新常见的中文问候语为英文
UPDATE messages
SET content = CASE 
  WHEN content = '你好' THEN 'Hello!'
  WHEN content = '你好！' THEN 'Hello!'
  WHEN content = '你好呀！😊' THEN 'Hi there! 😊'
  WHEN content = '你好！很高兴认识你' THEN 'Hello! Nice to meet you!'
  WHEN content = '我也很高兴认识你' THEN 'Nice to meet you too!'
  WHEN content LIKE '%你好%' THEN REPLACE(content, '你好', 'Hello')
  ELSE content
END
WHERE content ~ '[\u4e00-\u9fa5]'; -- Only update messages containing Chinese characters

-- 显示更新后的消息
SELECT 
  id,
  LEFT(content, 50) as message_preview,
  created_at
FROM messages
ORDER BY created_at DESC
LIMIT 20;

