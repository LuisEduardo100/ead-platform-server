import { fstat } from "fs"
import path, { dirname } from "path"
import { EpisodeFile } from "src/models/EpisodeFiles.js"
import fs from 'fs/promises'
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const EpisodeFileService = {
    getFileUrlByEpisodeId: async (episodeId: number) => {
        const fileRecord = await EpisodeFile.findOne({
            where: {episodeId}
        })

        if (fileRecord) {
            return fileRecord
        } 
        return null
    },
    getFilePath: async (fileUrl: string) => {
        const filePath = path.join(__dirname, '../../files',fileUrl)
        return filePath
    },
    fileExists: async (filePath: string) => {
        try{
            await fs.access(filePath)
            return true
        } catch {
            return false
        }
    }
}