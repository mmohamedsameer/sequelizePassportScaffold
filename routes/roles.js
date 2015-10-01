var models  = require('../models');
var express = require('express');
var router  = express.Router();

var Role = models.Role;

router.get('/', function(req, res, next){
  Role.findAll()
    .then(function(roles){
      res.json(roles);
    });
});

router.post('/', function(req, res, next){
  Role.create({
    name:req.body.name
  })
  .then(function(result){
    res.status(201).json(result);
  })
  .catch(function(err){
    console.log(err);
    res.status(400).json(err);
  });
});

router.get('/:id', function(req, res, next){
  Role.findById(req.param.id)
    .then(function(role){
      res.json(role);
    });
});

module.exports = router;
