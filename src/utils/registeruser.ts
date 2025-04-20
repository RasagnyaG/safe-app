import AsyncStorage from '@react-native-async-storage/async-storage';
import {encryptRequestBody} from'./encryption.js';
import { Alert } from 'react-native';

export const registerUser = async (username: string,password:string,email : string,phone : string,alt_email : string,alt_phoneno  : string) => {
    try {
          const encryptedData = await encryptRequestBody({
            username,
            passcode: password,
            email,
            phonenumber: phone,
            alternate_phoneno: alt_phoneno,
            alternate_email: alt_email,
          });
        
          const response = await fetch(`${process.env.BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: encryptedData }),
          });
        
          const result = await response.json();
          if (response.ok) {
            const { accessToken, refreshToken } = result.data;
            if (!accessToken || !refreshToken) {
                Alert.alert('Error', 'Registration Failed');
                return { success: false, message: 'Invalid response from server' };
            }
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            Alert.alert('Success', 'OTP sent successfully!');
          } else {
            Alert.alert('Error', result.message || 'Failed to send OTP.');
          }
        } catch (err) {
          console.error(err);
          Alert.alert('Error', 'Something went wrong.');
        }
}