import { QuizzResult } from "src/models/QuizzResults.js"


export const QuizResultService = {
    setQuizResult: async (userId: number, courseId: number, score: number) => {
        const QuizResultAlreadyExists = await QuizzResult.findOne({
            where: {
                userId,
                courseId
            }
        })

        if (QuizResultAlreadyExists) {
            QuizResultAlreadyExists.score = score
            await QuizResultAlreadyExists.save()
            return QuizResultAlreadyExists
        } else {
            const newWatchTime = await QuizzResult.create({
                userId,
                courseId,
                score,
                createdAt: new Date()
            })
            return newWatchTime
        }
    },
    getQuizResult: async (userId: string | number, courseId: string | number) => {
        const quizResult = await QuizzResult.findOne({
            attributes: ['userId','score', ['created_at', 'createdAt']],
            where: {
                userId,
                courseId
            }
        })
        return quizResult
    },
}