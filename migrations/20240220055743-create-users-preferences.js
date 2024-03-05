'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users_preferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        reference: { model: 'users', key: 'id' },
      },
      age_preference: {
        type: Sequelize.INTEGER,
        defaultValue: 18
      },
      income_preference: {
        type: Sequelize.INTEGER
      },
      education_preference: {
        type: Sequelize.STRING
      },
      preferred_gender: {
        type: Sequelize.STRING
      },
      interests: {
        type: Sequelize.STRING
      },
      distance_preference: {
        type: Sequelize.INTEGER
      },
      additional_preferences: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users_preferences');
  }
};