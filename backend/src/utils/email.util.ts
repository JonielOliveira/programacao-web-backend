import nodemailer from 'nodemailer';
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_APP_PASSWORD,
  SEND_EMAIL,
} from '../config/config';

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_APP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: SendEmailOptions): Promise<void> {
  if (SEND_EMAIL) {
    await transporter.sendMail({
      from: `"Join & Chat" <${EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } else {
    console.log(`\n[Simulação de envio de e-mail]
→ Para: ${to}
→ Assunto: ${subject}
→ Corpo: ${text}\n`);
  }
}

export async function sendTemporaryPasswordEmail(user: { fullName: string; email: string }, tempPassword: string) {
  await sendEmail({
    to: user.email,
    subject: 'Senha temporária para acesso ao sistema',
    text: `Olá ${user.fullName},

Uma nova senha temporária foi gerada para você:

${tempPassword}

Ela é válida por apenas 15 minutos. Acesse o sistema com ela e altere sua senha em seguida.

Se você não solicitou isso, ignore este e-mail.

Sistema Join & Chat.`,
  });
}
