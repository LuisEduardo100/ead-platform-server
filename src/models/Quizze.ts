import { Model, DataTypes, Optional } from 'sequelize'
import { database } from 'src/database/index.js'


export interface QuizzFileAttributes {
  id: number
  question: string
  courseId: number
  fileUrl: string
  answers: string
  correctAnswer: number
  serie: string
  dificuldade: string
}

export interface QuizzCreationAttributes extends Model<QuizzFileAttributes>, QuizzFileAttributes { }


export interface QuizzFileInstance extends Model<QuizzCreationAttributes>, QuizzFileAttributes {}


export const Quizz = database.define<QuizzFileInstance, QuizzFileAttributes>('Quizze', {
  id: {
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER
  },
  dificuldade: {
    allowNull: false,
    type: DataTypes.ENUM("Fácil", "Médio", "Difícil")
  },
  serie: {
    allowNull: false,
    type: DataTypes.ENUM("6º ano", "7º ano", "8º ano", "9º ano"),
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    references: { model: 'courses', key: 'id' },
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
})