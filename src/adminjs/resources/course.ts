import uploadFileFeature from "@adminjs/upload";
import { ResourceOptions, FeatureType } from "adminjs";
import path, { dirname } from 'path'
import { componentLoader } from "./episode.js";
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../../../public')

export const courseResourceOptions: ResourceOptions = {
  navigation: 'Catálogo',
  editProperties: ['name', 'featuredName', 'synopsis', 'uploadThumbnail', 'uploadFeaturedImage', 'featured', 'categoryId'],
  filterProperties: ['name', 'featuredName', 'synopsis', 'featured','categoryId', 'createdAt', 'updatedAt'],
  listProperties: ['id', 'name', 'featuredName','featured', 'categoryId'],
  showProperties: ['id', 'name', 'featuredName', 'synopsis', 'featured', 'thumbnailUrl', 'featuredImage', 'categoryId', 'createdAt', 'updatedAt']
}

export const courseResourceFeatures: FeatureType[] = [
  uploadFileFeature({
    componentLoader,
    provider: {
      local: {
        bucket: publicDir,
        opts: {baseUrl: 'public'}
      },
    },
    properties: {
      key: 'thumbnailUrl',
      file: 'uploadThumbnail',
      filePath: 'thumbnailFilePath',    
      filesToDelete: 'thumbnailToDelete'
    },
    uploadPath: (record, filename) => `thumbnails/course-${record.get('id')}/${filename}`
  }),
  uploadFileFeature({
    componentLoader,
    provider: {
      local: {
        bucket: publicDir,
        opts: {baseUrl: 'public'}
      },
    },
    properties: {
      key: 'featuredImage',
      file: 'uploadFeaturedImage',
      filePath: 'featuredFilePath',
      filesToDelete: 'featuredToDelete'
    },
    uploadPath: (record, filename) => `featured-images/course-${record.get('id')}/${filename}`
  }),
]