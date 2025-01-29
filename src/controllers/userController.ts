import { AuthenticatedRequest } from "../middlewares/auth.js"
import { userService } from "../services/userService.js"
import { Response } from 'express'
import { checkPassword, User } from "../models/User.js"
import path from "path";
import upload from "../middlewares/upload.js";
import jwt from 'jsonwebtoken';

export const usersController = {
    // GET /users/current/watching
    watching: async (req: AuthenticatedRequest, res: Response) => {
        const { id } = req.user!

        try {
            const watching = await userService.getKeepWatchingList(id)
            return res.json(watching)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
    },
    // GET /users/current
    show: async (req: AuthenticatedRequest, res: Response) => {
        const currentUser = req.user

        try {
            return res.json(currentUser)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
    },
    // PUT /users/current
    update: async (req: AuthenticatedRequest, res: Response) => {
        const { id } = req.user!
        const { firstName, lastName, serie, phone, email, birth } = req.body

        try {
            const updatedUser = await userService.update(id, {
                firstName,
                lastName,
                serie,
                phone,
                email,
                birth
            })

            return res.json(updatedUser)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
    },
    recoverPassword: async (req: AuthenticatedRequest, res: Response) => {
        const token = req.headers.authorization?.split(" ")[1]; // Extrai o token do cabeçalho
        const { newPassword } = req.body

        if (!token) {
            return res.status(400).json({ error: 'Token é obrigatório' })
        }

        try {
            const secret = process.env.JWT_KEY as string
            const decoded = jwt.verify(token as string, secret) as { email: string };
            const email = decoded.email;

            const user = await userService.findByEmail(email)
            if (!user) {
                return res.send(404).json({ error: 'Usuário não encontrado!' })
            }

            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({
                    error: "A senha deve conter pelo menos 8 caracteres, incluindo letras e números.",
                });
            }

            // const hashedPassword = await bcrypt.hash(newPassword, 10);
            await userService.updatePassword(user.id, newPassword);

            return res.status(204).json();
        } catch (error) {
            console.log(error)
            return res.status(400).json({ error: "Token inválido ou expirado" })
        }


    },
    // PUT /users/current/password
    updatePassword: async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user
        const { currentPassword, newPassword } = req.body

        if (!user) {
            return res.status(401).json({ message: 'Não autorizado!' })
        }

        try {
            checkPassword(currentPassword, user.password, async (err, isSame) => {
                if (err) {
                    return res.status(400).json({ message: err.message })
                }

                if (!isSame) {
                    return res.status(400).json({ message: 'Senha incorreta' })
                }

                await userService.updatePassword(user.id, newPassword)
                return res.status(204).send()
            })
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
    },
    // POST /users/current/profileImage
    uploadProfilePicture: async (req: AuthenticatedRequest, res: Response) => {
        const { id } = req.user!; // ID do usuário autenticado

        // Middleware de upload do multer
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'Nenhum arquivo enviado' });
            }

            // Caminho completo da imagem
            const profilePicturePath = path.join('images', `user-id-${id}`, req.file.filename).replace(/\\/g, '/')

            try {
                // Atualizar o caminho da imagem no banco de dados
                const updatedUser = await userService.updateProfilePicture(id, profilePicturePath);

                // Retornar o usuário atualizado
                return res.json(updatedUser);
            } catch (err) {
                if (err instanceof Error) {
                    return res.status(400).json({ message: err.message });
                }
            }
        });
    },
}