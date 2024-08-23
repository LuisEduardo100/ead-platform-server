'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quizzes', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER
      },
      dificuldade: {
        allowNull: false,
        type: Sequelize.DataTypes.ENUM("Fácil", "Médio", "Díficil"),
        defaultValue: "Médio"
      },
      order: {
        allowNull: false,
        type: Sequelize.DataTypes.INTEGER
      },
      serie: {
        allowNull: false,
        type: Sequelize.DataTypes.ENUM("6º ano", "7º ano", "8º ano", "9º ano"),
        defaultValue: "6º ano"
      },
      question: {
        allowNull: false,
        type: Sequelize.DataTypes.TEXT
      },
      answers: {
        allowNull: false,
        type: Sequelize.DataTypes.ARRAY(DataTypes.TEXT)
      },
      correct_answer: {
        allowNull: false,
        type: Sequelize.DataTypes.INTEGER
      },
      file_url: {
        type: Sequelize.DataTypes.STRING
      },
      course_id: {
        allowNull: false,
        type: Sequelize.DataTypes.INTEGER,
        references: { model: 'courses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at:{
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at:{
        allowNull: false,
        type: Sequelize.DATE
      } 
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('quizzes')
  }
};
