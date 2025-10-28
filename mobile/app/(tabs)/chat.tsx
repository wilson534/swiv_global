/**
 * Chat Page
 * 聊天页面 - 使用真实数据
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserMatches, getMatchMessages, sendMessage as sendMessageAPI, subscribeToMessages } from '@/lib/supabase';

interface Match {
  id: string;
  matchId: string;
  userWallet: string;
  riskType: 'Conservative' | 'Balanced' | 'Aggressive';
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  senderId: string;
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [walletAddress, setWalletAddress] = useState<string>('demo_wallet_123');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const messageSubscription = useRef<any>(null);

  // 初始化：加载钱包地址
  useEffect(() => {
    loadWalletAddress();
  }, []);

  // 加载匹配列表
  useEffect(() => {
    if (walletAddress) {
      loadMatches();
    }
  }, [walletAddress]);

  const loadWalletAddress = async () => {
    try {
      const address = await AsyncStorage.getItem('walletAddress');
      if (address) {
        setWalletAddress(address);
      }
    } catch (error) {
      console.error('加载钱包地址失败:', error);
    }
  };

  // 订阅新消息
  useEffect(() => {
    if (selectedMatch) {
      // 订阅实时消息
      messageSubscription.current = subscribeToMessages(
        selectedMatch.matchId,
        async (newMessage) => {
          // 检查这条消息是否已经存在（避免重复）
          const exists = messages.some(msg => msg.id === newMessage.id);
          if (exists) return;

          // 查询发送者的钱包地址
          const { supabase: supabaseClient } = await import('@/lib/supabase');
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('wallet_address')
            .eq('id', newMessage.sender_id)
            .single();

          // 添加新消息到列表
          setMessages(prev => [...prev, {
            id: newMessage.id,
            sender: profile?.wallet_address === walletAddress ? 'me' : 'other',
            senderId: newMessage.sender_id,
            content: newMessage.content,
            timestamp: new Date(newMessage.created_at),
          }]);
          
          // 滚动到底部
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      );

      return () => {
        if (messageSubscription.current) {
          messageSubscription.current.unsubscribe();
        }
      };
    }
  }, [selectedMatch, walletAddress]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await getUserMatches(walletAddress);
      setMatches(data);
    } catch (error) {
      console.error('加载匹配失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 进入聊天室
  const enterChatRoom = async (match: Match) => {
    setSelectedMatch(match);
    setMessages([]);
    
    try {
      // 加载聊天历史
      const history = await getMatchMessages(match.matchId);
      
      // 获取所有发送者的钱包地址
      const { supabase } = await import('@/lib/supabase');
      const senderIds = [...new Set(history.map((msg: any) => msg.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, wallet_address')
        .in('id', senderIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.wallet_address]) || []);
      
      const formattedMessages: Message[] = history.map((msg: any) => ({
        id: msg.id,
        sender: profileMap.get(msg.sender_id) === walletAddress ? 'me' : 'other',
        senderId: msg.sender_id,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));
      
      setMessages(formattedMessages);
      
      // 滚动到底部
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };

  // 返回聊天列表
  const backToList = () => {
    setSelectedMatch(null);
    setMessages([]);
    setInput('');
  };

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || !selectedMatch || sending) return;

    const messageContent = input.trim();
    const tempId = `temp_${Date.now()}`;
    
    // 立即在 UI 上显示消息（乐观更新）
    const optimisticMessage: Message = {
      id: tempId,
      sender: 'me',
      senderId: walletAddress,
      content: messageContent,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setInput('');
    setSending(true);

    // 滚动到底部
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const result = await sendMessageAPI(selectedMatch.matchId, walletAddress, messageContent);
      
      // 更新临时消息为真实消息 ID
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, id: result.id } : msg
      ));
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 移除失败的消息
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      // 恢复输入
      setInput(messageContent);
      
      // 显示错误提示
      Alert.alert('发送失败', '请重试');
    } finally {
      setSending(false);
    }
  };

  // 🆕 辅助函数：生成头像 URL
  const getAvatarUrl = (walletAddress: string) => {
    return `https://api.dicebear.com/7.x/lorelei/png?seed=${walletAddress}&size=200&backgroundColor=f3f4f6`;
  };

  // 🆕 辅助函数：生成用户名
  const getUserName = (walletAddress: string) => {
    const names = [
      'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
      'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
      'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Luna', 'Jack', 'Grace',
      'Daniel', 'Chloe', 'Matthew', 'Zoe', 'Jackson', 'Lily', 'Sebastian',
      'Elena', 'Ryan', 'Aria', 'Nathan', 'Maya', 'David', 'Nora', 'Andrew'
    ];
    
    let hash = 0;
    for (let i = 0; i < walletAddress.length; i++) {
      hash = ((hash << 5) - hash) + walletAddress.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % names.length;
    return names[index];
  };

  // 🆕 辅助函数：格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 如果选中了聊天，显示聊天室
  if (selectedMatch) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 聊天室头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={backToList} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerWallet}>{getUserName(selectedMatch.userWallet)}</Text>
            <Text style={styles.headerRisk}>
              {selectedMatch.riskType === 'Conservative' ? '🛡️ 保守型' : 
               selectedMatch.riskType === 'Balanced' ? '⚖️ 平衡型' : '🚀 激进型'}
            </Text>
          </View>
        </View>

        {/* 消息列表 */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesList} 
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'me' ? styles.myBubble : styles.otherBubble
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.sender === 'me' ? styles.myText : styles.otherText
              ]}>
                {msg.content}
              </Text>
              <Text style={[
                styles.messageTime,
                msg.sender === 'me' ? styles.myTime : styles.otherTime
              ]}>
                {msg.timestamp.toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* 输入框 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="输入消息..."
            placeholderTextColor="#666"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendIcon}>🚀</Text>
          </TouchableOpacity>
        </View>
        
        {/* 底部安全区域 */}
        <View style={styles.safeArea} />
      </KeyboardAvoidingView>
    );
  }

  // 显示聊天列表
  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>聊天</Text>
        {matches.length > 0 && (
          <View style={styles.matchCount}>
            <Text style={styles.matchCountText}>{matches.length}</Text>
          </View>
        )}
      </View>

      {/* 加载状态 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.matchItem}
              onPress={() => enterChatRoom(item)}
              activeOpacity={0.7}
            >
              <Image 
                source={{ uri: getAvatarUrl(item.userWallet) }}
                style={styles.avatar}
              />

              <View style={styles.matchInfo}>
                <Text style={styles.matchWallet}>{getUserName(item.userWallet)}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              </View>

              <View style={styles.matchMeta}>
                <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyText}>暂无聊天</Text>
          <Text style={styles.emptySubtext}>去匹配页面找到志同道合的朋友吧！</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  matchCount: {
    backgroundColor: '#000000',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  matchCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#000000',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerWallet: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  headerRisk: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  matchItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  matchInfo: {
    flex: 1,
  },
  matchWallet: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  matchMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#000000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // 聊天室样式
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#000000',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
  },
  safeArea: {
    height: 20,
  },
});
