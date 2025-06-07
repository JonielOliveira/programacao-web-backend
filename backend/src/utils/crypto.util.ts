import crypto from 'crypto';
import { MESSAGE_SECRET_KEY } from '../config/config';

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.createHash('sha256').update(MESSAGE_SECRET_KEY).digest(); // Garante 32 bytes

export function encryptMessage(plainText: string): { content: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    content: encrypted,
    iv: iv.toString('hex'),
  };
}

export function decryptMessage(encrypted: string, ivHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
