/**
 * Persona Quiz Page
 * AI 测评页面 - 创建投资人格
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const QUESTIONS = [
  {
    id: 1,
    question: '你的投资目标是什么？',
    options: [
      { value: 'preserve', label: '保值' },
      { value: 'grow', label: '稳健增长' },
      { value: 'maximize', label: '最大化收益' },
    ],
  },
  {
    id: 2,
    question: '你能承受多大的损失？',
    options: [
      { value: 'low', label: '小额损失 (<10%)' },
      { value: 'medium', label: '中等损失 (10-30%)' },
      { value: 'high', label: '大幅损失 (>30%)' },
    ],
  },
  {
    id: 3,
    question: '你对加密货币的了解程度？',
    options: [
      { value: 'beginner', label: '新手' },
      { value: 'intermediate', label: '中级' },
      { value: 'advanced', label: '高级' },
    ],
  },
  {
    id: 4,
    question: '你最感兴趣的领域是？',
    options: [
      { value: 'defi', label: 'DeFi' },
      { value: 'nft', label: 'NFT' },
      { value: 'trading', label: '交易' },
      { value: 'staking', label: '质押' },
    ],
  },
];

interface PersonaQuizPageProps {
  onComplete?: () => void;
}

export default function PersonaQuizPage({ onComplete }: PersonaQuizPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState(false);

  const handleSelectOption = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: value }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setGenerating(true);

    try {
      // TODO: 调用 API 生成 PersonaNFT
      // TODO: 铸造链上 NFT
      // TODO: 保存到数据库
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 调用完成回调
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Persona creation failed:', error);
      alert('人格创建失败 / Failed to create persona');
    } finally {
      setGenerating(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const isAnswered = answers[currentStep] !== undefined;
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  if (generating) {
    return (
      <View style={styles.container}>
        <View style={styles.generatingContainer}>
          <Text style={styles.generatingText}>正在生成你的投资人格</Text>
          <Text style={styles.generatingSubtext}>请稍候...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 顶部进度 */}
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.stepText}>
          {currentStep + 1} / {QUESTIONS.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 问题 */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>问题 {currentStep + 1}</Text>
          <Text style={styles.question}>{currentQuestion.question}</Text>
        </View>

        {/* 选项 */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                answers[currentStep] === option.value && styles.optionSelected
              ]}
              onPress={() => handleSelectOption(option.value)}
            >
              <View style={styles.optionRadio}>
                {answers[currentStep] === option.value && (
                  <View style={styles.optionRadioInner} />
                )}
              </View>
              <Text style={[
                styles.optionText,
                answers[currentStep] === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleBack}
          >
            <Text style={styles.buttonText}>← 上一步</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonPrimary,
            !isAnswered && styles.buttonDisabled,
            currentStep === 0 && styles.buttonFullWidth
          ]}
          onPress={handleNext}
          disabled={!isAnswered}
        >
          <Text style={styles.buttonText}>
            {currentStep === QUESTIONS.length - 1 ? '生成人格 →' : '下一步 →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#222',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#444',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 12,
  },
  question: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 36,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#222',
  },
  optionSelected: {
    borderColor: '#555',
    backgroundColor: '#1a1a1a',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonFullWidth: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#333',
  },
  buttonSecondary: {
    backgroundColor: '#222',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 12,
  },
  generatingSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

