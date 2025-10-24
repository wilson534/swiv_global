/**
 * Chat Page
 * 聊天页面
 */

import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

interface Match {
  id: string;
  userWallet: string;
  riskType: 'Conservative' | 'Balanced' | 'Aggressive';
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  // TODO: 从 API 获取匹配列表
  const matches: Match[] = [
    {
      id: '1',
      userWallet: '7xKXtg2CW87d...',
      riskType: 'Balanced',
      lastMessage: '你好！很高兴认识你',
      timestamp: '2小时前',
      unread: 2,
    },
    {
      id: '2',
      userWallet: '9pQRst3DX92f...',
      riskType: 'Aggressive',
      lastMessage: '最近有什么好的投资机会吗？',
      timestamp: '5小时前',
      unread: 0,
    },
    {
      id: '3',
      userWallet: '4mNOuv5EY83g...',
      riskType: 'Conservative',
      lastMessage: '我也在研究DeFi',
      timestamp: '昨天',
      unread: 1,
    },
    {
      id: '4',
      userWallet: '2aBC7fg9JKL3...',
      riskType: 'Balanced',
      lastMessage: 'Solana生态真不错',
      timestamp: '昨天',
      unread: 0,
    },
    {
      id: '5',
      userWallet: '6xDEF8hi4MNO...',
      riskType: 'Aggressive',
      lastMessage: '有兴趣一起参与项目吗？',
      timestamp: '2天前',
      unread: 3,
    },
  ];

  // 进入聊天室
  const enterChatRoom = (match: Match) => {
    setSelectedMatch(match);
    // TODO: 从API加载聊天历史
    setMessages([
      {
        id: '1',
        sender: 'other',
        content: '你好！很高兴认识你',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '2',
        sender: 'other',
        content: '我看到你也对 DeFi 感兴趣？',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000),
      },
    ]);
  };

  // 返回聊天列表
  const backToList = () => {
    setSelectedMatch(null);
    setMessages([]);
    setInput('');
  };

  // 发送消息
  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    // TODO: 发送到API
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
            <Text style={styles.headerWallet}>{selectedMatch.userWallet}</Text>
            <Text style={styles.headerRisk}>
              {selectedMatch.riskType === 'Conservative' ? '🛡️ 保守型' : 
               selectedMatch.riskType === 'Balanced' ? '⚖️ 平衡型' : '🚀 激进型'}
            </Text>
          </View>
        </View>

        {/* 消息列表 */}
        <ScrollView style={styles.messagesList} contentContainerStyle={styles.messagesContent}>
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
              <Text style={styles.messageTime}>
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
      </View>

      {/* 匹配列表 */}
      {matches.length > 0 ? (
        <FlatList
          data={matches}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.matchItem}
              onPress={() => enterChatRoom(item)}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.riskType === 'Conservative' ? '🛡️' : 
                   item.riskType === 'Balanced' ? '⚖️' : '🚀'}
                </Text>
              </View>

              <View style={styles.matchInfo}>
                <Text style={styles.matchWallet}>{item.userWallet}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              </View>

              <View style={styles.matchMeta}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
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
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    color: '#fff',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerWallet: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerRisk: {
    fontSize: 12,
    color: '#9945FF',
    marginTop: 2,
  },
  matchItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
  },
  matchInfo: {
    flex: 1,
  },
  matchWallet: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  matchMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#9945FF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
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
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#9945FF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#222',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myText: {
    color: '#fff',
  },
  otherText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#222',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9945FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
  },
  safeArea: {
    height: 20,
  },
});
