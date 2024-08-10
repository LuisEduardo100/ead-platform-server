import { AuthenticatedRequest } from "../middlewares/auth.js"
import { favoriteService } from "../services/favoriteService.js"
import { Response } from "express"

export const favoritesController = {
 // POST /favorites
  save: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id   
    const { courseId } = req.body

    if (!userId) {
        return res.status(400).json({ message: "User ID not found in request" });
    }

    try {
      const favorite = await favoriteService.create(userId, courseId)
      return res.status(201).json(favorite)
    } catch (err) {
      if (err instanceof Error) {
        return res.status(400).json({ message: "Save function catched an error: "+err.message })
      }
    }
  },
  index: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id

    try {
      const favorites = await favoriteService.findByUserId(userId)
      return res.json(favorites)
    } catch (err) {
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message })
      }
    }
  },
  delete: async(req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const courseId = req.params.id

    try {
        await favoriteService.delete(userId, Number(courseId))
        return res.status(204).send()
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message })
          }
    }
  },
}