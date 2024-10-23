import { ResourceWithOptions } from "adminjs";
import { Category } from "../../models/Category.js";
import { Course } from "../../models/Course.js";
import { Episode } from "../../models/Episode.js"
import { User } from "../../models/User.js";
import { categoryResourceOptions } from "./category.js";
import { courseResourceOptions, courseResourceFeatures } from "./course.js";
import { episodeResourceFeatures, episodeResourceOptions } from "./episode.js";
import { userResourceOptions } from "./user.js";
import { EpisodeFile } from "../../models/EpisodeFiles.js";
import { episodeFileFeatures, episodeFileResourceOptions } from "./episodeFile.js";
import { Question } from "src/models/Question.js";
import { quizzResourceFeature, quizzResourceOptions } from "./question.js";

export const adminJsResources: ResourceWithOptions[] = [
  {
    resource: Category,
    options: categoryResourceOptions,
    
  },
  {
    resource: Course,
    options: courseResourceOptions,
    features: courseResourceFeatures
  },
  {
    resource: Episode,
    options: episodeResourceOptions,
    features: episodeResourceFeatures
  },
  {
    resource: EpisodeFile,
    features: episodeFileFeatures,
    options: episodeFileResourceOptions
  },
  {
    resource: Question,
    options: quizzResourceOptions,
    features: quizzResourceFeature
  },
  {
    resource: User,
    options: userResourceOptions
  },
]