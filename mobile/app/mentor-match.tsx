/**
 * Mentor Match Page
 * 师徒匹配页面
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MentorMatchPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'learner' | 'mentor' | null>(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>师徒匹配</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 功能介绍 */}
      <View style={styles.introSection}>
        <Text style={styles.introTitle}>🎓 什么是师徒匹配？</Text>
        <Text style={styles.introText}>
          在 Swiv，我们相信<Text style={styles.bold}>知识分享</Text>比财富炫耀更有价值。
        </Text>
        <Text style={styles.introText}>
          <Text style={styles.bold}>学徒</Text>可以向经验丰富的投资者学习
        </Text>
        <Text style={styles.introText}>
          <Text style={styles.bold}>导师</Text>通过帮助他人提升自己的社区声望
        </Text>
      </View>

      {/* 选择角色 */}
      <View style={styles.roleSection}>
        <Text style={styles.sectionTitle}>选择你的角色</Text>
        
        <TouchableOpacity
          style={[
            styles.roleCard,
            userRole === 'learner' && styles.roleCardSelected
          ]}
          onPress={() => setUserRole('learner')}
        >
          <Text style={styles.roleIcon}>🌱</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>我想学习</Text>
            <Text style={styles.roleDesc}>
              寻找经验丰富的导师，获得 1v1 指导
            </Text>
            <View style={styles.roleBenefits}>
              <Text style={styles.benefitItem}>✓ 免费获得专业指导</Text>
              <Text style={styles.benefitItem}>✓ 加速学习进度</Text>
              <Text style={styles.benefitItem}>✓ 建立人脉关系</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleCard,
            userRole === 'mentor' && styles.roleCardSelected
          ]}
          onPress={() => setUserRole('mentor')}
        >
          <Text style={styles.roleIcon}>👨‍🏫</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>我想教学</Text>
            <Text style={styles.roleDesc}>
              分享你的经验，帮助新手成长
            </Text>
            <View style={styles.roleBenefits}>
              <Text style={styles.benefitItem}>✓ 获得导师徽章和声望</Text>
              <Text style={styles.benefitItem}>✓ 优先匹配优质用户</Text>
              <Text style={styles.benefitItem}>✓ 解锁专属功能</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 导师要求 */}
      {userRole === 'mentor' && (
        <View style={styles.requirementSection}>
          <Text style={styles.sectionTitle}>成为导师的条件</Text>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#00D084" />
            <Text style={styles.requirementText}>等级达到 Lv.20 以上</Text>
          </View>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#00D084" />
            <Text style={styles.requirementText}>信誉分 600+</Text>
          </View>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#00D084" />
            <Text style={styles.requirementText}>至少帮助过 5 个用户</Text>
          </View>
          
          <Text style={styles.note}>
            💡 导师身份完全基于<Text style={styles.bold}>学习贡献</Text>，与资产无关
          </Text>
        </View>
      )}

      {/* 奖励机制 */}
      <View style={styles.rewardSection}>
        <Text style={styles.sectionTitle}>🎁 奖励机制</Text>
        
        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>导师奖励</Text>
          <Text style={styles.rewardItem}>• 每指导一位学徒 +100 XP</Text>
          <Text style={styles.rewardItem}>• 学徒升级后，导师获得 20% XP 加成</Text>
          <Text style={styles.rewardItem}>• 获得专属"导师"徽章</Text>
          <Text style={styles.rewardItem}>• 优先出现在匹配池</Text>
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>学徒福利</Text>
          <Text style={styles.rewardItem}>• 免费获得专业指导</Text>
          <Text style={styles.rewardItem}>• 学习进度加速 2x</Text>
          <Text style={styles.rewardItem}>• 优先匹配高等级导师</Text>
          <Text style={styles.rewardItem}>• 毕业后可以成为导师</Text>
        </View>
      </View>

      {/* 开始匹配按钮 */}
      {userRole && (
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>
            {userRole === 'learner' ? '寻找导师' : '开始教学'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  introSection: {
    padding: 20,
    backgroundColor: '#14F19520',
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#14F195',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#14F195',
  },
  roleSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  roleCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  roleCardSelected: {
    borderColor: '#14F195',
    backgroundColor: '#14F19510',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleInfo: {
    gap: 8,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  roleDesc: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  roleBenefits: {
    marginTop: 12,
    gap: 6,
  },
  benefitItem: {
    fontSize: 13,
    color: '#14F195',
    lineHeight: 18,
  },
  requirementSection: {
    padding: 16,
    backgroundColor: '#111',
    margin: 16,
    borderRadius: 16,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#ccc',
  },
  note: {
    marginTop: 16,
    fontSize: 13,
    color: '#999',
    lineHeight: 20,
  },
  rewardSection: {
    padding: 16,
  },
  rewardCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  rewardItem: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#14F195',
    margin: 16,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

