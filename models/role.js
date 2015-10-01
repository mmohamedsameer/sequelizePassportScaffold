"use strict";

module.exports = function(sequelize, DataTypes) {
  var Role = sequelize.define("Role", {
    name:{
      type: DataTypes.STRING,
      allowNull:false,
      unique:true
    }
  },{
    associate: function(models){
      Role.hasMany(models.UserRole, {
        foreignKey:{
          allowNull:false
        }
      })
    }
  });
  return Role;
}
