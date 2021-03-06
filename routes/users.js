var models  = require('../models');
var express = require('express');
var router  = express.Router();
var passport = require('passport');

var User = models.User;
var UserRole = models.UserRole;
//Get all users in the system
//Specifically exclude all passwords for this
router.get('/', function(req, res) {
  User.findAll({attributes:['id','email','firstName','lastName', 'createdAt', 'updatedAt']}).then(function(users) {
    res.json(users);
  });
});

//Get currently logged in user
router.get('/me', function(req, res, next){
  if(req.user){
    var user = req.user;
    user.password = null;
    res.status(200).send(user);
  }
  else{
    res.status(401).send({'message':'Not authenticated'});
  }
});

router.put('/me', function(req, res, next){
  User.update(
    {
      email:req.body.email,
      firstName:req.body.firstName,
      lastName: req.body.lastName
    },
    {
      where:{
        id:req.body.id
      }
    }
  ).then(function(affectedRows){
    console.log('Updated: '+affectedRows);
    return res.status(200).send({message:'Updated : '+affectedRows+' records'});
  })
  .catch(function(err){
    console.log('ERROR: '+err);
    res.status(500).send({message:'Error updating records'});
  });
});
//Get a user by their ID
router.get('/:id', function(req, res){
  var id = req.param('id');
  User.findById(id).then(function(user){
    user.password = null;
    res.json(user);
  });
});
//Delete a user by their ID.
//TODO: Add in permission Restrictions
router.delete('/:id', function(req, res){
  User.find({id:id}).then(function(user){
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

router.get('/:id/roles', function(req,res,next){
  User.findById(req.params.id, {include:[UserRole]})
  .then(function(result){
    res.status(200).json(result);
  });
});

router.post('/:id/roles', function(req, res, next){
  if(!req.body.id){
    return res.status(400).send({message:'Must post a Role to assign to this User'});
  }
  User.findById(req.params.id, {include:[UserRole]})
    .then(function(user){
      for(var x = 0; x < user.UserRoles.length; x++){
        if(user.UserRoles[x].RoleId === req.body.id){
          return res.status(400).send({message:'User already has this role assigned to them'});
        }
      }
      models.Role.findById(req.body.id)
        .then(function(role){
          UserRole.create({UserId:user.id, RoleId:req.body.id, name: role.name})
          .then(function(role){
            user.UserRoles.push(role);
            res.status(200).send(user);
          });
        });
    })
    .catch(function(err){
      console.log(err);
      res.status(400).send(err);
    });
});

router.delete('/:id/roles/:roleId', function(req, res, next){
  if(!req.params.id || !req.params.roleId){
    return res.status(400).send({message:'Must Provide ID\'s for user and role'});
  }
  UserRole.find({where:{UserId:req.params.id, RoleId:req.params.roleId}})
    .then(function(role){
      role.destroy()
      .then(function(){
        User.findById(req.params.id, {include:[UserRole]})
          .then(function(user){
            res.status(200).send(user);
          });
      });
    })
    .catch(function(err){
      console.log(err);
      res.status(400).send(err);
    });
});
//Create Users without logging them in. Useful for administrative purposes
//TODO: Add in permission restrictions
router.post('/create', function(req, res){
  User.create({
      username:req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: User.hashPassword(req.body.password)
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
        var key = "password";
        createdUser.password = undefined;
        delete createdUser[key];
        console.log(createdUser.password);
        return res.status(201).json(createdUser);
      });
    }
  })(req, res, next);
});

//Logout a user
router.post('/logout', function(req, res, next){
  req.logOut();
  res.status(200).send({message:'Successfully Logged out User'});
});

router.post('/login', function(req, res, next){
		passport.authenticate('local-login', function(err, user, info){
    console.log('Authenticating');
    if(err){
      console.log(err);
      return res.status(500).send({message:"Error logging in user"});
    }
    if(!user){
      return res.status(403).send({message:"Invalid Username/password"});
    }
    console.log('Getting full user');
    User.findById(user.id, {include:[UserRole]})
      .then(function(usr){
        console.log('LOGIN: '+JSON.stringify(usr));
        req.logIn(usr, function(err){
          if(err){
            return res.status(500).send({message:'Error Getting User Information'});
          }
          usr.password = undefined;
          delete usr.password;
          res.cookie('user', usr, {httpOnly:false});
          console.log('logged in user');
          return res.status(200).send(usr);
        });
      })
      .catch(function(err){
        return res.status(400).send({message:'Error logging in User'});
      });
  })(req, res, next);
});
module.exports = router;
