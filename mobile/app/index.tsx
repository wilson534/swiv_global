/**
 * Entry Point with Navigation
 * 应用入口 + 简单导航
 */

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeedPage from './(tabs)/feed';
import MatchPage from './(tabs)/match';
import ChatPage from './(tabs)/chat';
import GrowthPage from './(tabs)/growth';
import PersonaQuizPage from './persona/index';
import { NavigationContext, TabName } from '../lib/context';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabName>('feed');
  const [hasPersona, setHasPersona] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查用户是否已完成AI测评
  useEffect(() => {
    checkPersonaStatus();
  }, []);

  const checkPersonaStatus = async () => {
    try {
      const personaCompleted = await AsyncStorage.getItem('persona_completed');
      // 默认为false，只有明确标记为true才算完成
      setHasPersona(personaCompleted === 'true');
      console.log('Persona completed status:', personaCompleted);
    } catch (error) {
      console.error('Failed to check persona status:', error);
      setHasPersona(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 完成测评后的回调
  const handlePersonaComplete = async () => {
    try {
      await AsyncStorage.setItem('persona_completed', 'true');
      setHasPersona(true);
    } catch (error) {
      console.error('Failed to save persona status:', error);
    }
  };

  // 开发用：重置persona状态
  const handleResetPersona = async () => {
    try {
      await AsyncStorage.removeItem('persona_completed');
      setHasPersona(false);
      console.log('Persona status reset');
    } catch (error) {
      console.error('Failed to reset persona:', error);
    }
  };

  // 加载中
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
        <Text style={styles.loadingText}>Swiv 加载中...</Text>
        {/* 开发用重置按钮 */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={async () => {
            await AsyncStorage.removeItem('persona_completed');
            setIsLoading(true);
            setTimeout(() => {
              checkPersonaStatus();
            }, 100);
          }}
        >
          <Text style={styles.resetButtonText}>🔄 重置测评</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 如果没有完成测评，显示AI测评页面
  if (!hasPersona) {
    // @ts-ignore
    return <PersonaQuizPage onComplete={handlePersonaComplete} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedPage />;
      case 'match':
        return <MatchPage />;
      case 'chat':
        return <ChatPage />;
      case 'growth':
        return <GrowthPage />;
      default:
        return <FeedPage />;
    }
  };

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      <View style={styles.container}>
        {/* 主内容区 */}
        <View style={styles.content}>
          {renderPage()}
        </View>

      {/* 底部导航栏 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabIcon, activeTab === 'feed' && styles.activeIcon]}>📚</Text>
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeText]}>学习</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'match' && styles.activeTab]}
          onPress={() => setActiveTab('match')}
        >
          <Text style={[styles.tabIcon, activeTab === 'match' && styles.activeIcon]}>💞</Text>
          <Text style={[styles.tabText, activeTab === 'match' && styles.activeText]}>匹配</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabIcon, activeTab === 'chat' && styles.activeIcon]}>💬</Text>
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeText]}>聊天</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'growth' && styles.activeTab]}
          onPress={() => setActiveTab('growth')}
        >
          <Text style={[styles.tabIcon, activeTab === 'growth' && styles.activeIcon]}>🏆</Text>
          <Text style={[styles.tabText, activeTab === 'growth' && styles.activeText]}>成长</Text>
        </TouchableOpacity>
      </View>
      </View>
    </NavigationContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  resetButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // backgroundColor: '#111',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeIcon: {
    // transform: [{ scale: 1.1 }],
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activeText: {
    color: '#9945FF',
  },
});
