import { Response } from 'express'
import fs from 'fs'
import path from 'path'
import { dirname } from 'path'
import { WatchTime } from '../models/WatchTime.js'
import { fileURLToPath } from 'url'
import { EpisodeFile } from '../models/EpisodeFiles.js'
import { Episode } from '../models/Episode.js'
import { Question } from 'src/models/Question.js'
const __dirname = dirname(fileURLToPath(import.meta.url));

export const episodeService = {
  streamEpisodeToResponse: (res: Response, videoUrl: string, range: string | undefined) => {
    const filePath = path.join(__dirname, '../../uploads', videoUrl)
    const fileStat = fs.statSync(filePath)

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')

      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1
      const chunkSize = (end - start) + 1

      const file = fs.createReadStream(filePath, { start, end })

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      }

      res.writeHead(206, head)
      file.pipe(res)
    } else {
      const head = {
        'Content-Length': fileStat.size,
        'Content-Type': 'video/mp4',
      }

      res.writeHead(200, head)
      fs.createReadStream(filePath).pipe(res)
    }
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
},
  findEpisodeWithFiles: async(id: number | string)=>{
    const episodeWithFiles = await Episode.findByPk(id, {
      attributes: ['id', 'name', 'secondsLong', 'courseId', 'order', ['video_url', 'videoUrl']],
      include: {
        model: EpisodeFile,
        as: 'Files',
        attributes: [
          'name',
          ['episode_id', 'episodeId'],
          ['file_url', 'fileUrl']
        ],
        separate: true
      }
    })
    return episodeWithFiles
  },
  getWatchTime: async (userId: string | number, episodeId: string | number) => {
    const watchTime = await WatchTime.findOne({
      attributes: ['seconds'],
      where: {
        userId,
        episodeId
      }
    })
    return watchTime
  },
  setWatchTime: async (userId: number, episodeId: number, seconds: number) => {
    const watchTimeAlreadyExists = await WatchTime.findOne({
      where: {
        userId,
        episodeId
      }
    })

    if (watchTimeAlreadyExists) {
      watchTimeAlreadyExists.seconds = seconds
      await watchTimeAlreadyExists.save()
      return watchTimeAlreadyExists
    } else {
      const newWatchTime = await WatchTime.create({
        userId,
        episodeId,
        seconds
      })
      return newWatchTime
    }
  }
}