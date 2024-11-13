import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { QuizResultService } from "../services/quizzResultService.js";


export const quizResultController = {
    showQuizResult: async (req: AuthenticatedRequest, res: Response)=>{
        const userId = req.user?.id   
        const episodeId = req.params.id

        if (!userId) {
            return res.status(400).json({ message: "User ID not found in request" });
        }
        try {
            const result = await QuizResultService.getQuizResult(userId, episodeId);
            return res.status(200).json({result})
        } catch (error: any) {
            res.status(500).json({error: error.message})
        }
    },
    setQuizResult: async (req: AuthenticatedRequest, res: Response)=>{
        const { score } = req.body;
        const userId = req.user?.id
        const episodeId = Number(req.params.id)

        if (!userId) {
            return res.status(400).json({ message: "User ID not found in request" });
        }
        try {
            const result = await QuizResultService.setQuizResult(userId, episodeId, score);
            return res.status(200).json(result)
        } catch (error: any) {
            res.status(500).json({error: error.message})
        }
    }
}