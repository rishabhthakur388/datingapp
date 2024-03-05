'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_interactions', {
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
      target_user_id: {
        type: Sequelize.INTEGER,
        reference: { model: 'users', key: 'id' },
      },
      user_action: {
        type: Sequelize.ENUM('0','1','2'),
        comment: '0 => deslike, 1 => like, 2 => superlike'
      },
      traget_user_action: {
        type: Sequelize.ENUM('0','1','2'),
        comment: '0 => deslike, 1 => like, 2 => superlike'
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
    await queryInterface.dropTable('user_interactions');
  }
};