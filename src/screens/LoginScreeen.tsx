import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ReactNativeBiometrics from 'react-native-biometrics';
import { loginUser } from '../utils/loginuser.js';
import { StackNavigationProp } from '@react-navigation/stack';

const rnBiometrics = new ReactNativeBiometrics();

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

type RootStackParamList = {
  Login: undefined;
  HomeScreen: undefined;
  RegisterScreen: undefined;
  ForgotPasswordScreen: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: { navigation: LoginScreenNavigationProp }) {
  interface LoginValues {
    username: string;
    password: string;
  }

  interface LoginResponse {
    success: boolean;
    message?: string;
  }

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const handleBiometricAuth = async () => {
    const { available } = await rnBiometrics.isSensorAvailable();

    if (!available) {
      Alert.alert('Biometrics Not Available', 'Your device does not support biometric authentication.');
      navigation.navigate('HomeScreen');
      return;
    }

    rnBiometrics.simplePrompt({ promptMessage: 'Confirm biometric authentication' })
      .then(resultObject => {
        const { success } = resultObject;

        if (success) {
          Alert.alert('Success', 'Authenticated using biometrics');
          navigation.navigate('HomeScreen');
        } else {
          Alert.alert('Cancelled', 'User cancelled biometric prompt');
        }
      })
      .catch(() => {
        Alert.alert('Failed', 'Biometric authentication failed');
      });
  };

  const handleLogin = async (): Promise<void> => {
    try {
      const values: LoginValues = { username, password };

      try {
        await LoginSchema.validate(values, { abortEarly: false });
        setErrors({});
      } catch (validationError: any) {
        const formErrors: { username?: string; password?: string } = {};
        validationError.inner.forEach((err: any) => {
          if (err.path) {
            formErrors[err.path as keyof typeof formErrors] = err.message;
          }
        });
        setErrors(formErrors);
        return;
      }

      const response: LoginResponse = await loginUser(username, password);

      if (response.success) {
        Alert.alert('Success', 'Logged in successfully!');
        await handleBiometricAuth();
      } else {
        Alert.alert('Error', response.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      {errors.username && <Text style={styles.error}>{errors.username}</Text>}

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <Button title="Login" onPress={handleLogin} />

      <TouchableOpacity onPress={() => navigation?.navigate('ForgotPasswordScreen')} style={{ marginTop: 12 }
      }>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation?.navigate('RegisterScreen')}>
        <Text style={styles.link}>New to the app? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
  },
  link: {
    marginTop: 12,
    textAlign: 'center',
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
