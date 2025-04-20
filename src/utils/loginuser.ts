import { Alert } from "react-native";
import { encryptRequestBody } from "./encryption.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loginUser(username: String, password: String) {
    try {
        const encryptedData = await encryptRequestBody({ username, passcode: password });
        const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: encryptedData }),
        })

        const result = await response.json();
        if (response.ok) {
            const {accessToken, refreshToken} = result.data;
            if (!accessToken || !refreshToken) {
                Alert.alert('Error', 'Login Failed');
                return { success: false, message: 'Invalid response from server' };
            }
            Alert.alert('Success', 'Logged in successfully!');
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            return { success: true, message: 'Logged in successfully!' };
        } else {
            Alert.alert('Error', result.message || 'Login failed');
            return { success: false, message: result.message };
        }

    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Something went wrong');
        return { success: false, message: 'Something went wrong' };
    }
}