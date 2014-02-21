var Sequel = require('../../../index.js')
var config = require('../../config/database')

module.exports = new Sequel(config.mysql)