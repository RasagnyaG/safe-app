import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { registerUser } from  '../utils/registeruser.js';
// import DeviceInfo from 'react-native-device-info';

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required('Required'),

  email: Yup.string()
    .email('Invalid email')
    .required('Required'),

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
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .required('Required'),

  alt_email: Yup.string()
    .email('Invalid alternate email'),

  alt_phoneno: Yup.string()
    .required('Required')
    .matches(/^\+?[1-9]\d{9,14}$/, 'Invalid alternate phone number'),

}).test('emailOrPhone', 'Either email or phone is required', (values) => {
  return !!values.email || !!values.phone;
});

export default function RegisterScreen() {
  // const [deviceId, setDeviceId] = React.useState('');
  // const getId = async () =>{
  //     await DeviceInfo.getUniqueId().then(uniqueId =>{
  //       console.log(uniqueId); 
  //       return uniqueId;
  //     })
  // }
  const handleGetOtp = async (values : any) => {
    try {
    //   const uniqueDeviceId = await DeviceInfo.getUniqueId(); 
      // setDeviceId(deviceid);
    //   console.log(uniqueDeviceId);
      const {
        username,
        email,
        phone,
        password,
        alt_email,
        alt_phoneno,
      } = values;

      await registerUser(username, email, phone, password, alt_email, alt_phoneno);
      Alert.alert('Success', 'OTP sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <Formik
        initialValues={{
          username: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          alt_email: '',
          alt_phoneno: '',
          deviceId: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleGetOtp}
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
              placeholder="Email"
              style={styles.input}
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
            />
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TextInput
              placeholder="Phone Number"
              style={styles.input}
              value={values.phone}
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              keyboardType="phone-pad"
            />
            {touched.phone && errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

            <TextInput
              placeholder="New Password"
              style={styles.input}
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
            />
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

            <TextInput
              placeholder="Confirm Password"
              style={styles.input}
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              secureTextEntry
            />
            {touched.confirmPassword && errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

            <TextInput
              placeholder="Alternate Email"
              style={styles.input}
              value={values.alt_email}
              onChangeText={handleChange('alt_email')}
              onBlur={handleBlur('alt_email')}
              keyboardType="email-address"
            />
            {touched.alt_email && errors.alt_email && <Text style={styles.error}>{errors.alt_email}</Text>}

            <TextInput
              placeholder="Alternate Phone"
              style={styles.input}
              value={values.alt_phoneno}
              onChangeText={handleChange('alt_phoneno')}
              onBlur={handleBlur('alt_phoneno')}
              keyboardType="phone-pad"
            />
            {touched.alt_phoneno && errors.alt_phoneno && <Text style={styles.error}>{errors.alt_phoneno}</Text>}

            {/* <TextInput
              placeholder="Device ID"
              style={styles.input}
              value={values.deviceId}
              onChangeText={handleChange('deviceId')}
              onBlur={handleBlur('deviceId')}
            />
            {touched.deviceId && errors.deviceId && <Text style={styles.error}>{errors.deviceId}</Text>} */}

            <Button title="Get OTP" onPress={() => handleSubmit()} />
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
});