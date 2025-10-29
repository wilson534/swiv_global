/**
 * Persona Quiz Page
 * AI Assessment Page - Create Investment Persona
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const QUESTIONS = [
  {
    id: 1,
    question: 'What is your investment goal?',
    options: [
      { value: 'preserve', label: 'Preserve Capital' },
      { value: 'grow', label: 'Steady Growth' },
      { value: 'maximize', label: 'Maximize Returns' },
    ],
  },
  {
    id: 2,
    question: 'How much loss can you tolerate?',
    options: [
      { value: 'low', label: 'Small Loss (<10%)' },
      { value: 'medium', label: 'Medium Loss (10-30%)' },
      { value: 'high', label: 'Large Loss (>30%)' },
    ],
  },
  {
    id: 3,
    question: 'Your knowledge level of cryptocurrency?',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
  },
  {
    id: 4,
    question: 'Which area interests you the most?',
    options: [
      { value: 'defi', label: 'DeFi' },
      { value: 'nft', label: 'NFT' },
      { value: 'trading', label: 'Trading' },
      { value: 'staking', label: 'Staking' },
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
      alert('Failed to create persona');
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
          <Text style={styles.generatingText}>Generating Your Investment Persona</Text>
          <Text style={styles.generatingSubtext}>Please wait...</Text>
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
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>Question {currentStep + 1}</Text>
          <Text style={styles.question}>{currentQuestion.question}</Text>
        </View>

        {/* Options */}
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

      {/* Bottom buttons */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleBack}
          >
            <Text style={styles.buttonText}>← Previous</Text>
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
            {currentStep === QUESTIONS.length - 1 ? 'Generate Persona →' : 'Next →'}
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

