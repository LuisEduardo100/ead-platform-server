'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER
      },
      serie: {
        allowNull: false,
        type: Sequelize.DataTypes.ENUM('6º ano', '7º ano', '8º ano', '9º ano')
      },
      first_name: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING
      },
      profile_image: {
        type: Sequelize.DataTypes.STRING
      },
      last_name: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING
      },
      phone: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING
      },
      birth: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.DataTypes.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING
      },
      role: {
        allowNull: false,
        type: Sequelize.DataTypes.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      latest_invoice_id: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      email_confirmed: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
      },
      confirmation_token: {
        allowNull: true,
        type: Sequelize.DataTypes.STRING,
      },
      has_full_access: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
      },
      subscription_id: { 
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      stripe_customer_id: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      session_id: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      },
      subscription_status: { 
        type: Sequelize.DataTypes.ENUM('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive'),
        defaultValue: 'inactive'
      },
      subscription_start_date: { 
        type: Sequelize.DATE,
        allowNull: true
      },
      subscription_renewal_date: { 
        type: Sequelize.DATE,
        allowNull: true
      },
      subscription_canceled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      payment_method: { 
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users')
  }
};