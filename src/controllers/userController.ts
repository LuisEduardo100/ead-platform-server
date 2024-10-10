import { AuthenticatedRequest } from "../middlewares/auth.js"
import { userService } from "../services/userService.js"
import { Response } from 'express'
import { checkPassword, User } from "../models/User.js"
import path from "path";
import upload from "../middlewares/upload.js";

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
        const { firstName, lastName, phone, email, birth } = req.body

        try {
            const updatedUser = await userService.update(id, {
                firstName,
                lastName,
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