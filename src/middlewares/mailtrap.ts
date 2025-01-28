import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string,                                                
}

export const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })
  }

  return nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'ac2a83ce3ed4b5',
      pass: '3e2a3c3854c336'
    }
  })
}

const transporter = createTransporter()

export const sendEmail = async ({to, subject, html}: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to, 
      subject,
      html
    })

    console.log(`EMAIL ENVIADO: ${info.messageId}`) // id do sender
    console.log(`EMAIL ENVIADO: \n ${info.envelope.from} (FROM) \n ${info.envelope.to} (TO)`) // objeto
    console.log(`EMAIL ENVIADO: ${info.response}`) // código de sucesso (200 queued)
    console.log(`EMAIL ENVIADO: ${info.accepted}`) // email para qual foi enviado
    
  } catch (error) {
    console.log(`Erro ao enviar o email: ${error}`)
    throw new Error(`Falha ao enviar o email`)
  }
}