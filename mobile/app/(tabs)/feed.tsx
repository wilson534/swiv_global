/**
 * Feed Page - TikTok Style
 * 学习流页面（上下滑动全屏卡片）
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, ActivityIndicator, FlatList, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.5.56:3000';

interface FeedItem {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function FeedPage() {
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [trustScore, setTrustScore] = useState(100);
  
  // AI对话相关
  const [showAIChat, setShowAIChat] = useState(false);
  const [currentContext, setCurrentContext] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiLoading, setAILoading] = useState(false);

  const walletAddress = 'demo_wallet_123';

  // 生成新的学习内容（AI 实时生成）
  const generateNewContent = async () => {
    if (generating) return;
    
    try {
      setGenerating(true);
      
      // 获取已有主题标题
      const previousTopics = feedItems.map(item => item.title);
      
      // 调用 AI 生成新主题
      const response = await fetch(`${API_URL}/api/generate-topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          previousTopics,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('AI 生成新主题:', result.data.title);
          setFeedItems(prev => [...prev, result.data]);
        }
      } else {
        // 如果生成失败，降级使用预制内容
        const fallbackResponse = await fetch(
          `${API_URL}/api/feed?walletAddress=${walletAddress}&offset=${feedItems.length}&limit=1`
        );
        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          if (fallbackResult.success && fallbackResult.data.length > 0) {
            setFeedItems(prev => [...prev, ...fallbackResult.data]);
          }
        }
      }
    } catch (error) {
      console.error('生成内容失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  // 初始加载
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/feed?walletAddress=${walletAddress}&offset=0&limit=3`
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setFeedItems(result.data);
          }
        }
      } catch (error) {
        console.error('加载失败:', error);
        Alert.alert('错误', '无法加载内容');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitial();
    // eslint-disable-next-line
  }, []);

  // 滚动到下一张时自动加载
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / height);
    
    if (index !== currentIndex) {
      setCurrentIndex(index);
      
      // 接近最后一张时，自动生成新内容
      if (index >= feedItems.length - 1) {
        generateNewContent();
      }
    }
  };

  // 打开 AI 对话页面
  const handleAskAI = (item: FeedItem) => {
    setCurrentContext(item.title);
    setMessages([{
      id: '0',
      role: 'ai',
      content: `你好！我是 Swiv AI 助手 🤖\n\n当前学习内容：${item.title}\n\n有什么问题想问我吗？`,
      timestamp: new Date(),
    }]);
    setInput('');
    setShowAIChat(true);
  };

  // 发送AI消息
  const sendAIMessage = async () => {
    if (!input.trim() || aiLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAILoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          question: userMessage.content,
          context: `当前学习内容：${currentContext}`,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: result.data.answer,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        throw new Error('API 调用失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setAILoading(false);
    }
  };

  // 完成学习
  const handleComplete = (item: FeedItem) => {
    const newScore = Math.min(trustScore + 2, 100);
    setTrustScore(newScore);
    
    Alert.alert(
      '完成 ✅',
      `太棒了！\n\n信誉分 +2 → ${newScore}`,
      [{ text: '继续', style: 'default' }]
    );
  };

  // 渲染单张卡片
  const renderCard = ({ item, index }: { item: FeedItem; index: number }) => (
    <View style={styles.card}>
      {/* 顶部信息 */}
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{trustScore}</Text>
        </View>
      </View>

      {/* 主要内容区 */}
      <View style={styles.contentArea}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
        
        <View style={styles.meta}>
          <Text style={styles.metaText}>{item.estimatedTime} 分钟</Text>
          <Text style={styles.metaBullet}>•</Text>
          <Text style={styles.metaText}>
            {item.difficulty === 'beginner' ? '入门' : 
             item.difficulty === 'intermediate' ? '进阶' : '高级'}
          </Text>
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.askButton]}
          onPress={() => handleAskAI(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>问 AI</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleComplete(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>完成</Text>
        </TouchableOpacity>
      </View>

      {/* 底部安全区域 */}
      <View style={styles.safeArea} />

      {/* 滑动提示 */}
      {index === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>上下滑动查看更多</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9945FF" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={feedItems}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={height}
        decelerationRate="fast"
        ListFooterComponent={
          generating ? (
            <View style={styles.generatingFooter}>
              <ActivityIndicator size="small" color="#9945FF" />
              <Text style={styles.generatingText}>AI 正在生成新内容...</Text>
            </View>
          ) : null
        }
      />

      {/* 进度指示器 */}
      <View style={styles.progressContainer}>
        {feedItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive
            ]}
          />
        ))}
      </View>

      {/* AI对话Modal */}
      <Modal
        visible={showAIChat}
        animationType="slide"
        onRequestClose={() => setShowAIChat(false)}
      >
        <KeyboardAvoidingView 
          style={styles.aiChatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* 顶部导航 */}
          <View style={styles.aiChatHeader}>
            <TouchableOpacity 
              onPress={() => setShowAIChat(false)}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.aiChatHeaderText}>AI 助手</Text>
              <Text style={styles.aiChatHeaderSubtext}>🤖 Swiv Learning Assistant</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* 消息列表 */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.aiBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userText : styles.aiText
                ]}>
                  {message.content}
                </Text>
                <Text style={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            ))}

            {aiLoading && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color="#9945FF" />
                <Text style={styles.aiLoadingText}>AI 正在思考...</Text>
              </View>
            )}
          </ScrollView>

          {/* 输入框 */}
          <View style={styles.aiInputContainer}>
            <TextInput
              style={styles.aiInput}
              value={input}
              onChangeText={setInput}
              placeholder="输入你的问题..."
              placeholderTextColor="#666"
              multiline
              maxLength={500}
              editable={!aiLoading}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!input.trim() || aiLoading) && styles.sendButtonDisabled
              ]}
              onPress={sendAIMessage}
              disabled={!input.trim() || aiLoading}
            >
              <Text style={styles.sendIcon}>
                {aiLoading ? '⏳' : '🚀'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    marginTop: 16,
    fontSize: 14,
  },
  card: {
    width: width,
    height: height,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  categoryBadge: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreBadge: {
    backgroundColor: '#14F195',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    lineHeight: 40,
  },
  content: {
    fontSize: 18,
    color: '#ccc',
    lineHeight: 28,
    marginBottom: 24,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  metaBullet: {
    fontSize: 13,
    color: '#444',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  safeArea: {
    height: 100,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  askButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  completeButton: {
    backgroundColor: '#2a2a2a',
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  hint: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: '#555',
    fontSize: 12,
  },
  progressContainer: {
    position: 'absolute',
    right: 20,
    top: height / 2 - 50,
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  progressDotActive: {
    backgroundColor: '#9945FF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  generatingFooter: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  generatingText: {
    color: '#9945FF',
    marginTop: 16,
    fontSize: 16,
  },
  // AI对话样式
  aiChatContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  aiChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  aiChatHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  aiChatHeaderSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#9945FF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#222',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  userText: {
    color: '#fff',
    fontWeight: '400',
  },
  aiText: {
    color: '#e0e0e0',
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  aiLoadingText: {
    color: '#9945FF',
    fontSize: 14,
    marginTop: 8,
  },
  aiInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
    alignItems: 'flex-end',
    gap: 12,
  },
  aiInput: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9945FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 24,
  },
});
