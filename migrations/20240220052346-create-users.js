'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      age: {
        type: Sequelize.INTEGER
      },
      phone_number: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      birthday: {
        type: Sequelize.STRING
      },
      profile_picture: {
        type: Sequelize.STRING
      },
      latitude: {
        type: Sequelize.STRING
      },
      longitude: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      is_verify: {
        type: Sequelize.BOOLEAN
      },
      user_activity: {
        type: Sequelize.BOOLEAN
      },
      user_activity_date: {
        type: Sequelize.DATEONLY
      },
      Profile_Completeness: {
        type: Sequelize.ENUM('1','2','3'),
        comment: '1 => step1, 2 => step 2, 3 => step 3'
      },
      profile_rating: {
        type: Sequelize.FLOAT,
        defaultValue: 100
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
    await queryInterface.dropTable('users');
  }
};