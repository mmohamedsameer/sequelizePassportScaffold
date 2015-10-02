var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  models = require('../models');

module.exports = function(passport){

  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
      models.User.findById(id).then(function(user) {
          done(null, user);
      })
      .catch(function(err){
        done(err, null);
      });
  });

  passport.use('local-login',
    new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, email, password, done) {
      console.log('finding user');
      models.User.findOne({where:{email:email}, include:[models.UserRole]})
        .then(function(user){
          if (!user){
            console.log('User does not exist');
            return done(null, false);
          }
          console.log(user);
          models.User.validPassword(password, user.password, function(res){
            console.log(res);
            if(res){
              return done(null, user);
            }
            else {
              return done(null, false);
            }
          });
        })
        .catch(function(err){
          console.log('ERROR: '+err);
          return done(null, false);
        });
      }
    )
  );

  passport.use('local-signup', new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
  },
  function(req, email, password, done) {
      process.nextTick(function() {
      models.User.find({where:{email:email }})
      .then(function(user){
        if (user) {
          console.log('User exists');
          console.log(user);
          return done('User Exists', false);
        }
        else {
          models.User.create({
            email:email,
            password:models.User.hashPassword(password),
            firstName:req.body.firstName,
            lastName:req.body.lastName
          }).then(function(){
            models.User.findOne({where:{email:email}})
            .then(function(user){
              console.log('Found User');
              return done(null, user);
            })
            .catch(function(err){
              console.log(err);
              return done(null, false);
            })
          });
        }
      })
      .catch(function(err){
        return done('Could not create User', false);
      });
    });
  }));
}
