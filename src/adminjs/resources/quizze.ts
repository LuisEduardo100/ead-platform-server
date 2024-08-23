import uploadFileFeature from "@adminjs/upload";
import { FeatureType, ResourceOptions } from "adminjs";
import { componentLoader } from "./episode.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const quizzResourceOptions: ResourceOptions = {
    navigation: 'Catálogo',
    editProperties: ['question', 'order', 'courseId', 'uploadFile', 'answers', 'correctAnswer', 'serie', 'dificuldade'],
    listProperties: ['id', 'order', 'courseId' ,'question', 'serie', 'dificuldade'],
    showProperties: ['courseId','order', 'question', 'answers', 'correctAnswer', 'serie', 'dificuldade']
}

export const quizzResourceFeature: FeatureType[] = [
  uploadFileFeature({
    componentLoader,
    provider: {
      local: {
        bucket: path.join(__dirname, '../../../files'),
        opts: {baseUrl: 'files'}
      },
    },
    properties: {
      key: 'fileUrl',
      file: 'uploadFile',
    },
    uploadPath: (record, filename) => `questoes/course-${record.get('courseId')}/${filename}`,
  }),
]



