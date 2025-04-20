import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';
import * as Yup from 'yup';
import { registerUser } from '../utils/registeruser';

interface FormValues {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  alt_email: string;
  alt_phoneno: string;
  deviceId: string;
}

interface FieldProps {
  field: keyof FormValues;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
}

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string()
    .required('Required')
    .matches(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  password: Yup.string()
    .required('Required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must include at least one uppercase letter')
    .matches(/[a-z]/, 'Must include at least one lowercase letter')
    .matches(/\d/, 'Must include at least one number')
    .matches(/[@$!%*#?&]/, 'Must include at least one special character'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Passwords must match')
    .required('Required'),
  alt_email: Yup.string().email('Invalid alternate email'),
  alt_phoneno: Yup.string()
    .required('Required')
    .matches(/^\+?[1-9]\d{9,14}$/, 'Invalid alternate phone number'),
}).test(
  'emailOrPhone',
  'Either email or phone is required',
  (values: any) => !!values.email || !!values.phone
);

const RegisterScreen: React.FC = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    alt_email: '',
    alt_phoneno: '',
    deviceId: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleGetOtp = async () => {
    try {
      await RegisterSchema.validate(formValues, { abortEarly: false });

      const {
        username,
        email,
        phone,
        password,
        alt_email,
        alt_phoneno,
      } = formValues;

      await registerUser(username, email, phone, password, alt_email, alt_phoneno);
      Alert.alert('Success', 'OTP sent successfully!');
    } catch (err: any) {
      if (err.inner) {
        const formErrors: Partial<Record<keyof FormValues, string>> = {};
        err.inner.forEach((e: Yup.ValidationError) => {
          formErrors[e.path as keyof FormValues] = e.message;
        });
        setErrors(formErrors);
      } else {
        Alert.alert('Error', 'Validation or submission failed');
      }
    }
  };

  const inputFields: FieldProps[] = [
    { field: 'username', placeholder: 'Username' },
    { field: 'email', placeholder: 'Email', keyboardType: 'email-address' },
    { field: 'phone', placeholder: 'Phone Number', keyboardType: 'phone-pad' },
    { field: 'password', placeholder: 'New Password', secureTextEntry: true },
    { field: 'confirmPassword', placeholder: 'Confirm Password', secureTextEntry: true },
    { field: 'alt_email', placeholder: 'Alternate Email', keyboardType: 'email-address' },
    { field: 'alt_phoneno', placeholder: 'Alternate Phone', keyboardType: 'phone-pad' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Fill in the form to get started</Text>

        {inputFields.map(({ field, ...rest }) => (
          <View key={field}>
            <TextInput
              placeholder={rest.placeholder}
              style={[styles.input, errors[field] && styles.inputErrorBorder]}
              value={formValues[field]}
              onChangeText={text => handleChange(field, text)}
              keyboardType={rest.keyboardType}
              secureTextEntry={rest.secureTextEntry}
              placeholderTextColor="#888"
            />
            {errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleGetOtp}>
          <Text style={styles.buttonText}>Get OTP</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f2f4f8',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f9fc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputErrorBorder: {
    borderColor: '#ff4444',
    borderWidth: 1.5,
    backgroundColor: '#fff5f5',
  },
  error: {
    color: '#ff4444',
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});



// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
// import * as Yup from 'yup';
// import { registerUser } from '../utils/registeruser.js';
// // import DeviceInfo from 'react-native-device-info';

// const RegisterSchema = Yup.object().shape({
//   username: Yup.string().required('Required'),
//   email: Yup.string().email('Invalid email').required('Required'),
//   phone: Yup.string().required('Required').matches(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
//   password: Yup.string()
//     .required('Required')
//     .min(8, 'Password must be at least 8 characters')
//     .matches(/[A-Z]/, 'Must include at least one uppercase letter')
//     .matches(/[a-z]/, 'Must include at least one lowercase letter')
//     .matches(/\d/, 'Must include at least one number')
//     .matches(/[@$!%*#?&]/, 'Must include at least one special character'),
//   confirmPassword: Yup.string().oneOf([Yup.ref('password'), undefined], 'Passwords must match').required('Required'),
//   alt_email: Yup.string().email('Invalid alternate email'),
//   alt_phoneno: Yup.string().required('Required').matches(/^\+?[1-9]\d{9,14}$/, 'Invalid alternate phone number'),
// }).test('emailOrPhone', 'Either email or phone is required', (values: any) => {
//   return !!values.email || !!values.phone;
// });

// export default function RegisterScreen() {
//   const [formValues, setFormValues] = useState({
//     username: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//     alt_email: '',
//     alt_phoneno: '',
//     deviceId: '',
//   });

//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   const handleChange = (field: string, value: string) => {
//     setFormValues(prev => ({ ...prev, [field]: value }));
//   };

//   const handleGetOtp = async () => {
//     try {
//       await RegisterSchema.validate(formValues, { abortEarly: false });

//       const {
//         username,
//         email,
//         phone,
//         password,
//         alt_email,
//         alt_phoneno,
//       } = formValues;

//       await registerUser(username, email, phone, password, alt_email, alt_phoneno);
//       Alert.alert('Success', 'OTP sent successfully!');
//     } catch (err: any) {
//       if (err.inner) {
//         const formErrors: { [key: string]: string } = {};
//         err.inner.forEach((e: any) => {
//           formErrors[e.path] = e.message;
//         });
//         setErrors(formErrors);
//       } else {
//         Alert.alert('Error', 'Validation or submission failed');
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Register</Text>

//       <TextInput
//   placeholder="Username"
//   style={[styles.input, errors.username && styles.inputErrorBorder]}
//   value={formValues.username}
//   onChangeText={text => handleChange('username', text)}
// />
// {errors.username && <Text style={styles.error}>{errors.username}</Text>}

// <TextInput
//   placeholder="Email"
//   style={[styles.input, errors.email && styles.inputErrorBorder]}
//   value={formValues.email}
//   onChangeText={text => handleChange('email', text)}
//   keyboardType="email-address"
// />
// {errors.email && <Text style={styles.error}>{errors.email}</Text>}

// <TextInput
//   placeholder="Phone Number"
//   style={[styles.input, errors.phone && styles.inputErrorBorder]}
//   value={formValues.phone}
//   onChangeText={text => handleChange('phone', text)}
//   keyboardType="phone-pad"
// />
// {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

// <TextInput
//   placeholder="New Password"
//   style={[styles.input, errors.password && styles.inputErrorBorder]}
//   value={formValues.password}
//   onChangeText={text => handleChange('password', text)}
//   secureTextEntry
// />
// {errors.password && <Text style={styles.error}>{errors.password}</Text>}

// <TextInput
//   placeholder="Confirm Password"
//   style={[styles.input, errors.confirmPassword && styles.inputErrorBorder]}
//   value={formValues.confirmPassword}
//   onChangeText={text => handleChange('confirmPassword', text)}
//   secureTextEntry
// />
// {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

// <TextInput
//   placeholder="Alternate Email"
//   style={[styles.input, errors.alt_email && styles.inputErrorBorder]}
//   value={formValues.alt_email}
//   onChangeText={text => handleChange('alt_email', text)}
//   keyboardType="email-address"
// />
// {errors.alt_email && <Text style={styles.error}>{errors.alt_email}</Text>}

// <TextInput
//   placeholder="Alternate Phone"
//   style={[styles.input, errors.alt_phoneno && styles.inputErrorBorder]}
//   value={formValues.alt_phoneno}
//   onChangeText={text => handleChange('alt_phoneno', text)}
//   keyboardType="phone-pad"
// />
// {errors.alt_phoneno && <Text style={styles.error}>{errors.alt_phoneno}</Text>}


//       {/* 
//       <TextInput
//         placeholder="Username"
//         style={styles.input}
//         value={formValues.username}
//         onChangeText={text => handleChange('username', text)}
//       />
//       {errors.username && <Text style={styles.error}>{errors.username}</Text>}

//       <TextInput
//         placeholder="Email"
//         style={styles.input}
//         value={formValues.email}
//         onChangeText={text => handleChange('email', text)}
//         keyboardType="email-address"
//       />
//       {errors.email && <Text style={styles.error}>{errors.email}</Text>}

//       <TextInput
//         placeholder="Phone Number"
//         style={styles.input}
//         value={formValues.phone}
//         onChangeText={text => handleChange('phone', text)}
//         keyboardType="phone-pad"
//       />
//       {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

//       <TextInput
//         placeholder="New Password"
//         style={styles.input}
//         value={formValues.password}
//         onChangeText={text => handleChange('password', text)}
//         secureTextEntry
//       />
//       {errors.password && <Text style={styles.error}>{errors.password}</Text>}

//       <TextInput
//         placeholder="Confirm Password"
//         style={styles.input}
//         value={formValues.confirmPassword}
//         onChangeText={text => handleChange('confirmPassword', text)}
//         secureTextEntry
//       />
//       {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

//       <TextInput
//         placeholder="Alternate Email"
//         style={styles.input}
//         value={formValues.alt_email}
//         onChangeText={text => handleChange('alt_email', text)}
//         keyboardType="email-address"
//       />
//       {errors.alt_email && <Text style={styles.error}>{errors.alt_email}</Text>}

//       <TextInput
//         placeholder="Alternate Phone"
//         style={styles.input}
//         value={formValues.alt_phoneno}
//         onChangeText={text => handleChange('alt_phoneno', text)}
//         keyboardType="phone-pad"
//       />
//       {errors.alt_phoneno && <Text style={styles.error}>{errors.alt_phoneno}</Text>} */}

//       {/* <TextInput
//         placeholder="Device ID"
//         style={styles.input}
//         value={formValues.deviceId}
//         onChangeText={text => handleChange('deviceId', text)}
//       />
//       {errors.deviceId && <Text style={styles.error}>{errors.deviceId}</Text>} */}

//       <Button title="Get OTP" onPress={handleGetOtp} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 32,
//     marginBottom: 24,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     padding: 12,
//     marginBottom: 12,
//     borderRadius: 6,
//   },
//   inputErrorBorder: {
//     borderColor: '#ff4444',
//     borderWidth: 1.5,
//     backgroundColor: '#fff5f5',
//   },
  
//   error: {
//     color: 'red',
//     marginBottom: 8,
//     marginLeft: 4,
//   },
// });

