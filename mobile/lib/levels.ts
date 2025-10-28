/**
 * Level System
 * 等级系统配置
 */

export interface LevelConfig {
  level: number;
  title: string;
  icon: string;
  requiredXP: number;
  description: string;
}

export interface GrowthProfile {
  // 学习维度
  daysActive: number;
  cardsLearned: number;
  questionsAsked: number;
  
  // 社交维度
  helpfulAnswers: number;
  mentorScore: number;
  
  // 综合等级
  level: number;
  levelTitle: string;
  levelIcon: string;
  nextLevelProgress: number;
  totalXP: number;
  
  // 可选：资产（仅在用户开启时显示）
  showAssets: boolean;
  assetLevel?: 'whale' | 'dolphin' | 'fish' | 'shrimp';
  assetIcon?: string;
}

// 等级配置（1-50级）
export const LEVEL_CONFIGS: LevelConfig[] = [
  // 新手阶段 (1-10)
  { level: 1, title: '好奇新手', icon: '🌱', requiredXP: 0, description: '刚刚开始学习之旅' },
  { level: 2, title: '积极学徒', icon: '🌿', requiredXP: 100, description: '开始认真学习' },
  { level: 3, title: '坚持学习者', icon: '📖', requiredXP: 250, description: '坚持学习3天' },
  { level: 5, title: '勤奋学生', icon: '📚', requiredXP: 500, description: '坚持学习一周' },
  { level: 7, title: '知识猎人', icon: '🔍', requiredXP: 1000, description: '开始深入研究' },
  { level: 10, title: '知识探索者', icon: '🧭', requiredXP: 1500, description: '掌握基础知识' },
  
  // 进阶阶段 (11-25)
  { level: 12, title: '市场观察者', icon: '👀', requiredXP: 2000, description: '开始理解市场' },
  { level: 15, title: '投资观察员', icon: '📊', requiredXP: 3000, description: '学会基础分析' },
  { level: 18, title: '市场分析师', icon: '📈', requiredXP: 4500, description: '能够独立分析' },
  { level: 20, title: '策略制定者', icon: '🎯', requiredXP: 6000, description: '形成自己的策略' },
  { level: 25, title: '实战投资者', icon: '💼', requiredXP: 8000, description: '有实战经验' },
  
  // 高级阶段 (26-40)
  { level: 28, title: '经验投资者', icon: '🎓', requiredXP: 10000, description: '有丰富经验' },
  { level: 30, title: '知识导师', icon: '👨‍🏫', requiredXP: 12000, description: '开始帮助他人' },
  { level: 32, title: '社区贡献者', icon: '🤝', requiredXP: 15000, description: '积极回馈社区' },
  { level: 35, title: '资深导师', icon: '🎖️', requiredXP: 18000, description: '培养多名学徒' },
  { level: 40, title: '投资专家', icon: '⭐', requiredXP: 25000, description: '专业级水平' },
  
  // 大师阶段 (41-50)
  { level: 42, title: '领域专家', icon: '💎', requiredXP: 30000, description: '某领域顶尖' },
  { level: 45, title: '行业大师', icon: '👑', requiredXP: 35000, description: '行业顶尖水平' },
  { level: 48, title: '社区领袖', icon: '🏅', requiredXP: 42000, description: '社区核心人物' },
  { level: 50, title: '传奇导师', icon: '🏆', requiredXP: 50000, description: 'Swiv 传奇人物' },
];

/**
 * 计算经验值
 */
export function calculateXP(profile: {
  daysActive: number;
  cardsLearned: number;
  questionsAsked: number;
  helpfulAnswers: number;
  mentorScore: number;
}): number {
  let xp = 0;
  
  // 学习行为
  xp += profile.daysActive * 50;           // 每天活跃 +50 XP
  xp += profile.cardsLearned * 10;         // 每张卡片 +10 XP
  xp += profile.questionsAsked * 20;       // 每次提问 +20 XP
  
  // 社交贡献（权重更高，鼓励帮助他人）
  xp += profile.helpfulAnswers * 50;       // 每次有用回答 +50 XP
  xp += profile.mentorScore * 100;         // 导师评分 +100 XP
  
  return xp;
}

/**
 * 根据 XP 获取等级配置
 */
export function getLevelFromXP(xp: number): LevelConfig {
  for (let i = LEVEL_CONFIGS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_CONFIGS[i].requiredXP) {
      return LEVEL_CONFIGS[i];
    }
  }
  return LEVEL_CONFIGS[0];
}

/**
 * 计算到下一级的进度
 */
export function getNextLevelProgress(xp: number): number {
  const currentLevel = getLevelFromXP(xp);
  const currentIndex = LEVEL_CONFIGS.findIndex(c => c.level === currentLevel.level);
  
  if (currentIndex >= LEVEL_CONFIGS.length - 1) {
    return 100; // 已经满级
  }
  
  const nextLevel = LEVEL_CONFIGS[currentIndex + 1];
  const currentXP = currentLevel.requiredXP;
  const nextXP = nextLevel.requiredXP;
  
  const progress = ((xp - currentXP) / (nextXP - currentXP)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * 检查是否可以成为导师
 */
export function canBecomeMentor(profile: GrowthProfile, trustScore: number): boolean {
  return (
    profile.level >= 20 &&           // 等级达到 20
    trustScore >= 600 &&             // 信誉分 600+
    profile.helpfulAnswers >= 5      // 至少帮助过 5 个用户
  );
}

