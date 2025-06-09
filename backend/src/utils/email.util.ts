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
      from: `"Projeto Chat - Joniel" <${EMAIL_USER}>`,
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
