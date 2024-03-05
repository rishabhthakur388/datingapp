'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      users.hasOne(models.users_preferences,{
        foreignKey:"user_id"
      })
      users.hasOne(models.user_interactions,{
        foreignKey:"user_id"
      })
      users.hasOne(models.user_interactions,{
        foreignKey:"target_user_id"
      })
      users.hasOne(models.matched_user,{
        foreignKey:"user_id"
      })
      users.hasOne(models.matched_user,{
        foreignKey:"target_user_id"
      })
    }
  }
  users.init({
    username: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    age: DataTypes.INTEGER,
    address: DataTypes.STRING,
    gender: DataTypes.STRING,
    birthday: DataTypes.STRING,
    profile_picture: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    is_verify: DataTypes.BOOLEAN,
    Profile_Completeness:DataTypes.ENUM('1','2','3'),
    profile_rating: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};