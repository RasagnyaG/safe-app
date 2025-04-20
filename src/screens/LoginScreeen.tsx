import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '../utils/loginuser.js';
import { StackNavigationProp } from '@react-navigation/stack';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});


// Define RootStackParamList if not already defined elsewhere
type RootStackParamList = {
  Login: undefined;
  HomeScreen: undefined;
  RegisterScreen: undefined;
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

const handleLogin = async (values: LoginValues): Promise<void> => {
    try {
        const { username, password } = values;
        const response : LoginResponse = await loginUser(username, password);

        if (response.success) {
            Alert.alert('Success', 'Logged in successfully!');
            navigation.navigate('HomeScreen');
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

      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              placeholder="Username"
              style={styles.input}
              value={values.username}
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
            />
            {touched.username && errors.username && <Text style={styles.error}>{errors.username}</Text>}

            <TextInput
              placeholder="Password"
              style={styles.input}
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
            />
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

            <Button title="Login" onPress={() => handleSubmit()} />

            <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Forgot password flow goes here')}>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation?.navigate('RegisterScreen')}>
              <Text style={styles.link}>New to the app? Register</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
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
