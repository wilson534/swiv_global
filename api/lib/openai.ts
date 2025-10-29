/**
 * OpenAI 工具库
 * 处理 AI 内容生成和审核
 */

import { openai, MODEL } from './openai-config';

/**
 * Generate investment persona
 */
export async function generatePersona(answers: Record<string, any>) {
  const prompt = `
You are a professional investment advisor. Based on the user's answers below, generate an investment persona profile.

User answers:
${JSON.stringify(answers, null, 2)}

Return JSON format with:
{
  "riskType": "Conservative" | "Balanced" | "Aggressive",
  "keywords": [5 keywords in English describing investment preferences],
  "description": "2-3 sentences describing the persona in English",
  "aiSummary": "AI-generated personalized summary in English"
}

Return only JSON, no other content.
`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a professional investment persona analyst.'
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
 * Generate learning content
 */
export async function generateFeedContent(
  persona: any,
  count: number = 5
): Promise<any[]> {
  const prompt = `
Based on the user's investment persona, generate ${count} learning content cards in English.

User persona:
- Risk type: ${persona.riskType}
- Keywords: ${persona.keywords.join(', ')}

Each card contains:
{
  "title": "Title in English",
  "content": "200-300 words of content in English",
  "category": "Category (e.g., Basics, Risk Management, Market Analysis, etc.)",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedTime": minutes as number
}

Return JSON array containing only card data.
`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an investment education content creation expert.'
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
 * AI assistant answer
 */
export async function askAI(
  question: string,
  context?: string,
  persona?: any
): Promise<string> {
  const systemPrompt = persona 
    ? `You are Swiv's AI investment assistant. The user's investment style is ${persona.riskType}, focusing on ${persona.keywords.join(', ')}. Please provide personalized professional advice.`
    : 'You are Swiv\'s AI investment assistant. Please provide professional investment advice.';

  const userPrompt = context 
    ? `Context: ${context}\n\nQuestion: ${question}`
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

  return response.choices[0].message.content || 'Sorry, unable to generate an answer.';
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




