var models  = require('../models');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

//Get all users in the system
//Specifically exclude all passwords for this
router.get('/', function(req, res) {
  models.User.findAll({attributes:['id','email','firstName','lastName', 'createdAt', 'updatedAt']}).then(function(users) {
    res.json(users);
  });
});

//Get currently logged in user
router.get('/me', function(req, res, next){
  console.log(req.user);
  if(req.user){
    console.log(req.user);
    var user = req.user;
    user.password = null;
    res.status(200).send(user);
  }
  else{
    res.status(401).send({'message':'Not authenticated'});
  }
});
//Get a user by their ID
router.get('/:id', function(req, res){
  var id = req.param('id');
  models.User.findById(id).then(function(user){
    user.password = null;
    res.json(user);
  });
});
//Delete a user by their ID.
//TODO: Add in permission Restrictions
router.delete('/:id', function(req, res){
  models.User.find({id:id}).then(function(user){
    if(!user){
      res.status(404).send({message:'User Not Found'});
      return;
    }
    else{
      user.destroy().then(function(){
        res.status(200).send({message:'Destroyed User'});
      });
    }
  })
});

//Create Users without logging them in. Useful for administrative purposes
//TODO: Add in permission restrictions
router.post('/create', function(req, res){
  models.User.create({
      username:req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: models.User.hashPassword(req.body.password)
    })
    .then(function(){
      models.User
        .findOrCreate({where:{username:req.body.username}})
        .spread(function(user, created){
          console.log(user.get({
            plain:true
          }));
          delete user.password;
          res.json(user);
          console.log(created);
        });
    })
    .catch(function(err){
      console.log(err);
      res.status(500).send({message:'Error Creating the User'});
    });
});
//Register a user
//Registers and logs in a new user
router.post('/register', function(req, res, next){
  passport.authenticate('local-signup', function(err, user, info){
    if(err){
      return res.status(400).send({message:'Error Creating User', error:err});
    }
    if(!user){
      return res.status(400).send(info);
    }
    else{
      req.logIn(user, function(err){
        if(err){
          return next(err);
        }
        var createdUser = req.user;
        createdUser.password = '';
        return res.status(201).send(createdUser);
      });
    }
  })(req, res, next);
});
module.exports = router;
