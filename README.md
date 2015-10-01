# SequelizePassportScaffold

## What it is
This is a Scaffold for a MySQL, Express, NodeJS API with passport used for authentication and Sequelize used for ORM.

## Usage
`$ git clone https://github.com/Daimonos/sequelizePassportScaffold`

`$ cd sequelizePassportScaffold`

`$ npm install`

#### For Tests
** Note: ** Running tests force-syncs serialize. The database for the current configuration WILL BE rebuilt on test run. Ensure that youre NODE_ENV is set to the test environment as is described in `config\config.json`

You can do this by running:
* Windows: `$ set $NODE_ENV=test && npm start`
* Linux: `$ NODE_ENV=test npm start`

Currently you need two terminals for testing. One for running the server and one for running the tests. (This is sso you can see console prints and not have them interfere with test outputs).
In terminal 1 run based on the above distribution explanations then you can enter

`$ mocha`



## License
MIT -- Use it as you please
