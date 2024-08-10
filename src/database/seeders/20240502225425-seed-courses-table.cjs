'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const [categories] = await queryInterface.sequelize.query('SELECT id FROM categories;')
    await queryInterface.bulkInsert('courses', [
      { name: 'Matemática básica', synopsis: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', featured: true, category_id: categories[0].id, created_at: new Date(), updated_at: new Date() },
      { name: 'Geometria plana', synopsis: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', category_id: categories[0].id, created_at: new Date(), updated_at: new Date() },
      { name: 'Geometria analítica', synopsis: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', featured: true, category_id: categories[0].id, created_at: new Date(), updated_at: new Date() },
      { name: 'Química inorgânica', synopsis: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', featured: true, category_id: categories[1].id, created_at: new Date(), updated_at: new Date() },
      { name: 'Física quântica', synopsis: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', featured: true, category_id: categories[2].id, created_at: new Date(), updated_at: new Date() },
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('courses', null, {})
  }
};
