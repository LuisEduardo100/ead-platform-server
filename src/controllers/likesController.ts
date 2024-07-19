import { AuthenticatedRequest } from "../middlewares/auth.js";
import { likeService } from "../services/likesService.js";
import { Response } from 'express'

export const likesController = {
    // POST /likes
    save: async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user!.id
        const { courseId } = req.body

        try {
            const like = await likeService.create(userId, courseId)
            return res.status(201).json(like)
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message })
            }
        }
    },
    delete: async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user!.id 
        const courseId = req.params.id

        try {
            await likeService.delete(userId, Number(courseId))
            return res.status(204).send()
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
    }
}