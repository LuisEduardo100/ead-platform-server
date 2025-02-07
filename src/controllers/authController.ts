import { Request, Response } from 'express'
import { userService } from '../services/userService.js'
import { jwtService } from '../services/jwtService.js'
import { checkPassword, User, UserAttributes } from '../models/User.js'
import { sendEmail } from '../middlewares/mailtrap.js'
import { verifyRecaptcha } from '../services/recaptchaService.js'

export const authController = {
    confirmEmail: async (req: Request, res: Response) => {
        const { token } = req.query;

        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: 'Token de confirmação não fornecido.' });
        }

        try {
            const user = await User.findOne({ where: { confirmationToken: token } });

            if (!user) {
                return res.status(400).json({ error: 'Token inválido ou expirado.' });
            }

            if (user.emailConfirmed) {
                return res.status(400).json({ error: 'Email já confirmado anteriormente.' });
            }

            user.emailConfirmed = true;
            user.confirmationToken = '';
            await user.save();

            return res.status(200).json({ message: 'Email confirmado com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao confirmar email. Por favor, tente novamente mais tarde.' });
        }

    },
    register: async (req: Request, res: Response) => {
        const { firstName, lastName, serie, email, password, birth, phone, token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token do reCAPTCHA ausente.' });
        }

        const isHuman = await verifyRecaptcha(token);
        if (!isHuman) {
            return res.status(400).json({ message: 'Falha na verificação do reCAPTCHA. Ação suspeita detectada.' });
        }
        try {
            const userAlreadyExisted = await userService.findByEmail(email)
            if (userAlreadyExisted) { throw new Error('Este email já está cadastrado') }

            const initialSubscriptionValues: Pick<UserAttributes,
                'hasFullAccess' |
                'stripeCustomerId' |
                'subscriptionId' |
                'subscriptionStatus' |
                'subscriptionStartDate' |
                'subscriptionRenewalDate' |
                'paymentMethod' |
                'sessionId' |
                'latestInvoiceId' |
                'subscriptionCanceledAt'
            > = {
                hasFullAccess: false,
                subscriptionId: null,
                subscriptionStatus: 'inactive',
                subscriptionStartDate: null,
                subscriptionRenewalDate: null,
                paymentMethod: null,
                sessionId: null,
                stripeCustomerId: null,
                latestInvoiceId: null,
                subscriptionCanceledAt: null
            }

            const user = await userService.create({
                firstName,
                lastName,
                serie,
                birth,
                profileImage: '',
                phone,
                email,
                password,
                role: 'user',
                confirmationToken: null,
                emailConfirmed: false,
                ...initialSubscriptionValues
            })

            const confirmationUrl = `${process.env.FRONTEND_URL}/confirmEmail?token=${user.confirmationToken}`;

            // Enviar email
            await sendEmail({
                to: user.email,
                subject: 'Confirme seu Email 🎓',
                html: `<!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>Confirmação de Email</title>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background: #f7f7f7;
                            margin: 0;
                            padding: 0;
                            color: #444;
                        }
                        .container {
                            max-width: 600px;
                            margin: 30px auto;
                            background: #fff;
                            border-radius: 10px;
                            box-shadow: 0 3px 15px rgba(0,0,0,0.1);
                            padding: 40px;
                        }
                        .header {
                            text-align: center;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #eee;
                            margin-bottom: 30px;
                        }
                        .badge {
                            background: #27ae60;
                            width: 60px;
                            height: 60px;
                            border-radius: 50%;
                            margin: 0 auto 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 28px;
                            color: white;
                        }
                        .button {
                            display: inline-block;
                            margin: 20px 0;
                            padding: 10px 20px;
                            background: #27ae60;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            font-size: 0.9em;
                            color: #777;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="badge">✉️</div>
                            <h1 style="color: #2c3e50; margin: 0">Confirme seu Email</h1>
                        </div>
            
                        <div style="text-align: center; line-height: 1.6">
                            <p>Olá, ${user.firstName},</p>
                            <p>Estamos felizes em tê-lo(a) no <strong>Reforço Nota Dez</strong>! Para ativar sua conta, clique no botão abaixo:</p>
                            <a href="${confirmationUrl}" class="button">Confirmar Email</a>
                            <p style="margin-top: 10px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
                            <p style="word-break: break-all; color: #0070f3;">${confirmationUrl}</p>
                        </div>
            
                        <div class="footer">
                            <p style="margin: 5px 0">Atenciosamente,</p>
                            <p style="margin: 5px 0; font-weight: bold">Equipe Reforço Nota Dez</p>
                            <p style="margin: 15px 0 0; font-size: 0.9em">
                                Dúvidas? Entre em contato: <br>
                                ✉️ somosnotadez@gmail.com | 📞 (85) 9412-3487
                            </p>
                        </div>
                    </div>
                </body>
                </html>`
            });
            

            return res.status(201).json({ message: `Usuário registrado. Email de confirmação enviado. \nInformações:\n${user}` })
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
    },
    forgotPassword: async (req: Request, res: Response) => {
        const { email } = req.body

        // verificar se o email existe
        const emailFound = await userService.findByEmail(email)

        if (!emailFound) {
            return res.status(404).json({ error: `Usuário com o email ${email} não encontrado.` });
        }

        const token = jwtService.signToken({ email: emailFound.email }, '1h')
        const resetLink = `${process.env.FRONTEND_URL}/changePassword?token=${token}`

        await sendEmail({
            to: emailFound.email,
            subject: 'Redefinição de Senha 🔑',
            html: `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Redefinição de Senha</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background: #f7f7f7;
                        margin: 0;
                        padding: 0;
                        color: #444;
                    }
                    .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background: #fff;
                        border-radius: 10px;
                        box-shadow: 0 3px 15px rgba(0,0,0,0.1);
                        padding: 40px;
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #eee;
                        margin-bottom: 30px;
                    }
                    .badge {
                        background: #0070f3;
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        color: white;
                    }
                    .button {
                        display: inline-block;
                        margin: 20px 0;
                        padding: 10px 20px;
                        background: #0070f3;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 0.9em;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="badge">🔑</div>
                        <h1 style="color: #2c3e50; margin: 0">Redefina sua Senha</h1>
                    </div>
        
                    <div style="text-align: center; line-height: 1.6">
                        <p>Olá, ${emailFound.firstName},</p>
                        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Reforço Nota Dez</strong>. Clique no botão abaixo para criar uma nova senha:</p>
                        <a href="${resetLink}" class="button">Redefinir Senha</a>
                        <p style="margin-top: 10px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
                        <p style="word-break: break-all; color: #0070f3;">${resetLink}</p>
                        <p style="margin-top: 20px;">Caso não tenha solicitado essa alteração, ignore este e-mail.</p>
                    </div>
        
                    <div class="footer">
                        <p style="margin: 5px 0">Atenciosamente,</p>
                        <p style="margin: 5px 0; font-weight: bold">Equipe Reforço Nota Dez</p>
                        <p style="margin: 15px 0 0; font-size: 0.9em">
                            Precisa de ajuda? Entre em contato: <br>
                            ✉️ somosnotadez@gmail.com | 📞 (85) 9412-3487
                        </p>
                    </div>
                </div>
            </body>
            </html>`
        });

        res.json({ msg: 'Email enviado!' })
    },
    login: async (req: Request, res: Response) => {
        const { email, password } = req.body;

        try {
            const user = await userService.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'E-mail não registrado' });
            }

            if (!user.emailConfirmed) {
                return res.status(401).json({ message: 'Confirme seu email para acessar a conta!' });
            }

            // Transformar checkPassword em async/await para evitar problemas
            const isSame = await new Promise((resolve, reject) => {
                checkPassword(password, user.password, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            if (!isSame) {
                return res.status(401).json({ message: 'Senha incorreta' });
            }

            const payload = {
                id: user.id,
                firstName: user.firstName,
                email: user.email,
                hasFullAccess: user.hasFullAccess,
            };

            const token = jwtService.signToken(payload, '7d');

            return res.json({ authenticated: true, user, token });
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Erro inesperado no servidor' });
        }
    }
}
