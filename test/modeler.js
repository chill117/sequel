var DbModeler = require('../index.js')
var options = require('./config/database')

module.exports = new DbModeler(options)