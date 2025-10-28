/**
 * Supabase 工具库
 * 处理数据库操作
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 客户端（用于公开操作）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 管理端（用于服务端操作，绕过 RLS）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 数据库表类型定义
 */
export interface Profile {
  id: string;
  wallet_address: string;
  persona_nft_mint?: string;
  trust_score: number;
  created_at: string;
  updated_at?: string;
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
 * 获取或创建用户 Profile
 */
export async function getOrCreateProfile(walletAddress: string): Promise<Profile> {
  // 查询是否存在
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (existing) {
    return existing;
  }

  // 创建新 Profile
  const { data: newProfile, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      wallet_address: walletAddress,
      trust_score: 50, // 初始信誉分
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  return newProfile;
}

/**
 * 保存 Persona
 */
export async function savePersona(
  profileId: string,
  personaData: Omit<Persona, 'id' | 'profile_id' | 'created_at'>
): Promise<Persona> {
  const { data, error } = await supabaseAdmin
    .from('personas')
    .insert({
      profile_id: profileId,
      ...personaData,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save persona: ${error.message}`);
  }

  return data;
}

/**
 * 获取用户的 Persona
 */
export async function getPersona(profileId: string): Promise<Persona | null> {
  const { data } = await supabase
    .from('personas')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  return data;
}

/**
 * 更新 TrustScore
 */
export async function updateTrustScore(
  profileId: string,
  delta: number
): Promise<number> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('trust_score')
    .eq('id', profileId)
    .single();

  if (!profile) {
    throw new Error('Profile not found');
  }

  const newScore = Math.max(0, Math.min(100, profile.trust_score + delta));

  await supabaseAdmin
    .from('profiles')
    .update({ trust_score: newScore })
    .eq('id', profileId);

  return newScore;
}

/**
 * 记录匹配
 */
export async function createMatch(
  userA: string,
  userB: string,
  onChainTx?: string
): Promise<Match> {
  const { data, error } = await supabaseAdmin
    .from('matches')
    .insert({
      user_a: userA,
      user_b: userB,
      on_chain_tx: onChainTx,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create match: ${error.message}`);
  }

  return data;
}

/**
 * 获取用户的匹配列表
 */
export async function getMatches(profileId: string): Promise<Match[]> {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a.eq.${profileId},user_b.eq.${profileId}`)
    .order('matched_at', { ascending: false });

  return data || [];
}

/**
 * 保存消息
 */
export async function saveMessage(
  matchId: string,
  senderId: string,
  content: string,
  flagged: boolean = false
): Promise<Message> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: senderId,
      content,
      flagged,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }

  return data;
}

/**
 * 获取对话历史
 */
export async function getMessages(matchId: string, limit: number = 50): Promise<Message[]> {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
    .limit(limit);

  return data || [];
}




