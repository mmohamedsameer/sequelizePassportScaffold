"use strict";
var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true
    },
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models){
        User.hasMany(models.UserRole, {
          onDelete:"CASCADE",
          foreignKey:{
            allowNull:false
          }
        });
      },
      hashPassword: function(password){
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
      },
      validPassword: function(password, done){
        return bcrypt.compare(password, this.password, function(err, res){
          return done(err, res);
        });
      }
    }
  });

  return User;
};
