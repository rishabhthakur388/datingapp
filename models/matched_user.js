'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class matched_user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      matched_user.belongsTo(models.users,{
        foreignKey:"id"
      });
    }
  }
  matched_user.init({
    user_id: DataTypes.INTEGER,
    target_user_id: DataTypes.INTEGER,
    is_matched: DataTypes.BOOLEAN,
    is_notresponed: DataTypes.BOOLEAN,
    is_inactive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'matched_user',
  });
  return matched_user;
};