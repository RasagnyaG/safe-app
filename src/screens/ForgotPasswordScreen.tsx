import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { encryptRequestBody } from '../utils/encryption';

type Question = {
  id: string;
  text: string;
};

export default function ForgotPasswordScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [step, setStep] = useState<'input' | 'questions'>('input');

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${process.env.BACKEND_URL}/questions`);
      const data: Question[] = await res.json();

      // Randomly pick 3 questions
      const shuffled = data.sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 3));
      setStep('questions');
    } catch (err) {
      Alert.alert('Error', 'Could not fetch questions');
    }
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers({ ...answers, [id]: value });
  };

  const sendAnswer = async (questionId: string, answer: string): Promise<boolean> => {
    try {
      const res = await fetch(`${process.env.BACKEND_URL}/verifyanswer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answer,
          username,
          phoneno : phoneNumber,
        }),
      });

      const result = await res.json();
      return result.success;
    } catch {
      return false;
    }
  };

  const handleVerify = async () => {
    let allCorrect = true;

    for (const q of questions) {
      const answer = answers[q.id];
      const success = await sendAnswer(q.id, answer);

      if (!success) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      Alert.alert('Success', 'Answers verified!');
      navigation.navigate('HomeScreen');
    } else {
      Alert.alert('Verification Failed', 'Sending OTP to your alternate contact...');
      // Simulate sending OTP (replace with real API call)
      await fetch(`${process.env.BACKEND_URL}/altsendotp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptRequestBody({ username, phoneno : phoneNumber })),
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {step === 'input' ? (
        <>
          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <Button title="Next" onPress={fetchQuestions} />
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Answer these questions:</Text>
          {questions.map((q) => (
            <View key={q.id} style={styles.qBlock}>
              <Text>{q.text}</Text>
              <TextInput
                placeholder="Your answer"
                style={styles.input}
                value={answers[q.id] || ''}
                onChangeText={(text) => handleAnswerChange(q.id, text)}
              />
            </View>
          ))}
          <Button title="Verify Answers" onPress={handleVerify} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginVertical: 10,
  },
  qBlock: {
    marginBottom: 20,
  },
});
