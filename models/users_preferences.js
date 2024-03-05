'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users_preferences  extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      users_preferences.belongsTo(models.users,{
        foreignKey:"user_id"
      })
    }
  }
  users_preferences .init({
    user_id:DataTypes.INTEGER,
    age_preference:DataTypes.INTEGER,
    income_preference:DataTypes.INTEGER,
    education_preference:DataTypes.STRING,
    preferred_gender:DataTypes.STRING,
    distance_preference:DataTypes.STRING,
    interests:DataTypes.STRING,
    additional_preferences:DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'users_preferences',
  });
  return users_preferences ;
};