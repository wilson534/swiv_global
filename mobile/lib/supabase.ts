/**
 * Supabase 客户端
 * Supabase Client for Mobile
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 数据库类型定义
 */
export interface Profile {
  id: string;
  wallet_address: string;
  persona_nft_mint?: string;
  trust_score: number;
  created_at: string;
  updated_at: string;
}

export interface Persona {
  id: string;
  profile_id: string;
  risk_type: 'Conservative' | 'Balanced' | 'Aggressive';
  keywords: string[];
  description: string;
  ai_summary: string;
  created_at: string;
}

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  matched_at: string;
  on_chain_tx?: string;
  is_active: boolean;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  flagged: boolean;
  created_at: string;
}

/**
 * 获取用户的所有匹配
 */
export async function getUserMatches(walletAddress: string) {
  // 1. 获取用户的 profile ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', walletAddress)
    .single();

  if (!profile) return [];

  // 2. 获取所有匹配
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id,
      user_a,
      user_b,
      matched_at,
      is_active
    `)
    .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`)
    .eq('is_active', true)
    .order('matched_at', { ascending: false });

  if (!matches) return [];

  // 3. 获取对方用户的信息
  const matchesWithInfo = await Promise.all(
    matches.map(async (match) => {
      const otherUserId = match.user_a === profile.id ? match.user_b : match.user_a;

      // 获取对方的 profile 和 persona
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select(`
          id,
          wallet_address,
          trust_score,
          personas (
            risk_type,
            keywords,
            description
          )
        `)
        .eq('id', otherUserId)
        .single();

      // 获取最后一条消息
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('match_id', match.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 获取未读消息数量
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', match.id)
        .neq('sender_id', profile.id);

      return {
        id: match.id,
        matchId: match.id,
        userWallet: otherProfile?.wallet_address || 'Unknown',
        riskType: otherProfile?.personas?.[0]?.risk_type || 'Balanced',
        trustScore: otherProfile?.trust_score || 50,
        lastMessage: lastMessage?.content || '开始对话吧！',
        timestamp: lastMessage?.created_at || match.matched_at,
        unread: unreadCount || 0,
      };
    })
  );

  return matchesWithInfo;
}

/**
 * 获取匹配的聊天历史
 */
