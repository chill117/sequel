var Sequel = require('../../../..')
var drivers = require('../../../drivers')
var connection = drivers.mysql.sequel.db.connection

module.exports = new Sequel({driver: 'mysql'}, connection)