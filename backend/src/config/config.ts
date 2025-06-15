import dotenv from 'dotenv';
import ms, { StringValue } from 'ms';

dotenv.config(); // Carrega .env uma única vez

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1h') as StringValue;

const expiresInMs = ms(JWT_EXPIRES_IN);
if (!expiresInMs) throw new Error('[config] Formato inválido de JWT_EXPIRES_IN');

export const JWT_EXPIRES_IN_MS = expiresInMs;

// App
export const APP_PORT = parseInt(process.env.API_PORT || '3333');

// Admin
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_FULLNAME = process.env.ADMIN_FULLNAME || 'System Administrator';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@exemplo.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

if (!ADMIN_USERNAME || !ADMIN_FULLNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('[config] Variáveis de ambiente do administrador não estão definidas corretamente.');
}

// Segurança de mensagens
export const MESSAGE_SECRET_KEY = process.env.MESSAGE_SECRET_KEY || 'mensagemsupersecreta';

if (!MESSAGE_SECRET_KEY || MESSAGE_SECRET_KEY.length < 16) {
  throw new Error('[config] MESSAGE_SECRET_KEY deve estar definida e ter no mínimo 16 caracteres.');
}

// E-mail
export const SEND_EMAIL = process.env.SEND_EMAIL === 'true';
export const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
export const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
export const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
  throw new Error('[config] Variáveis de e-mail EMAIL_USER e EMAIL_PASS devem estar definidas.');
}
