var Sequel = require('../../../..')
var drivers = require('../../../drivers')
var database = drivers.sqlite.sequel.db.database

module.exports = new Sequel({driver: 'sqlite'}, database)