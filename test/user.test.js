var should = require('chai').should(),
  expect = require('chai').expect,
  assert = require('assert'),
  request=require('supertest'),
  models = require('../models');

describe('API', function(){

  before(function(done){
    models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(function(){
        return models.sequelize.sync({ force: true });
    })
    .then(function(){
        return models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
    })
    .then(function(){
      done();
    });
  });

  var url = request.agent('http://localhost:3000');

  var user = {
    email:'test@user.com',
    password:'password',
    firstName:'Test',
    lastName:'User'
  };

  describe('User', function(){

    it('should not have an authenticated session. Returns 401', function(done){
      url
        .get('/api/users/me')
        .expect(401)
        .end(function(err, res){
          res.status.should.equal(401);
          done();
        });
    });
    it('should create a new user and log it in. Returns 201', function(done){
        url
          .post('/api/users/register')
          .send(user)
          .end(function(err, res){
            res.status.should.equal(201);
            res.body.email.should.equal(user.email);
            res.body.firstName.should.equal(user.firstName);
            res.body.lastName.should.equal(user.lastName);
            res.body.should.not.include.keys('password');
            user = res.body;
            done();
          })
    });
    it('should be able to get the newly registered and logged in user. Returns 200', function(done){
      url
        .get('/api/users/me')
        .end(function(err, res){
          res.status.should.equal(200);
          res.body.email.should.equal(user.email);
          res.body.firstName.should.equal(user.firstName);
          res.body.lastName.should.equal(user.lastName);
          //res.body.should.not.have.key('password');
          done();
        })
    });
    it('should be able to edit the currently logged in user as the currently logged in user. Returns 200', function(done){
      user.firstName = 'test2';
      user.email = 'test2@user.com';
      url
        .put('/api/users/me')
        .send(user)
        .end(function(err, res){
          url
          .get('/api/users/me')
          .end(function(err, res){
            res.status.should.equal(200);
            (res.body).email.should.equal(user.email);
            (res.body).firstName.should.equal(user.firstName);
            (res.body).lastName.should.equal(user.lastName);
            done();
          })
        })
    });
    it('should not be able to create a user with the same email twice. Returns 400', function(done){
      url
        .post('/api/users/register')
        .send(user)
        .end(function(err, res){
            res.status.should.equal(400);
            done();
        })
    });
    it('should be able to log out the current user. Returns 200', function(done){
      url
        .post('/api/users/logout')
        .end(function(err, res){
          res.status.should.equal(200);
          done();
        })
    });
    it('should no longer get a user when getting /api/me. Returns 401', function(done){
      url
        .get('/api/users/me')
        .end(function(err, res){
          res.status.should.equal(401);
          done();
        });
    });
  });
})
