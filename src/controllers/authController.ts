import { Request, Response } from 'express'
import { userService } from '../services/userService.js'
import { jwtService } from '../services/jwtService.js'
import { checkPassword, User } from '../models/User.js'
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
                hasFullAccess: false,
                customerId: '',
                subscription: '',
                confirmationToken: null,
                emailConfirmed: false
            })

            const confirmationUrl = `${process.env.FRONTEND_URL}/confirmEmail?token=${user.confirmationToken}`;

            // Enviar email
            await sendEmail({
                to: user.email,
                subject: 'Confirmação de Email',
                html: `
                    <h1>Confirme seu Email</h1>
                    <p>Olá, ${user.firstName},</p>
                    <p>Para ativar sua conta, clique no link abaixo:</p>
                    <a href="${confirmationUrl}">Confirmar Email</a>
                `,
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

        try {
            await sendEmail({
                to: email,
                subject: "Esqueceu a senha.",
                html: `<html>
                    <body>
                        Olá, ${emailFound.firstName} ${emailFound.lastName}!<br/>
                        Recupere sua senha acessando o seguinte link:<br/>
                        <a href=${resetLink}>
                            Clique aqui para mudar a senha </a>
                    </body>
                </html>`
            })
        } catch (error) {
            console.log(error)
            return "DEU UM ERRO AQUI EM FORGOT: " + error
        }

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
