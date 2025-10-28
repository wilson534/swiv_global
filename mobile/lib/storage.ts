/**
 * 本地存储工具
 * 使用 AsyncStorage 保存用户数据
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  WALLET_ADDRESS: '@swiv:walletAddress',
  USER_PROFILE: '@swiv:userProfile',
  LAST_FEED_OFFSET: '@swiv:lastFeedOffset',
};

/**
 * 保存钱包地址
 */
export async function saveWalletAddress(address: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.WALLET_ADDRESS, address);
}

/**
 * 获取钱包地址
 */
export async function getWalletAddress(): Promise<string | null> {
  return await AsyncStorage.getItem(KEYS.WALLET_ADDRESS);
}

/**
 * 清除钱包地址
 */
export async function clearWalletAddress(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.WALLET_ADDRESS);
}

/**
 * 保存用户资料
 */
export async function saveUserProfile(profile: any): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

/**
 * 获取用户资料
 */
export async function getUserProfile(): Promise<any | null> {
  const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

/**
 * 保存 Feed 偏移量
 */
export async function saveFeedOffset(offset: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.LAST_FEED_OFFSET, offset.toString());
}

/**
 * 获取 Feed 偏移量
 */
export async function getFeedOffset(): Promise<number> {
  const data = await AsyncStorage.getItem(KEYS.LAST_FEED_OFFSET);
  return data ? parseInt(data, 10) : 0;
}

/**
 * 清除所有数据
 */
export async function clearAll(): Promise<void> {
  await AsyncStorage.clear();
}




