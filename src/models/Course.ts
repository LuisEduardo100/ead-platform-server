import { database } from '../database/index.js'
import { DataTypes, Model, Optional } from 'sequelize'
import { Category } from './Category.js'


export interface Course {
    id: number
    name: string
    featuredName: string
    synopsis: string
    thumbnailUrl: string
    featuredImage: string
    featured: boolean
    categoryId: number

}

export interface CourseCreationAttributes extends Optional<Course, 'id' | 'thumbnailUrl' | 'featured' > {}

export interface CourseInstance extends Model<Course, CourseCreationAttributes>, Course {
    Episodes: any;
    watchStatus: any;
}

export const Course = database.define<CourseInstance, Course>('Course', {
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