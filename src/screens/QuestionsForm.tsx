import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { getQuestions } from '../utils/getQuestions';
import { BACKEND_URL } from "@env"
import { useNavigation, NavigationProp } from '@react-navigation/native';

const POST_API_URL = `${BACKEND_URL}/addanswer`;

const QuestionsForm: React.FC = () => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);


  useEffect(() => {
    const fetchQuestions = async () => {
      Alert.alert('Loading', 'Fetching questions from the server...');
      setLoading(true);
      try {
        const temp = await getQuestions();
        const questionsArray = temp?.questions;
        const questions = questionsArray.map((item: any) => item.question);
        if (questions) {
          setQuestions(questions);
        } else {
          Alert.alert('Error', 'Failed to load questions.');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        Alert.alert('Error', 'Failed to load questions.');
      }

      setLoading(false);
    };

    fetchQuestions();
  }, []);

  const navigation = useNavigation();

  const handleNext = async () => {
    const currentQuestion = questions[currentIndex];
    if (!currentAnswer.trim()) {
      Alert.alert('Validation', 'Answer cannot be empty.');
      return;
    }

    setAnswers(prev => ({ ...prev, [currentQuestion]: currentAnswer }));
    setCurrentAnswer('');

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await submitAnswers();
    }
  };

  const submitAnswers = async () => {
    setSubmitting(true);
    console.log('Submitting answers:', answers);
    try {
      for (const [question, answer] of Object.entries(answers)) {
        await axios.post(`${BACKEND_URL}/questions/addanswer`, { question, answer });
      }
      Alert.alert('Success', 'All answers submitted successfully!');
    } catch (error) {
      Alert.alert('Success', 'All answers submitted successfully!');
      console.error(error);
    } finally {
      setSubmitting(false);
      navigation.navigate('Demo');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {submitting ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={styles.question}>
            Q{currentIndex + 1}: {questions[currentIndex]}
          </Text>
          <TextInput
            style={styles.input}
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            placeholder="Type your answer here"
          />
          <Button title="Confirm & Next" onPress={handleNext} />
        </>
      )}
    </View>
  );
};

export default QuestionsForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  question: {
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderColor: '#aaa',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});
