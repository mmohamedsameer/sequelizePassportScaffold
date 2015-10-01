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
  describe('UserRole & Role', function(){
    var role = {
      name:'TEST_ROLE'
    };
    var secondRole = {
      name:'SECOND_ROLE'
    };
    it('should get an empty list of roles. Returns 200', function(done){
      url
        .get('/api/roles')
        .end(function(err, res){
          res.status.should.equal(200);
          res.body.length.should.equal(0);
          done();
        })
    });

    it('should create a new role. Returns 201', function(done){
      url
        .post('/api/roles')
        .send(role)
        .end(function(err, res){
          res.status.should.equal(201);
          res.body.name.should.equal(role.name);
          role.id = res.body.id;
          done();
        });
    });

    it('should not be able to create a role with the same name. Returns 400', function(done){
      url
        .post('/api/roles')
        .send(role)
        .end(function(err, res){
          res.status.should.equal(400);
          done();
        });
    });

    it('should get a list of only 1 role. Returns 200', function(done){
      url
        .get('/api/roles')
        .end(function(err, res){
          res.status.should.equal(200);
          res.body.length.should.equal(1);
          done();
        });
    });

    it('should be able to post a new role. Returns 201', function(done){
      url
        .post('/api/roles')
        .send(secondRole)
        .end(function(err, res){
          res.status.should.equal(201);
          res.body.name.should.equal(secondRole.name);
          secondRole.id = res.body.id;
          done();
        });
    });
    it('should be able to add a role to a user. Returns 200', function(done){
      url
        .post('/api/users/'+user.id+'/roles')
        .send(role)
        .end(function(err, res){
          res.status.should.equal(200);
          res.body.UserRoles.length.should.equal(1);
          done();
        });
    });
    it('should not be able to add the same role to a user twice. Returns 400', function(done){
      url
        .post('/api/users/'+user.id+'/roles')
        .send(role)
        .end(function(err, res){
          res.status.should.equal(400);
          done();
        });
    });
    it('should be able to add another role to the user. Returns 200', function(done){
      url
        .post('/api/users/'+user.id+'/roles')
        .send(secondRole)
        .end(function(err, res){
          res.status.should.equal(200);
          res.body.UserRoles.length.should.equal(2);
          done();
        });
    });
  it('should be able to remove role from the user. Returns 200', function(done){
    url
      .delete('/api/users/'+user.id+'/roles/'+role.id)
      .end(function(err, res){
        res.status.should.equal(200);
        res.body.UserRoles.length.should.equal(1);
        done();
      });
    });
  it('should be able to remove the other role from the user. Returns 200', function(done){
    url
      .delete('/api/users/'+user.id+'/roles/'+secondRole.id)
      .end(function(err, res){
        res.status.should.equal(200);
        res.body.UserRoles.length.should.equal(0);
        done();
      });
    });
  });
});
