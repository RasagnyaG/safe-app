import Aes, { Algorithms } from 'react-native-aes-crypto';

interface EncryptRequestBodyInput {
    [key: string]: any; // Adjust this type based on the expected structure of the body
}

export const encryptRequestBody = async (body: EncryptRequestBodyInput): Promise<string> => {
    const key: string | undefined = process.env.ENCRYPTION_KEY; 
    if (!key) {
        throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }
    const decodedKey: string = Buffer.from(key, 'base64').toString('utf8'); // decode to raw 32-byte key string
    const ivRaw: string = await Aes.randomKey(12); // 12-byte IV (GCM requires this length)

    const jsonString: string = JSON.stringify(body);

    // Encrypt using aes-256-gcm
    const encrypted: string = await Aes.encrypt(jsonString, decodedKey, ivRaw, 'aes-256-gcm' as Algorithms);

    // The tag is always the last 16 bytes = 24 base64 characters (GCM tag)
    const tag: string = encrypted.substring(encrypted.length - 24);
    const content: string = encrypted.substring(0, encrypted.length - 24);

    const iv: string = Buffer.from(ivRaw, 'utf8').toString('base64');
    const ciphertext: string = Buffer.from(content, 'utf8').toString('base64');
    const authTag: string = Buffer.from(tag, 'utf8').toString('base64');

    // Send data in format: base64(content):base64(iv):base64(tag)
    return `${ciphertext}:${iv}:${authTag}`;
};