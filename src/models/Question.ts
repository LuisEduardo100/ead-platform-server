import { Model, DataTypes } from 'sequelize'
import { database } from '../database/index.js'
import { Episode, EpisodeInstance } from './Episode.js'


export interface QuizzFileAttributes {
  id: number
  question: string
  episodeId: number
  fileUrl: string
  answers: string
  correctAnswer: number
  serie: string
  dificuldade: string
  order: number
}

export interface QuizzCreationAttributes extends Model<QuizzFileAttributes>, QuizzFileAttributes { }


export interface QuizzFileInstance extends Model<QuizzCreationAttributes>, QuizzFileAttributes {
  Episode?: EpisodeInstance
}


export const Question = database.define<QuizzFileInstance, QuizzFileAttributes>('Questions', {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER
  },
  order: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  dificuldade: {
    allowNull: false,
    type: DataTypes.ENUM("Fácil", "Médio", "Difícil"),
    defaultValue: "Médio"
  },
  serie: {
    allowNull: false,
    type: DataTypes.ENUM("6º ano", "7º ano", "8º ano", "9º ano"),
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  episodeId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: { model: Episode, key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  correctAnswer: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  answers: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  fileUrl: {
    type: DataTypes.STRING
  }, 
}, {
  tableName: "questions"
})