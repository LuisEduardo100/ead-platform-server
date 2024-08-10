'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true
      },
      name: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      episode_id: {
        allowNull: false,
        type: Sequelize.DataTypes.INTEGER,
        references: { model: 'episodes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      file_url: {
        type: Sequelize.DataTypes.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('files')
  }
};
