import uploadFileFeature from "@adminjs/upload";
import { FeatureType, ResourceOptions } from "adminjs";
import { componentLoader } from "./episode.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const episodeFileResourceOptions: ResourceOptions = {
    navigation: 'Catálogo',
    editProperties: ['name', 'episodeId', 'uploadFile'],
    listProperties: ['id', 'name', 'episodeId', 'createdAt', 'updatedAt'],
    showProperties: ['name', 'episodeId', 'fileUrl', 'createdAt', 'updatedAt']
}

export const episodeFileFeatures: FeatureType[] = [
    uploadFileFeature({
      componentLoader,
      provider: {
        local: {
          bucket: path.join(__dirname, '../../../files'),
          opts: {baseUrl: 'uploads'}
        },
      },
      properties: {
        key: 'fileUrl',
        file: 'uploadFile',
      },
      uploadPath: (record, filename) => `pdfs/episode-${record.get('episodeId')}/${filename}`,
      multiple: true,
    }),
  ]
  
  
  
  
  