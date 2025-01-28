import { Request, Response } from "express";
import { Category } from "src/models/Category.js";
import { Course, CourseInstance, CourseType } from "src/models/Course.js";
import { Episode, EpisodeInstance} from "src/models/Episode.js";
import { EpisodeFile, EpisodeFileInstance } from "src/models/EpisodeFiles.js";


export const filesController = {
    allFiles: async (req: Request, res: Response) => {
        try {
            const categories = await Category.findAll({
                attributes: ['id', 'name'],
                include: [
                    {
                        model: Course,
                        as: 'Courses', 
                        attributes: ['id', 'name', 'serie'], 
                        include: [
                            {
                                model: Episode,
                                as: 'Episodes', 
                                attributes: ['id', 'name'], 
                                include: [
                                    {
                                        model: EpisodeFile,
                                        as: 'Files', 
                                        attributes: ['id', 'name', 'fileUrl'], 
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
            
            const apostilas = categories.map(category => ({
                id: category.id,
                name: category.name,
                courses: category.Courses?.map((course: any) => ({
                    id: course.id,
                    name: course.name,
                    serie: course.serie,
                    episodes: course.Episodes?.map((episode: any) => ({
                        id: episode.id,
                        name: episode.name,
                        files: episode.Files?.map((file: any) => ({
                            id: file.id,
                            name: file.name,
                            url: file.fileUrl,
                        })),
                    })),
                })),
            }));

            res.json(apostilas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao obter as apostilas' });
        }

    }
}