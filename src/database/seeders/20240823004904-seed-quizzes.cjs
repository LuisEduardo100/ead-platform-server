'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [courses] = await queryInterface.sequelize.query('SELECT id FROM courses;')
    await queryInterface.bulkInsert('quizzes', [
      { questions: 'Matemática básica', answers: ['Lorem ipsum dolor sit amet,', 'consectetur adipiscing elit, sed do eiusmod tempor inc', 'ididunt ut labore et dolore magna aliqua.'], correct_answers: 1, course_id: courses[0].id },
      { questions: 'Matemática básica', answers: ['Lorem ipsum dolor sit amet,', 'consectetur adipiscing elit, sed do eiusmod tempor inc', 'ididunt ut labore et dolore magna aliqua.'], correct_answers: 1, course_id: courses[1].id },
      { questions: 'Matemática básica', answers: ['Lorem ipsum dolor sit amet,', 'consectetur adipiscing elit, sed do eiusmod tempor inc', 'ididunt ut labore et dolore magna aliqua.'], correct_answers: 1, course_id: courses[2].id },
      { questions: 'Matemática básica', answers: ['Lorem ipsum dolor sit amet,', 'consectetur adipiscing elit, sed do eiusmod tempor inc', 'ididunt ut labore et dolore magna aliqua.'], correct_answers: 1, course_id: courses[1].id },
    ])
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('quizzes', null, {})
  }
};