export async function getMatchMessages(matchId: string) {
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      sender_id,
      content,
      created_at,
      profiles (
        wallet_address
      )
    `)
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  return messages || [];
}

/**
 * 发送消息
 */
export async function sendMessage(
  matchId: string,
  senderWallet: string,
  content: string
) {
  // 1. 获取发送者的 profile ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', senderWallet)
    .single();

  if (!profile) throw new Error('Profile not found');

  // 2. 插入消息
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: profile.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) throw error;

  return message;
}

/**
 * 订阅新消息
 */
export function subscribeToMessages(
  matchId: string,
  onNewMessage: (message: any) => void
) {
  return supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();
}

/**
 * 记录滑动操作（简化版：喜欢就直接匹配）
 */
export async function recordSwipe(
  fromWallet: string,
  toWallet: string,
  action: 'like' | 'pass'
) {
  // 1. 获取两个用户的 profile ID
  const { data: fromProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', fromWallet)
    .single();

  const { data: toProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', toWallet)
    .single();

  if (!fromProfile || !toProfile) {
    throw new Error('Profile not found');
  }

  // 2. 如果是 like，直接创建匹配（不需要双向确认）
  if (action === 'like') {
    const userA = fromProfile.id < toProfile.id ? fromProfile.id : toProfile.id;
    const userB = fromProfile.id < toProfile.id ? toProfile.id : fromProfile.id;

    console.log('🔄 准备创建匹配:', {
      fromWallet,
      toWallet,
      userA,
      userB,
    });

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        user_a: userA,
        user_b: userB,
        is_active: true,
      })
      .select()
      .single();

    if (matchError) {
      if (matchError.code === '23505') {
        console.log('ℹ️ 匹配已存在（重复）');
        return { matched: true, match: null };
      }
      console.error('❌ 创建匹配失败:', matchError);
      throw matchError;
    }

    console.log('✅ 匹配创建成功:', match);
    return { matched: true, match };
  }

  console.log('ℹ️ Pass 操作，不创建匹配');
  return { matched: false };
}

/**
 * 检查是否已经匹配
 */
export async function checkIfMatched(wallet1: string, wallet2: string) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, wallet_address')
    .in('wallet_address', [wallet1, wallet2]);

  if (!profiles || profiles.length !== 2) return false;

  const id1 = profiles.find(p => p.wallet_address === wallet1)?.id;
  const id2 = profiles.find(p => p.wallet_address === wallet2)?.id;

  if (!id1 || !id2) return false;

  const userA = id1 < id2 ? id1 : id2;
  const userB = id1 < id2 ? id2 : id1;

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('user_a', userA)
    .eq('user_b', userB)
    .eq('is_active', true)
    .single();

  return !!match;
}

/**
 * 获取候选用户列表
 */
export async function getCandidates(currentUserWallet: string, limit: number = 20) {
  try {
    // 获取当前用户的 profile ID
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', currentUserWallet)
      .single();

    if (profileError) {
      console.error('获取当前用户失败:', profileError);
      return [];
    }

    if (!currentProfile) {
      console.log('当前用户不存在，请先创建 profile');
      return [];
    }

    // 获取已经匹配过的用户 ID
    const { data: matches } = await supabase
      .from('matches')
      .select('user_a, user_b')
      .or(`user_a.eq.${currentProfile.id},user_b.eq.${currentProfile.id}`);

    const matchedUserIds = new Set<string>();
    matches?.forEach(match => {
      if (match.user_a !== currentProfile.id) matchedUserIds.add(match.user_a);
      if (match.user_b !== currentProfile.id) matchedUserIds.add(match.user_b);
    });

    // 获取未匹配的候选用户
    const { data: candidates, error: candidatesError } = await supabase
      .from('profiles')
      .select(`
        id,
        wallet_address,
        trust_score,
        personas!inner (
          risk_type,
          keywords,
          description
        )
      `)
      .neq('wallet_address', currentUserWallet)
      .limit(limit);

    if (candidatesError) {
      console.error('获取候选用户失败:', candidatesError);
      console.error('错误详情:', JSON.stringify(candidatesError, null, 2));
      return [];
    }

    if (!candidates || candidates.length === 0) {
      console.log('没有找到候选用户，请先在 Supabase 中创建测试用户');
      console.log('当前钱包地址:', currentUserWallet);
      return [];
    }

    console.log('✅ 成功获取候选用户，数量:', candidates.length);
    console.log('📋 原始候选用户数据（前2个）:', JSON.stringify(candidates.slice(0, 2), null, 2));

    // 过滤掉已匹配的用户并格式化数据
    const formattedCandidates = candidates
      .filter(c => {
        if (!c || !c.id) {
          console.log('⚠️ 过滤掉无效候选:', c);
          return false;
        }
        if (matchedUserIds.has(c.id)) {
          console.log('⚠️ 过滤掉已匹配用户:', c.wallet_address);
          return false;
        }
        return true;
      })
      .map(c => {
        try {
          const formatted = {
            id: c.id,
            walletAddress: c.wallet_address || 'Unknown',
            riskType: (c.personas && Array.isArray(c.personas) && c.personas.length > 0 && c.personas[0]?.risk_type) || 'Balanced',
            keywords: (c.personas && Array.isArray(c.personas) && c.personas.length > 0 && c.personas[0]?.keywords) || [],
            description: (c.personas && Array.isArray(c.personas) && c.personas.length > 0 && c.personas[0]?.description) || '暂无描述',
            trustScore: c.trust_score || 50,
            matchScore: Math.floor(60 + Math.random() * 40),
          };
          console.log('✅ 格式化候选用户:', formatted.walletAddress, formatted.riskType);
          return formatted;
        } catch (err) {
          console.error('❌ 格式化用户失败:', c, err);
          return null;
        }
      })
      .filter(c => c !== null); // 再次过滤掉可能的 null

    console.log(`✅✅✅ 最终加载了 ${formattedCandidates.length} 个有效候选用户`);
    console.log('前3个用户:', formattedCandidates.slice(0, 3).map(c => c.walletAddress));
    return formattedCandidates;

  } catch (error) {
    console.error('getCandidates 错误:', error);
    return [];
  }
}

