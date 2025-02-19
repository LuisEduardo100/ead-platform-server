import { Request, Response } from "express";
import { Category } from "../models/Category.js";
import { Course } from "../models/Course.js";
import { Episode } from "../models/Episode.js";
import { EpisodeFile } from "../models/EpisodeFiles.js";

export const filesController = {
  allFiles: async (req: Request, res: Response) => {
    try {
      const categories = await Category.findAll({
        attributes: ["id", "name"],
        include: [
          {
            model: Course,
            as: "Courses",
            attributes: ["id", "name", "secondaryName", "code", "serie"],
            include: [
              {
                model: Episode,
                as: "Episodes",
                attributes: ["id", "name"],
                include: [
                  {
                    model: EpisodeFile,
                    as: "Files",
                    attributes: ["id", "name", "fileUrl"],
                  },
                ],
              },
            ],
          },
        ],
      });

      const apostilas = categories.map((category) => ({
        id: category.id,
        name: category.name,
        courses: category.Courses?.map((course: any) => ({
          id: course.id,
          name: course.name,
          secondaryName: course.secondaryName,
          code: course.code,
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
      res.status(500).json({ message: "Erro ao obter as apostilas" });
    }
  },
};
