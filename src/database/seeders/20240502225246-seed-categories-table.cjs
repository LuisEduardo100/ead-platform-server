'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      { name: 'Matemática', position: 1, created_at: new Date(), updated_at: new Date() },
      { name: 'Física', position: 2, created_at: new Date(), updated_at: new Date() },
      { name: 'Química', position: 3, created_at: new Date(), updated_at: new Date() },
    ], {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {})
  }
};