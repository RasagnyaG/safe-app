import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
const QuestionsForm: React.FC = () => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Replace with your actual API URLs
  const GET_API_URL = `${process.env.BACKEND_URL}/questions`;
  const POST_API_URL = `${process.env.BACKEND_URL}/addanswer`;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(GET_API_URL);
        // Assuming API returns an array of strings
        setQuestions(response.data.slice(0, 10)); // Get first 10 questions
      } catch (error) {
        Alert.alert('Error', 'Failed to load questions.');
        console.error(error);
      } finally {
        setLoading(false);
    };

    fetchQuestions();
  },[]);

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
    try {
      for (const [question, answer] of Object.entries(answers)) {
        await axios.post(POST_API_URL, { question, answer });
      }
      Alert.alert('Success', 'All answers submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit answers.');
      console.error(error);
    } finally {
      setSubmitting(false);
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
