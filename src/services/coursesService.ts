import { Episode } from '../models/Episode.js'
import { Course } from '../models/Course.js'
import { Op } from 'sequelize'
import { Question } from '../models/Question.js'

export const coursesService = {
    findByIdWithEpisodes: async (id: string) => {
        const courseWithEpisodes = await Course.findByPk(id, {
            attributes: ['id', 'name', 'serie', ['featured_name', 'featuredName'], 'synopsis', ['thumbnail_url', 'thumbnailUrl'], ['featured_image', 'featuredImage']],
            include: {
                model: Episode,
                as: 'Episodes',
                attributes: [
                    'id',
                    'name',
                    'synopsis',
                    'order',
                    ['video_url', 'videoUrl'],
                    ['seconds_long', 'secondsLong'],
                ],
                order: [['order', 'ASC']],
                separate: true
            }, 
        })
        return courseWithEpisodes
    },
    getEpisodeWithQuizz: async (episodeId: number)=> {
        const episodeWithQuizz = await Episode.findByPk(episodeId, {
            attributes: ['id', 'name', ['course_id', 'courseId']],
            include: {
                model: Question,
                as: 'Quizzes',
                attributes: [
                    'order',
                    'question',
                    'answers',
                    ['file_url', 'fileUrl'],
                    ['correct_answer', 'correctAnswer'],
                    'serie',
                    'dificuldade',
                ]
            }
        })
        return episodeWithQuizz
    }
    ,
    getRandomFeaturedCourses: async () => {
        const featuredCourses = await Course.findAll({
            attributes: ['id', 'name', 'serie', ['featured_name', 'featuredName'], 'synopsis', ['thumbnail_url', 'thumbnailUrl'], ['featured_image', 'featuredImage']],
            where: { featured: true }
        })

        return featuredCourses
    },
    getTopNewest: async () => {
        const courses = await Course.findAll({
            limit: 10,
            order: [['created_at', 'DESC']]
        })

        return courses
    },
    getTopTenByLikes: async () => {
        const results = await Course.sequelize?.query(
          `SELECT
            courses.id,
            courses.name,
            courses.serie,
            courses.synopsis,
            courses.thumbnail_url as thumbnailUrl,
            COUNT(users.id) AS likes
          FROM courses
            LEFT OUTER JOIN likes
              ON courses.id = likes.course_id
              INNER JOIN users
                ON users.id = likes.user_id
          GROUP BY courses.id
          ORDER BY likes DESC
          LIMIT 10;`
        )
    
        if (results) {
          const [topTen] = results
          return topTen
        } else {
          return null
        }
      },
    findByName: async (name: string, page: number, perPage: number) => {
        const offset = (page - 1) * perPage
        const { count, rows } = await Course.findAndCountAll({
            attributes: ['id', 'name', 'serie','synopsis', ['thumbnail_url', 'thumbnailUrl']],
            where: {
                name: {
                    // Recurso importado do Sequelize para utilizar operadores do SQL
                    [Op.iLike]: `%${name}%` // % para procurar pelo termo em qualquer posição da String
                }
            },
            limit: perPage,
            offset
        })
        return {
            courses: rows,
            page,
            perPage,
            total: count
        }
    },
    

}
