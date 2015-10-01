"use strict";

module.exports = function(sequelize, DataTypes){
  var UserRole = sequelize.define("UserRole", {
  },
  {
    classMethods: {
      associate : function(models){
        UserRole.belongsTo(models.User, {
          foreignKey:{
            allowNull:false
          }
        });
        UserRole.belongsTo(models.Role, {
          foreignKey:{
            allowNull:false
          }
        });
      }
    }
  });
  return UserRole
}
