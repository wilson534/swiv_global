/**
 * OpenAI 工具库
 * 处理 AI 内容生成和审核
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

/**
 * 生成投资人格
 */
export async function generatePersona(answers: Record<string, any>) {
  const prompt = `
你是一位专业的投资顾问。基于用户的以下回答，生成一个投资人格画像。

用户回答：
${JSON.stringify(answers, null, 2)}

请返回 JSON 格式，包含：
{
  "riskType": "Conservative" | "Balanced" | "Aggressive",
  "keywords": [5个关键词，描述投资偏好],
  "description": "2-3句话的人格描述",
  "aiSummary": "AI 生成的个性化总结"
}

只返回 JSON，不要其他内容。
`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: '你是一个专业的投资人格分析师。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  return content ? JSON.parse(content) : null;
}

/**
 * 生成学习内容
 */
export async function generateFeedContent(
  persona: any,
  count: number = 5
): Promise<any[]> {
  const prompt = `
基于用户的投资人格，生成 ${count} 个学习内容卡片。

用户人格：
- 风险类型: ${persona.riskType}
- 关键词: ${persona.keywords.join(', ')}

每个卡片包含：
{
  "title": "标题",
  "content": "200-300字的内容",
  "category": "类别（如：基础知识、风险管理、市场分析等）",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedTime": 分钟数
}

返回 JSON 数组，只包含卡片数据。
`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: '你是一个投资教育内容创作专家。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  const result = content ? JSON.parse(content) : { cards: [] };
  return result.cards || [];
}

/**
 * AI 助手回答
 */
export async function askAI(
  question: string,
  context?: string,
  persona?: any
): Promise<string> {
  const systemPrompt = persona 
    ? `你是 Swiv 的 AI 投资助手。用户的投资风格是 ${persona.riskType}，关注 ${persona.keywords.join('、')}。请提供个性化的专业建议。`
    : '你是 Swiv 的 AI 投资助手。请提供专业的投资建议。';

  const userPrompt = context 
    ? `上下文：${context}\n\n问题：${question}`
    : question;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return response.choices[0].message.content || '抱歉，无法生成回答。';
}

/**
 * 内容审核（检测诈骗、不当内容）
 */
export async function moderateContent(text: string): Promise<{
  flagged: boolean;
  categories: string[];
}> {
  const response = await openai.moderations.create({
    input: text,
  });

  const result = response.results[0];
  const flaggedCategories: string[] = [];

  if (result.categories.harassment) flaggedCategories.push('harassment');
  if (result.categories.hate) flaggedCategories.push('hate');
  if (result.categories.sexual) flaggedCategories.push('sexual');
  if (result.categories.violence) flaggedCategories.push('violence');

  return {
    flagged: result.flagged,
    categories: flaggedCategories,
  };
}

/**
 * 检测诈骗模式
 */
export async function detectScam(message: string): Promise<boolean> {
  // 正则检测常见诈骗模式
  const scamPatterns = [
    /微信|WeChat|VX/gi,
    /TG|Telegram|电报/gi,
    /转账|transfer|汇款/gi,
    /私聊|DM|direct message/gi,
    /QQ|qq/gi,
    /加我|add me|联系我/gi,
    /http|https|www\./gi,  // 链接
  ];

  const hasScamPattern = scamPatterns.some(pattern => pattern.test(message));
  
  if (hasScamPattern) {
    return true;
  }

  // 使用 AI 检测更复杂的诈骗语言
  const moderation = await moderateContent(message);
  
  return moderation.flagged;
}


