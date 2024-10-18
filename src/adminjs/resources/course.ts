import uploadFileFeature from "@adminjs/upload";
import { ResourceOptions, FeatureType } from "adminjs";
import path, { dirname } from 'path'
import { componentLoader } from "./episode.js";
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url));

export const courseResourceOptions: ResourceOptions = {
  navigation: 'Catálogo',
  editProperties: ['name', 'featuredName', 'synopsis', 'uploadThumbnail', 'featured', 'categoryId'],
  filterProperties: ['name', 'featuredName', 'synopsis', 'featured', 'categoryId', 'createdAt', 'updatedAt'],
  listProperties: ['id', 'name', 'featuredName','featured', 'categoryId'],
  showProperties: ['id', 'name', 'featuredName', 'synopsis', 'featured', 'thumbnailUrl', 'categoryId', 'createdAt', 'updatedAt']
}

export const courseResourceFeatures: FeatureType[] = [
  uploadFileFeature({
    componentLoader,
    provider: {
      local: {
        bucket: path.join(__dirname, '../../../public'),
        opts: {baseUrl: 'public'}
      },
    },
    properties: {
      key: 'thumbnailUrl',
      file: 'uploadThumbnail'
    },
    uploadPath: (record, filename) => `thumbnails/course-${record.get('id')}/${filename}`
  })
]