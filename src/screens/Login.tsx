import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const TwoStepLogin = () => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passcode, setPasscode] = useState(['', '', '', '', '', '']);
  const passcodeRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  // Check if biometric auth is available
  React.useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);
    })();
  }, []);

  // Handle passcode input
  const handlePasscodeChange = (text: string, index: number) => {
    const newPasscode = [...passcode];
    newPasscode[index] = text;
    setPasscode(newPasscode);

    // Auto-focus next input
    if (text && index < 5 && passcodeRefs.current[index + 1]) {
      passcodeRefs.current[index + 1]?.focus();
    }

    // Submit if last digit entered
    if (text && index === 5) {
      handleStep1Submit();
    }
  };

  // Handle backspace
  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !passcode[index] && index > 0 && passcodeRefs.current[index - 1]) {
      passcodeRefs.current[index - 1]?.focus();
    }
  };

  // Step 1 validation
  const handleStep1Submit = () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (passcode.some(digit => !digit)) {
      Alert.alert('Error', 'Please enter complete 6-digit passcode');
      return;
    }

    setStep(2);
    Keyboard.dismiss();
  };

  // Step 2 biometric verification
  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        fallbackLabel: 'Use passcode instead',
      });

      if (result.success) {
        Alert.alert('Success', 'Authentication successful!');
        // Proceed to your app's main screen
      } else {
        Alert.alert('Error', 'Authentication failed or canceled');
        setStep(1);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Biometric authentication failed');
      setStep(1);
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Login Verification</Text>
          <Text style={styles.subtitle}>Step 1 of 2: Enter your phone number and passcode</Text>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoFocus={true}
            />
          </View>

          {/* 6-Digit Passcode */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>6-Digit Passcode</Text>
            <View style={styles.passcodeContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (passcodeRefs.current[index] = ref)}
                  style={styles.passcodeInput}
                  placeholder="•"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={1}
                  value={passcode[index]}
                  onChangeText={(text) => handlePasscodeChange(text, index)}
                  onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
                  secureTextEntry={true}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleStep1Submit}>
            <Text style={styles.buttonText}>VERIFY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>Step 2 of 2: Biometric Authentication</Text>

          <View style={styles.biometricContainer}>
            <Text style={styles.biometricPlaceholder}>
              {Platform.OS === 'ios' ? 'Touch ID / Face ID' : 'Fingerprint'}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.biometricButton]} 
            onPress={handleBiometricAuth}
          >
            <Text style={styles.buttonText}>AUTHENTICATE</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setStep(1)}
          >
            <Text style={styles.backButtonText}>Back to passcode</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 24,
    justifyContent: 'center',
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  passcodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passcodeInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  button: {
    backgroundColor: '#1A237E',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  biometricPlaceholder: {
    fontSize: 18,
    color: '#666',
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
  },
  backButton: {
    marginTop: 24,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#1A237E',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default TwoStepLogin;
// import React, { useState, useRef } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, Platform } from 'react-native';
// import * as LocalAuthentication from 'expo-local-authentication';
// // import { Ionicons } from '@expo/vector-icons';

// const TwoStepLogin = () => {
//   const [step, setStep] = useState(1);
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [passcode, setPasscode] = useState(['', '', '', '', '', '']);
//   const passcodeRefs = useRef([]);
//   const [isBiometricSupported, setIsBiometricSupported] = useState(false);

//   // Check if biometric auth is available
//   React.useEffect(() => {
//     (async () => {
//       const compatible = await LocalAuthentication.hasHardwareAsync();
//       const enrolled = await LocalAuthentication.isEnrolledAsync();
//       setIsBiometricSupported(compatible && enrolled);
//     })();
//   }, []);

//   // Handle passcode input
//   const handlePasscodeChange = (text, index) => {
//     const newPasscode = [...passcode];
//     newPasscode[index] = text;
//     setPasscode(newPasscode);

//     // Auto-focus next input
//     if (text && index < 5) {
//       passcodeRefs.current[index + 1].focus();
//     }

//     // Submit if last digit entered
//     if (text && index === 5) {
//       handleStep1Submit();
//     }
//   };

//   // Handle backspace
//   const handleKeyPress = (index: any, key:any) => {
//     if (key === 'Backspace' && !passcode[index] && index > 0) {
//       passcodeRefs.current[index - 1].focus();
//     }
//   };

//   // Step 1 validation
//   const handleStep1Submit = () => {
//     if (phoneNumber.length < 10) {
//       Alert.alert('Error', 'Please enter a valid phone number');
//       return;
//     }

//     if (passcode.some(digit => !digit)) {
//       Alert.alert('Error', 'Please enter complete 6-digit passcode');
//       return;
//     }

//     // In a real app, you would verify the phone number and passcode here
//     setStep(2);
//     Keyboard.dismiss();
//   };

//   // Step 2 biometric verification
//   const handleBiometricAuth = async () => {
//     try {
//       const result = await LocalAuthentication.authenticateAsync({
//         promptMessage: 'Verify your identity',
//         fallbackLabel: 'Use passcode instead',
//       });

//       if (result.success) {
//         Alert.alert('Success', 'Authentication successful!');
//         // Proceed to your app's main screen
//       } else {
//         Alert.alert('Error', 'Authentication failed or canceled');
//         setStep(1); // Fall back to step 1
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Biometric authentication failed');
//       setStep(1); // Fall back to step 1
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {step === 1 ? (
//         <View style={styles.stepContainer}>
//           <Text style={styles.title}>Login Verification</Text>
//           <Text style={styles.subtitle}>Step 1 of 2: Enter your phone number and passcode</Text>

//           {/* Phone Number Input */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>Phone Number</Text>
//             <View style={styles.phoneInputWrapper}>
//               {/* <Ionicons name="call-outline" size={20} color="#1A237E" style={styles.inputIcon} /> */}
//               <TextInput
//                 style={styles.phoneInput}
//                 placeholder="+1 (___) ___-____"
//                 placeholderTextColor="#999"
//                 keyboardType="phone-pad"
//                 value={phoneNumber}
//                 onChangeText={setPhoneNumber}
//                 autoFocus={true}
//               />
//             </View>
//           </View>

//           {/* 6-Digit Passcode */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.label}>6-Digit Passcode</Text>
//             <View style={styles.passcodeContainer}>
//               {[0, 1, 2, 3, 4, 5].map((index) => (
//                 <TextInput
//                   key={index}
//                   ref={(ref) => (passcodeRefs.current[index] = ref)}
//                   style={styles.passcodeInput}
//                   keyboardType="number-pad"
//                   maxLength={1}
//                   value={passcode[index]}
//                   onChangeText={(text) => handlePasscodeChange(text, index)}
//                   onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
//                   secureTextEntry={true}
//                 />
//               ))}
//             </View>
//           </View>

//           <TouchableOpacity style={styles.button} onPress={handleStep1Submit}>
//             <Text style={styles.buttonText}>VERIFY</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={styles.stepContainer}>
//           <Text style={styles.title}>Identity Verification</Text>
//           <Text style={styles.subtitle}>Step 2 of 2: Biometric Authentication</Text>

//           <View style={styles.biometricContainer}>
//             {/* <Ionicons 
//               name={Platform.OS === 'ios' ? 'ios-finger-print' : 'md-finger-print'} 
//               size={80} 
//               color="#1A237E" 
//             /> */}
//             <Text style={styles.biometricText}>
//               {Platform.OS === 'ios' 
//                 ? 'Use Touch ID or Face ID' 
//                 : 'Use your fingerprint'}
//             </Text>
//           </View>

//           <TouchableOpacity 
//             style={[styles.button, styles.biometricButton]} 
//             onPress={handleBiometricAuth}
//           >
//             <Text style={styles.buttonText}>AUTHENTICATE</Text>
//             {/* <Ionicons name="finger-print-outline" size={24} color="white" /> */}
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={styles.backButton} 
//             onPress={() => setStep(1)}
//           >
//             <Text style={styles.backButtonText}>Back to passcode</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//     padding: 24,
//     justifyContent: 'center',
//   },
//   stepContainer: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1A237E',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 32,
//     textAlign: 'center',
//   },
//   inputContainer: {
//     marginBottom: 24,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1A237E',
//     marginBottom: 8,
//   },
//   phoneInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#DDD',
//     borderRadius: 10,
//     paddingHorizontal: 16,
//     height: 56,
//   },
//   phoneInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#333',
//     marginLeft: 8,
//     height: '100%',
//   },
//   inputIcon: {
//     marginRight: 8,
//   },
//   passcodeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   passcodeInput: {
//     width: 48,
//     height: 56,
//     borderWidth: 1,
//     borderColor: '#DDD',
//     borderRadius: 10,
//     textAlign: 'center',
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1A237E',
//   },
//   button: {
//     backgroundColor: '#1A237E',
//     borderRadius: 10,
//     padding: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 16,
//   },
//   biometricButton: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   biometricContainer: {
//     alignItems: 'center',
//     marginVertical: 40,
//   },
//   biometricText: {
//     fontSize: 16,
//     color: '#666',
//     marginTop: 16,
//   },
//   backButton: {
//     marginTop: 24,
//     alignSelf: 'center',
//   },
//   backButtonText: {
//     color: '#1A237E',
//     fontSize: 14,
//     fontWeight: '600',
//     textDecorationLine: 'underline',
//   },
// });

// export default TwoStepLogin;