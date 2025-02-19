"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("courses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      secondary_name: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      code: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING,
      },
      featured_name: {
        type: Sequelize.DataTypes.STRING,
      },
      synopsis: {
        allowNull: false,
        type: Sequelize.DataTypes.TEXT,
      },
      serie: {
        allowNull: false,
        type: Sequelize.DataTypes.ENUM(
          "6º ano",
          "7º ano",
          "8º ano",
          "9º ano",
          "1º ano",
          "2º ano",
          "3º ano"
        ),
      },
      thumbnail_url: {
        type: Sequelize.DataTypes.STRING,
      },
      featured_image: {
        type: Sequelize.DataTypes.STRING,
      },
      featured: {
        defaultValue: false,
        type: Sequelize.DataTypes.BOOLEAN,
      },
      category_id: {
        allowNull: false,
        type: Sequelize.DataTypes.INTEGER,
        references: { model: "categories", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("courses");
  },
};
