"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [categories] = await queryInterface.sequelize.query(
      "SELECT id FROM categories;"
    );
    await queryInterface.bulkInsert("courses", [
      {
        name: "Matemática básica",
        secondary_name: "Operações básicas",
        code: "AZB212T",
        serie: "6º ano",
        synopsis:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        featured: true,
        category_id: categories[0].id,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Geometria plana",
        serie: "7º ano",
        secondary_name: "Operações básicas",
        code: "AZB212T",
        synopsis:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        category_id: categories[0].id,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Geometria analítica",
        serie: "8º ano",
        secondary_name: "Operações básicas",
        code: "AZB212T",
        synopsis:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        featured: true,
        category_id: categories[0].id,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Química inorgânica",
        serie: "9º ano",
        secondary_name: "Operações básicas",
        code: "AZB212T",
        synopsis:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        featured: true,
        category_id: categories[1].id,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Física quântica",
        serie: "1º ano",
        secondary_name: "Operações básicas",
        code: "AZB212T",
        synopsis:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        featured: true,
        category_id: categories[2].id,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Física quântica",
        serie: "2º ano",
        secondary_name: "Operações básicas",
        code: "AZB212T",
        synopsis:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        featured: true,
        category_id: categories[2].id,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Física quântica",
        serie: "3º ano",
        secondary_name: "Operações básicas",
        code: "AZB212T",
        synopsis:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        featured: true,
        category_id: categories[2].id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});
  },
};
