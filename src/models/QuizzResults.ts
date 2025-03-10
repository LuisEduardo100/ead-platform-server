import { DataTypes, Model, Optional } from "sequelize";
import { database } from "../database/index.js";
import { Episode } from "./Episode.js";


interface QuizzResultAttributes {
    userId: number,
    episodeId: number,
    score: number,
    createdAt: Date,
}

export interface QuizzResultInstance extends Model<QuizzResultAttributes>, QuizzResultAttributes { }

export const QuizzResult = database.define<QuizzResultInstance, QuizzResultAttributes>('Result', {
    userId: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    episodeId: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        references: { model: 'episodes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    score: {
        allowNull: false,
        type: DataTypes.INTEGER,
    }, 
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE
    },
}, {
    tableName: "quizzResult"
})