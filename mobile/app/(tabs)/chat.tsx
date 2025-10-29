/**
 * Chat Page
 * Chat page - Using real data
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

  // Initialize: Load wallet address
  useEffect(() => {
    loadWalletAddress();
  }, []);

  // Load match list
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
      console.error('Failed to load wallet address:', error);
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (selectedMatch) {
      // Subscribe to real-time messages
      messageSubscription.current = subscribeToMessages(
        selectedMatch.matchId,
        async (newMessage) => {
          // Check if message already exists (avoid duplicates)
          const exists = messages.some(msg => msg.id === newMessage.id);
          if (exists) return;

          // Query sender's wallet address
          const { supabase: supabaseClient } = await import('@/lib/supabase');
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('wallet_address')
            .eq('id', newMessage.sender_id)
            .single();

          // Add new message to list
          setMessages(prev => [...prev, {
            id: newMessage.id,
            sender: profile?.wallet_address === walletAddress ? 'me' : 'other',
            senderId: newMessage.sender_id,
            content: newMessage.content,
            timestamp: new Date(newMessage.created_at),
          }]);
          
          // Scroll to bottom
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
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enter chat room
  const enterChatRoom = async (match: Match) => {
    setSelectedMatch(match);
    setMessages([]);
    
    try {
      // Load chat history
      const history = await getMatchMessages(match.matchId);
      
      // Get all sender wallet addresses
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
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // Back to chat list
  const backToList = () => {
    setSelectedMatch(null);
    setMessages([]);
    setInput('');
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !selectedMatch || sending) return;

    const messageContent = input.trim();
    const tempId = `temp_${Date.now()}`;
    
    // Immediately show message in UI (optimistic update)
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

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const result = await sendMessageAPI(selectedMatch.matchId, walletAddress, messageContent);
      
      // Update temporary message to real message ID
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, id: result.id } : msg
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove failed message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      // Restore input
      setInput(messageContent);
      
      // Show error alert
      Alert.alert('Send Failed', 'Please try again');
    } finally {
      setSending(false);
    }
  };

  // Helper function: Generate avatar URL
  const getAvatarUrl = (walletAddress: string) => {
    return `https://api.dicebear.com/7.x/lorelei/png?seed=${walletAddress}&size=200&backgroundColor=f3f4f6`;
  };

  // Helper function: Generate username
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

  // Helper function: Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // If chat selected, show chat room
  if (selectedMatch) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat room header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={backToList} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerWallet}>{getUserName(selectedMatch.userWallet)}</Text>
            <Text style={styles.headerRisk}>
              {selectedMatch.riskType === 'Conservative' ? '🛡️ Conservative' : 
               selectedMatch.riskType === 'Balanced' ? '⚖️ Balanced' : '🚀 Aggressive'}
            </Text>
          </View>
        </View>

        {/* Message list */}
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
                {msg.timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input box */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
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
        
        {/* Bottom safe area */}
        <View style={styles.safeArea} />
      </KeyboardAvoidingView>
    );
  }

  // Show chat list
  return (
    <View style={styles.container}>
      {/* Top navigation */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        {matches.length > 0 && (
          <View style={styles.matchCount}>
            <Text style={styles.matchCountText}>{matches.length}</Text>
          </View>
        )}
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading...</Text>
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
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySubtext}>Go to Match page to find like-minded friends!</Text>
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
