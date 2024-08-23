import { Response, Request } from 'express'
import { getPaginationParams } from '../helpers/getPaginationParams.js'
import { AuthenticatedRequest } from '../middlewares/auth.js'
import { coursesService } from '../services/coursesService.js'
import { favoriteService } from '../services/favoriteService.js'
import { likeService } from '../services/likesService.js'
import { episodeService } from 'src/services/episodeService.js'
import { WatchTime } from 'src/models/WatchTime.js'

export const coursesController = {
    show: async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user!.id
        const courseId = req.params.id

        try {
            const course = await coursesService.findByIdWithEpisodes(courseId)
            if (!course) return res.status(404).json({message: 'Curso não encontrado'})
            
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
                        ? watchTime.seconds > (episode.secondsLong *0.5)
                        : false;
                        return {
                            isWatching,
                            episodeId: episode.id 
                        };
                })
            );
            const watchStatus = watchStatusArray.filter(status => status.isWatching)            
            return res.json({...course.get(), favorited, liked, watchStatus  })
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
        const { name } = req.query
        const [page, perPage] = getPaginationParams(req.query)
        try {
            // Nada que não for uma string não passará do if pois lançará um erro
            if (typeof name != 'string') throw new Error('Parâmetro nome precisa ser uma string')
            const courses = await coursesService.findByName(name, page, perPage)
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
        const courseId = Number(req.params.id)

        try {
            const courseWithQuizz = await coursesService.getCourseWithQuizz(courseId)
            if (!courseWithQuizz) return res.status(404).json({message: "Função showQuiz error: Curso com quizz não encontrado"})

            return res.json(courseWithQuizz)  
        } catch (error) {
            if (error instanceof Error){
                return res.status(400).json({message: error.message})
            }
        }
    }
}