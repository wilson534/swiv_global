/**
 * Growth Page
 * Growth page - Display trust score, badges, achievements
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { OnChainStats } from '../../components/OnChainStats';

export default function GrowthPage() {
  const [walletAddress, setWalletAddress] = useState<string>('7xKXtg2CW87d97HnrbyShgg2pzgz6qXZDmJJdoMN6eE');

  useEffect(() => {
    loadWalletAddress();
  }, []);

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

  const handleResetPersona = async () => {
    Alert.alert(
      'Reset Assessment',
      'Are you sure you want to reset AI assessment? This will clear your persona data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('persona_completed');
              Alert.alert('Success', 'Please restart app to begin assessment again');
            } catch (error) {
              Alert.alert('Error', 'Reset failed');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top navigation */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Growth</Text>
        <TouchableOpacity onPress={handleResetPersona}>
          <Text style={styles.headerIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* On-chain data */}
        <OnChainStats walletAddress={walletAddress} />
      </ScrollView>
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
  headerIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingTop: 12,
  },
});

