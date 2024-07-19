import { Request, Response } from 'express'
import { userService } from '../services/userService.js'
import { jwtService } from '../services/jwtService.js'
import { checkPassword } from '../models/User.js'
export const authController = {
    register: async (req: Request, res: Response) => {
        const { firstName, lastName, email, password, birth, phone } = req.body

        try {
            const userAlreadyExisted = await userService.findByEmail(email)
            if (userAlreadyExisted) { throw new Error('Este email já está cadastrado') }

            const user = await userService.create({
                firstName,
                lastName,
                birth,
                phone,
                email,
                password,
                role: 'user'
            })

            return res.status(201).json(user)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
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
                    return res.status(400).json({ message: "Entrnado no primeiro if: "+err.message })
                }

                if (!isSame) {
                    return res.status(401).json({ message: 'Senha incorreta' })
                }

                const payload = {
                    id: user.id,
                    firstName: user.firstName,
                    email: user.email
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
