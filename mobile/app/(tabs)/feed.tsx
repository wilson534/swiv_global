/**
 * Feed Page - TikTok Style
 * 学习流页面（上下滑动全屏卡片）
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, ActivityIndicator, FlatList, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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

  // 分类标签
  const categories = ['全部', '区块链技术', 'DeFi', 'NFT', 'Web3', 'DAO', '智能合约'];
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allFeedItems, setAllFeedItems] = useState<FeedItem[]>([]);

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
          `${API_URL}/api/feed?walletAddress=${walletAddress}&offset=0&limit=10`
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAllFeedItems(result.data);
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

  // 分类筛选
  useEffect(() => {
    filterContent();
    // eslint-disable-next-line
  }, [selectedCategory, searchQuery]);

  const filterContent = () => {
    let filtered = [...allFeedItems];
    
    // 按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.content.toLowerCase().includes(query)
      );
    }
    
    setFeedItems(filtered);
    setCurrentIndex(0);
  };

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
  const handleComplete = async (item: FeedItem) => {
    try {
      console.log('📚 学习卡片完成:', item.title);
      console.log('👤 钱包地址:', walletAddress);
      
      // 📞 调用 API 记录学习活动到链上
      const response = await fetch(`${API_URL}/api/trust-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletAddress,
          interactionType: 'helpful', // 使用 'helpful' 类型表示学习完成
          qualityScore: 85, // 学习完成度评分
        }),
      });

      const result = await response.json();
      console.log('✅ 学习活动已记录到链上:', result);

      // 更新本地分数
      const newScore = Math.min(trustScore + 2, 100);
      setTrustScore(newScore);
      
      Alert.alert(
        '完成 ✅',
        `太棒了！学习记录已上链\n\n信誉分 +2 → ${newScore}\n\n链上确认: ${result.success ? '成功' : '失败'}`,
        [{ text: '继续', style: 'default' }]
      );
    } catch (error) {
      console.error('❌ 记录学习活动失败:', error);
      
      // 即使上链失败，也更新本地分数
      const newScore = Math.min(trustScore + 2, 100);
      setTrustScore(newScore);
      
      Alert.alert(
        '完成 ✅',
        `太棒了！\n\n信誉分 +2 → ${newScore}\n\n(上链记录将稍后同步)`,
        [{ text: '继续', style: 'default' }]
      );
    }
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
          <Text style={styles.completeButtonText}>完成</Text>
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
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 固定头部 */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerTop}>
          {/* 左侧 Logo 和名称 */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <View style={styles.logoNetwork}>
                <View style={[styles.logoDot, styles.logoDotTopLeft]} />
                <View style={[styles.logoDot, styles.logoDotTopRight]} />
                <View style={[styles.logoDot, styles.logoDotBottom]} />
                <View style={styles.logoLineVertical} />
                <View style={styles.logoLineLeft} />
                <View style={styles.logoLineRight} />
              </View>
            </View>
            <Text style={styles.appName}>Swiv</Text>
          </View>

          {/* 右侧搜索图标 */}
          <TouchableOpacity 
            style={styles.searchButton} 
            activeOpacity={0.7}
            onPress={() => setShowSearch(true)}
          >
            <Ionicons name="search-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* 分类标签 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category && styles.categoryTabTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 搜索状态提示 */}
        {searchQuery.trim() && (
          <View style={styles.searchStatusBar}>
            <Text style={styles.searchStatusText}>
              搜索: "{searchQuery}"
            </Text>
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.searchStatusClose}
            >
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 内容列表 */}
      <FlatList
        ref={flatListRef}
        data={feedItems}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={height - 140}
        decelerationRate="fast"
        contentContainerStyle={feedItems.length === 0 ? styles.emptyListContent : styles.flatListContent}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Ionicons name="file-tray-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyListText}>
              {selectedCategory !== '全部' ? '该分类下暂无内容' : '暂无学习内容'}
            </Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSelectedCategory('全部');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetButtonText}>查看全部</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          generating ? (
            <View style={styles.generatingFooter}>
              <ActivityIndicator size="small" color="#000000" />
              <Text style={styles.generatingText}>AI 正在生成新内容...</Text>
            </View>
          ) : null
        }
      />

      {/* 搜索Modal */}
      <Modal
        visible={showSearch}
        animationType="slide"
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowSearch(false);
              }}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索学习内容..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={() => {
                // 搜索完成后关闭弹窗，在主页面显示结果
                if (searchQuery.trim()) {
                  setShowSearch(false);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView style={styles.searchResultsScroll}>
            {searchQuery.trim() === '' ? (
              <View style={styles.searchEmptyContainer}>
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text style={styles.searchEmptyText}>输入关键词搜索学习内容</Text>
              </View>
            ) : feedItems.length > 0 ? (
              <View style={styles.searchResultsList}>
                <Text style={styles.searchResultCount}>找到 {feedItems.length} 个结果</Text>
                {feedItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.searchResultItem}
                    onPress={() => {
                      setShowSearch(false);
                      // 找到该项在原始数据中的索引
                      const originalIndex = feedItems.findIndex(f => f.id === item.id);
                      setCurrentIndex(originalIndex);
                      setTimeout(() => {
                        flatListRef.current?.scrollToIndex({ 
                          index: originalIndex, 
                          animated: false 
                        });
                      }, 100);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchResultBadge}>
                      <Text style={styles.searchResultCategory}>{item.category}</Text>
                    </View>
                    <Text style={styles.searchResultTitle}>{item.title}</Text>
                    <Text style={styles.searchResultContent} numberOfLines={2}>
                      {item.content}
                    </Text>
                    <View style={styles.searchResultMeta}>
                      <Text style={styles.searchResultMetaText}>{item.estimatedTime} 分钟</Text>
                      <Text style={styles.searchResultMetaBullet}>•</Text>
                      <Text style={styles.searchResultMetaText}>
                        {item.difficulty === 'beginner' ? '入门' : 
                         item.difficulty === 'intermediate' ? '进阶' : '高级'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.searchEmptyContainer}>
                <Ionicons name="sad-outline" size={64} color="#D1D5DB" />
                <Text style={styles.searchEmptyText}>没有找到相关内容</Text>
                <Text style={styles.searchEmptySubtext}>试试其他关键词</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

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
                <ActivityIndicator size="small" color="#000000" />
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
    backgroundColor: '#FFFFFF',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoNetwork: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  logoDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  logoDotTopLeft: {
    top: 0,
    left: 2,
  },
  logoDotTopRight: {
    top: 0,
    right: 2,
  },
  logoDotBottom: {
    bottom: 0,
    left: '50%',
    marginLeft: -2.5,
  },
  logoLineVertical: {
    position: 'absolute',
    width: 1.5,
    height: 14,
    backgroundColor: '#FFFFFF',
    top: 5,
    left: '50%',
    marginLeft: -0.75,
  },
  logoLineLeft: {
    position: 'absolute',
    width: 8,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    top: 6,
    left: 4,
    transform: [{ rotate: '45deg' }],
  },
  logoLineRight: {
    position: 'absolute',
    width: 8,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    top: 6,
    right: 4,
    transform: [{ rotate: '-45deg' }],
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#000000',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 8,
  },
  searchStatusText: {
    fontSize: 14,
    color: '#374151',
  },
  searchStatusClose: {
    padding: 4,
  },
  flatListContent: {
    paddingTop: Platform.OS === 'ios' ? 140 : 110,
  },
  emptyListContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 140 : 110,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyListText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 14,
  },
  card: {
    width: width,
    height: height - 140,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  categoryBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  scoreText: {
    color: '#374151',
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
    color: '#000000',
    marginBottom: 24,
    lineHeight: 40,
  },
  content: {
    fontSize: 18,
    color: '#374151',
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
    color: '#6B7280',
  },
  metaBullet: {
    fontSize: 13,
    color: '#9CA3AF',
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
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#444444',
  },
  completeButton: {
    backgroundColor: '#444444',
    borderWidth: 1,
    borderColor: '#555555',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  completeButtonText: {
    color: '#FFFFFF',
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
    color: '#666666',
    fontSize: 12,
  },
  // 搜索样式
  searchContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#000000',
  },
  clearButton: {
    padding: 8,
  },
  searchResultsScroll: {
    flex: 1,
  },
  searchEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  searchEmptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  searchEmptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 8,
  },
  searchResultsList: {
    padding: 20,
  },
  searchResultCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  searchResultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchResultBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  searchResultCategory: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  searchResultContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  searchResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchResultMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  searchResultMetaBullet: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  generatingFooter: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  generatingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 16,
  },
  // AI对话样式
  aiChatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  aiChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#000000',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  aiChatHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  aiChatHeaderSubtext: {
    fontSize: 12,
    color: '#6B7280',
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
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  aiText: {
    color: '#374151',
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  aiLoadingText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  aiInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
    gap: 12,
  },
  aiInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#000000',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 24,
  },
});
