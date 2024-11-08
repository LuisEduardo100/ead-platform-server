import { Response, Request } from 'express'
import { getPaginationParams } from '../helpers/getPaginationParams.js'
import { AuthenticatedRequest } from '../middlewares/auth.js'
import { coursesService } from '../services/coursesService.js'
import { favoriteService } from '../services/favoriteService.js'
import { likeService } from '../services/likesService.js'
import { WatchTime } from '../models/WatchTime.js'
import { QuizzResult } from '../models/QuizzResults.js'

export const coursesController = {
    show: async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user!.id
        const courseId = req.params.id

        try {
            const course = await coursesService.findByIdWithEpisodes(courseId)
            if (!course) return res.status(404).json({ message: 'Curso não encontrado' })

            const liked = await likeService.isLiked(userId, Number(courseId))
            const favorited = await favoriteService.isFavorited(userId, Number(courseId))
            const episodes = course.Episodes;

            const watchStatusArray = await Promise.all(
                episodes.map(async (episode: any) => {
                    const watchTime = await WatchTime.findOne({
                        where: {
                            userId,
                            episodeId: episode.id
                        }
                    });
                    const isWatching = watchTime
                        ? watchTime.seconds > (episode.secondsLong * 0.5)
                        : false;
                    return {
                        isWatching,
                        episodeId: episode.id
                    };
                })
            );

            const watchStatus = watchStatusArray.filter(status => status.isWatching)
            return res.json({ ...course.get(), favorited, liked, watchStatus })
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: + "O erro foi: " + err.message })
            }
        }
    },
    featured: async (req: Request, res: Response) => {
        try {
            const featuredCourses = await coursesService.getRandomFeaturedCourses()
            return res.json(featuredCourses)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
    },
    newest: async (req: Request, res: Response) => {
        try {
            const newCourses = await coursesService.getTopNewest()
            return res.send(newCourses)
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json({ message: err.message })
            }
        }
    },
    search: async (req: Request, res: Response) => {
        const { name, serie } = req.query;
        const [page, perPage] = getPaginationParams(req.query);

        try {
            if (typeof serie !== 'string') throw new Error('Parâmetro série precisa ser uma string');
            if (typeof name != 'string') throw new Error('Parâmetro nome precisa ser uma string')

            const courses = await coursesService.findByName(name || '', page, perPage, serie);

            return res.json(courses);
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json({ message: err.message });
            }
        }
    },
    generalSearch: async (req: Request, res: Response) => {
        const { name } = req.query
        const [page, perPage] = getPaginationParams(req.query)
        try {
            if (typeof name != 'string') throw new Error('Parâmetro nome precisa ser uma string')
            const courses = await coursesService.findByNameForGeneralSearch(name, page, perPage)
            return res.json(courses)
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json({ message: err.message })
            }
        }
    },
    popular: async (req: Request, res: Response) => {
        try {
            const topTen = await coursesService.getTopTenByLikes()
            return res.json(topTen)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(400).json({ message: err.message })
            }
        }
    },
    showQuizz: async (req: Request, res: Response) => {
        const episodeId = Number(req.params.id)

        try {
            const episodeWithQuizz = await coursesService.getEpisodeWithQuizz(episodeId)
            if (!episodeWithQuizz) return res.status(404).json({ message: "Função showQuiz error: Curso com quizz não encontrado" })

            return res.json(episodeWithQuizz)
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message })
            }
        }
    },
    saveQuizResult: async (req: Request, res: Response) => {
        const { userId, episodeId, score } = req.body;

        try {
            // Verifica se já existe um resultado para esse usuário e quiz
            let quizResult = await QuizzResult.findOne({
                where:
                {
                    userId,
                    episodeId
                }

            });

            if (quizResult) {
                quizResult.score = score;
                quizResult.createdAt = new Date();
            } else {
                quizResult = await QuizzResult.create({
                    userId,
                    episodeId,
                    score,
                    createdAt: new Date(),
                });
            }

            await quizResult.save();
            res.status(200).json(quizResult);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao salvar o resultado do quiz' });
        }
    },
}