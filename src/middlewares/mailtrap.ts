import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
import { EMAIL_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME } from 'src/config/environment.js';
dotenv.config()

interface EmailOptions {
  to: string
  subject: string
  html: string,
}

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD 
    },
    tls: {
      secureProtocol: 'TLSv1_2_method'
    }
  })
}

const transporter = createTransporter()

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html
    })
  } catch (error) {
    throw new Error(`Falha ao enviar o email`)
  }
}