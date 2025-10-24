/**
 * App Context
 * 应用全局上下文 - 避免循环依赖
 */

import { createContext, useContext } from 'react';

// 标签类型
export type TabName = 'feed' | 'match' | 'chat' | 'growth';

// 导航上下文接口
interface NavigationContextType {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
}

// 创建导航上下文
export const NavigationContext = createContext<NavigationContextType>({
  activeTab: 'feed',
  setActiveTab: () => {},
});

// 导航Hook
export const useNavigation = () => {
  return useContext(NavigationContext);
};

