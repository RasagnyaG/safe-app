import Aes from 'react-native-aes-crypto';
import {Buffer} from 'buffer';

interface EncryptRequestBodyInput {
  [key: string]: any;
}

export const encryptRequestBody = async (
  body: EncryptRequestBodyInput,
): Promise<string> => {
  const keyBase64 = process.env.ENCRYPTION_KEY;
  if (!keyBase64) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }

  // Convert base64 key to hex for AES.encrypt
  const keyHex = Buffer.from(keyBase64, 'base64').toString('hex');

  // Generate 12-byte IV (GCM standard)
  const ivHex = await Aes.randomKey(12); // hex string

  const plaintext = JSON.stringify(body);

  // Encrypt using AES-GCM, using type assertion to bypass the 'Algorithms' type
  // Encrypt using AES-256-GCM
  const encryptedHex = await Aes.encrypt(
    plaintext,
    keyHex,
    ivHex,
    'aes-256-gcm' as any,
  );

  // Extract the tag (last 32 hex characters)
  const tagHex = encryptedHex.slice(-32);
  const ciphertextHex = encryptedHex.slice(0, -32);

  // Convert to base64 for transmission
  const ciphertextBase64 = Buffer.from(ciphertextHex, 'hex').toString('base64');
  const ivBase64 = Buffer.from(ivHex, 'hex').toString('base64');
  const tagBase64 = Buffer.from(tagHex, 'hex').toString('base64');

  // Format: base64(c):base64(iv):base64(tag)
  return `${ciphertextBase64}:${ivBase64}:${tagBase64}`;
};
