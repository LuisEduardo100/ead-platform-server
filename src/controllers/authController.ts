import { Request, Response } from 'express'
import { userService } from '../services/userService.js'
import { jwtService } from '../services/jwtService.js'
import { checkPassword } from '../models/User.js'
import { sendEmail } from 'src/middlewares/mailtrap.js'
export const authController = {
    register: async (req: Request, res: Response) => {
        const { firstName, lastName, serie, email, password, birth, phone } = req.body

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
            })

            return res.status(201).json(user)
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

        const token = jwtService.signToken({email: emailFound.email}, '1h')
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
            return "DEU UM ERRO AQUI EM FORGOT: "+error
        }

        res.json({ msg: 'Email enviado!' })
    },
    login: async (req: Request, res: Response) => {
        const { email, password } = req.body

        try {
            const user = await userService.findByEmail(email)
            if (!user) {
                return res.status(401).json({ message: 'E-mail não registrado' })
            }

            checkPassword(password, user.password, (err, isSame) => {
                if (err) {
                    return res.status(400).json({ message: "Entrnado no primeiro if: " + err.message })
                }

                if (!isSame) {
                    return res.status(401).json({ message: 'Senha incorreta' })
                }

                const payload = {
                    id: user.id,
                    firstName: user.firstName,
                    email: user.email,
                    hasFullAccess: user.hasFullAccess
                }

                const token = jwtService.signToken(payload, '7d')

                return res.json({ authenticated: true, user, token })
            })
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
    }
}
