import path from 'path'
import uploadFileFeature from '@adminjs/upload'
import { ComponentLoader, FeatureType, ResourceOptions } from 'adminjs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url));

export const componentLoader = new ComponentLoader()

export const episodeResourceOptions: ResourceOptions = {
  navigation: 'Catálogo',
  editProperties: ['name', 'synopsis', 'courseId', 'order', 'uploadVideo','secondsLong'  ],
  filterProperties: ['name', 'synopsis', 'courseId', 'secondsLong', 'createdAt', 'updatedAt'],
  listProperties: ['id', 'name', 'courseId', 'order', 'secondsLong'],
  showProperties: ['id', 'name', 'synopsis', 'courseId', 'order', 'videoUrl', 'secondsLong', 'createdAt', 'updatedAt']
}

export const episodeResourceFeatures: FeatureType[] = [
  uploadFileFeature({
    componentLoader,
    provider: {
      local: {
        bucket: path.join(__dirname, '../../../uploads'),
        opts: {baseUrl: 'uploads'}
      },
    },
    properties: {
      key: 'videoUrl',
      file: 'uploadVideo',
    },
    validation: {
      maxSize: 500 * 1024 * 1024,
    },
    uploadPath: (record, filename) => `videos/course-${record.get('courseId')}/${filename}`,
  }),
]




