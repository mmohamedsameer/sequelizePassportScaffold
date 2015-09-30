var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  res.status(200).send({message:'We are live'});
});
module.exports = router;
