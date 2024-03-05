'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_interactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_interactions.belongsTo(models.users,{
        foreignKey:"id"
      })
    }
  }
  user_interactions.init({
    user_id: DataTypes.INTEGER,
    target_user_id: DataTypes.INTEGER,
    user_action: DataTypes.ENUM('0', '1', '2'),
    traget_user_action:DataTypes.ENUM('0', '1', '2'),
    is_reported: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'user_interactions',
  });
  return user_interactions;
};