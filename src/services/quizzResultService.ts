import { QuizzResult } from "../models/QuizzResults.js"

export const QuizResultService = {
    setQuizResult: async (userId: number, episodeId: number, score: number) => {
        const QuizResultAlreadyExists = await QuizzResult.findOne({
            where: {
                userId,
                episodeId
            }
        })

        if (QuizResultAlreadyExists) {
            QuizResultAlreadyExists.score = score
            await QuizResultAlreadyExists.save()
            return QuizResultAlreadyExists
        } else {
            const newWatchTime = await QuizzResult.create({
                userId,
                episodeId,
                score,
                createdAt: new Date()
            })
            return newWatchTime
        }
    },
    getQuizResult: async (userId: string | number, episodeId: string | number) => {
        const quizResult = await QuizzResult.findOne({
            attributes: ['userId','score', ['created_at', 'createdAt']],
            where: {
                userId,
                episodeId
            }
        })
        return quizResult
    },
}