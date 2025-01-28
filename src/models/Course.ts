import { database } from '../database/index.js'
import { DataTypes, Model, Optional } from 'sequelize'
import { Category } from './Category.js'


export interface CourseType {
    id: number
    name: string
    featuredName: string
    synopsis: string
    serie: string
    thumbnailUrl: string
    featuredImage: string
    featured: boolean
    categoryId: number
}

export interface CourseCreationAttributes extends Optional<CourseType, 'id' | 'thumbnailUrl' | 'featured' > {}

export interface CourseInstance extends Model<CourseType, CourseCreationAttributes>, CourseType {
    Episodes: any;
    watchStatus: any;
}

export const Course = database.define<CourseInstance, CourseType>('Course', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    featuredName: {
      type: DataTypes.STRING
    },
    synopsis: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    serie: {
      allowNull: false,
      type: DataTypes.ENUM("6º ano", "7º ano", "8º ano", "9º ano"),
    },
    thumbnailUrl: {
      type: DataTypes.STRING
    },
    featuredImage: {
      type: DataTypes.STRING
    },
    featured: {
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
    categoryId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: Category, key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    }
  })