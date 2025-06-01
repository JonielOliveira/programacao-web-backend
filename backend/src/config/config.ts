import dotenv from 'dotenv';
import ms, { StringValue } from 'ms';

dotenv.config(); // Carrega .env uma única vez

export const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1h') as StringValue;

const expiresInMs = ms(JWT_EXPIRES_IN);
if (!expiresInMs) throw new Error('[config] Formato inválido de JWT_EXPIRES_IN');

export const JWT_EXPIRES_IN_MS = expiresInMs;

export const APP_PORT = parseInt(process.env.PORT || '3000');

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_FULLNAME = process.env.ADMIN_FULLNAME || 'System Administrator';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@exemplo.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

if (!ADMIN_USERNAME || !ADMIN_FULLNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('[config] Variáveis de ambiente do administrador não estão definidas corretamente.');
}
