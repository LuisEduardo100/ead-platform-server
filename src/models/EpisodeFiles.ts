import { Model, DataTypes } from 'sequelize'
import { database } from '../database/index.js'
import { Episode, EpisodeInstance } from './Episode.js'


export interface EpisodeFileAttributes {
  name: string
  episodeId: number
  fileUrl: string
}

export interface EpisodeCreationAttributes extends Model<EpisodeFileAttributes>, EpisodeFileAttributes { }


export interface EpisodeFileInstance extends Model<EpisodeCreationAttributes>, EpisodeFileAttributes {
  Episode?: EpisodeFileInstance
}


export const EpisodeFile = database.define<EpisodeFileInstance, EpisodeFileAttributes>('Files', {
  name: {
    type: DataTypes.STRING
  },
  episodeId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: { model: Episode, key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  fileUrl: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  }
})